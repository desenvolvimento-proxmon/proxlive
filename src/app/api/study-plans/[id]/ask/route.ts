import { NextResponse } from "next/server";
import {
  askQuestionAboutStudyPlan,
  evaluateLastExerciseAnswerWithOpenAI,
  isShortExerciseAnswer,
  OpenAIAPIError,
  OpenAIConfigError,
  OpenAIJsonError,
  reviseStudyPlanWithOpenAI
} from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { serializeStudyPlan } from "@/lib/study-plan-serializer";
import { buildDatedStudyCalendar, parseAiStudyPlan, parseJsonArray } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Informe o usuario." }, { status: 400 });
    }

    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Cronograma nao encontrado." }, { status: 404 });
    }

    if (studyPlan.userId !== userId) {
      return NextResponse.json({ error: "Voce nao tem acesso a este cronograma." }, { status: 403 });
    }

    const questions = await prisma.planQuestion.findMany({
      where: { userId, studyPlanId: id },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({
      questions: questions.map((question) => ({
        ...question,
        createdAt: question.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nao foi possivel carregar as perguntas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      userId?: string;
      question?: string;
    };
    const questionText = body.question?.trim();

    if (!body.userId) {
      return NextResponse.json({ error: "Informe o usuario." }, { status: 400 });
    }

    if (!questionText) {
      return NextResponse.json({ error: "Escreva sua pergunta sobre o plano." }, { status: 400 });
    }

    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Cronograma nao encontrado." }, { status: 404 });
    }

    if (studyPlan.userId !== body.userId) {
      return NextResponse.json({ error: "Voce nao tem acesso a este cronograma." }, { status: 403 });
    }

    const subjects = parseJsonArray(studyPlan.subjects);
    const completedSessions = parseJsonArray(studyPlan.completedSessions);
    const aiResponse = parseAiStudyPlan(studyPlan.aiResponse);
    const completedSet = new Set(completedSessions);
    const calendarContext = buildDatedStudyCalendar(
      aiResponse,
      studyPlan.deadline.toISOString(),
      parseJsonArray(studyPlan.availableDays),
      studyPlan.createdAt.toISOString(),
      subjects,
      studyPlan.objective
    )
      .slice(0, 30)
      .map((day) => ({
        date: day.date,
        day: day.day,
        phase: day.phase,
        sessions: day.sessions.map((session) => ({
          subject: session.subject,
          topic: session.topic,
          activityType: session.activityType,
          description: session.description,
          completed: completedSet.has(session.sessionKey)
        }))
      }));
    const conversationHistory = await prisma.planQuestion.findMany({
      where: {
        userId: body.userId,
        studyPlanId: id
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        question: true,
        answer: true
      }
    });
    const userName = studyPlan.user.name ?? studyPlan.user.email.split("@")[0];
    const shouldRevisePlan = isPlanChangeRequest(questionText);
    const shouldEvaluateAnswer =
      !shouldRevisePlan && isShortExerciseAnswer(questionText) && conversationHistory.length > 0;
    let updatedStudyPlan = null;
    let answer: string;

    if (shouldRevisePlan) {
      const revisedPlan = await reviseStudyPlanWithOpenAI({
        changeRequest: questionText,
        userName,
        objective: studyPlan.objective,
        deadline: studyPlan.deadline.toISOString(),
        subjects,
        level: studyPlan.level,
        preference: studyPlan.preference,
        aiResponse,
        completedSessions
      });

      const updated = await prisma.studyPlan.update({
        where: { id },
        data: {
          aiResponse: JSON.stringify(revisedPlan),
          completedSessions: "[]"
        }
      });

      updatedStudyPlan = serializeStudyPlan(updated);
      answer = "Feito. Ajustei o cronograma com base no que voce pediu e salvei a nova versao do plano. Como a estrutura mudou, reiniciei o checklist para evitar marcar sessoes antigas por engano.";
    } else if (shouldEvaluateAnswer) {
      answer = await evaluateLastExerciseAnswerWithOpenAI({
        studentAnswer: questionText,
        userName,
        conversationHistory: conversationHistory.reverse()
      });
    } else {
      answer = await askQuestionAboutStudyPlan({
        question: questionText,
        userName,
        objective: studyPlan.objective,
        deadline: studyPlan.deadline.toISOString(),
        subjects,
        level: studyPlan.level,
        preference: studyPlan.preference,
        aiResponse,
        completedSessions,
        calendarContext,
        conversationHistory: conversationHistory.reverse()
      });
    }

    const savedQuestion = await prisma.planQuestion.create({
      data: {
        userId: body.userId,
        studyPlanId: id,
        question: questionText,
        answer
      }
    });

    return NextResponse.json({
      question: {
        ...savedQuestion,
        createdAt: savedQuestion.createdAt.toISOString()
      },
      action: shouldRevisePlan ? "plan_updated" : "answered",
      studyPlan: updatedStudyPlan
    });
  } catch (error) {
    console.error(error);

    if (error instanceof OpenAIConfigError) {
      return NextResponse.json(
        { error: "A chave OPENAI_API_KEY nao foi configurada no ambiente." },
        { status: 500 }
      );
    }

    if (error instanceof OpenAIAPIError) {
      return NextResponse.json({ error: formatOpenAIError(error) }, { status: 502 });
    }

    if (error instanceof OpenAIJsonError) {
      return NextResponse.json(
        { error: "A IA nao retornou uma resposta valida. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Nao foi possivel responder agora." },
      { status: 500 }
    );
  }
}

function isPlanChangeRequest(text: string) {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return [
    "muda",
    "mudar",
    "troca",
    "trocar",
    "alterar",
    "altera",
    "ajustar",
    "ajusta",
    "reorganizar",
    "reorganiza",
    "remanejar",
    "adaptar",
    "adapta",
    "nao vou conseguir",
    "nao consigo",
    "nao poderei",
    "focar",
    "foca",
    "coloca",
    "substitui",
    "substituir",
    "reduzir",
    "aumentar"
  ].some((term) => normalized.includes(term));
}

function formatOpenAIError(error: OpenAIAPIError) {
  if (error.status === 401) {
    return "A OpenAI recusou a chave de API. Verifique se OPENAI_API_KEY esta correta no .env e reinicie o servidor.";
  }

  if (error.status === 403) {
    return "A chave da OpenAI nao tem permissao para este projeto/modelo.";
  }

  if (error.status === 404 || error.code === "model_not_found") {
    return "O modelo configurado na OpenAI nao foi encontrado. Ajuste OPENAI_MODEL no .env ou remova essa variavel.";
  }

  if (error.status === 429 || error.code === "insufficient_quota") {
    return "A OpenAI recusou a chamada por limite ou cota insuficiente. Verifique billing/credits da conta.";
  }

  return error.message;
}
