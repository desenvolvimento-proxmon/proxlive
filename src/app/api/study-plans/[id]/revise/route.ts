import { NextResponse } from "next/server";
import {
  OpenAIAPIError,
  OpenAIConfigError,
  OpenAIJsonError,
  reviseStudyPlanWithOpenAI
} from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { serializeStudyPlan } from "@/lib/study-plan-serializer";
import { parseAiStudyPlan, parseJsonArray } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      userId?: string;
      changeRequest?: string;
    };
    const changeRequest = body.changeRequest?.trim();

    if (!body.userId) {
      return NextResponse.json({ error: "Informe o usuario." }, { status: 400 });
    }

    if (!changeRequest) {
      return NextResponse.json({ error: "Descreva a alteracao desejada no plano." }, { status: 400 });
    }

    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Cronograma nao encontrado." }, { status: 404 });
    }

    if (studyPlan.userId !== body.userId) {
      return NextResponse.json({ error: "Voce nao tem acesso a este cronograma." }, { status: 403 });
    }

    const revisedPlan = await reviseStudyPlanWithOpenAI({
      changeRequest,
      userName: studyPlan.user.name ?? studyPlan.user.email.split("@")[0],
      objective: studyPlan.objective,
      deadline: studyPlan.deadline.toISOString(),
      subjects: parseJsonArray(studyPlan.subjects),
      level: studyPlan.level,
      preference: studyPlan.preference,
      aiResponse: parseAiStudyPlan(studyPlan.aiResponse),
      completedSessions: parseJsonArray(studyPlan.completedSessions)
    });

    const updatedPlan = await prisma.studyPlan.update({
      where: { id },
      data: {
        aiResponse: JSON.stringify(revisedPlan),
        completedSessions: "[]"
      }
    });

    const savedQuestion = await prisma.planQuestion.create({
      data: {
        userId: body.userId,
        studyPlanId: id,
        question: `Alterar plano: ${changeRequest}`,
        answer: "Plano alterado e salvo com uma nova estrutura gerada pela IA."
      }
    });

    return NextResponse.json({
      studyPlan: serializeStudyPlan(updatedPlan),
      question: {
        ...savedQuestion,
        createdAt: savedQuestion.createdAt.toISOString()
      }
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
        { error: "A IA nao retornou uma nova versao valida do plano. Tente detalhar melhor a alteracao." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Nao foi possivel alterar o plano agora." },
      { status: 500 }
    );
  }
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
