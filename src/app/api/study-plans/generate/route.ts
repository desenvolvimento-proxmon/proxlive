import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  OpenAIConfigError,
  OpenAIAPIError,
  OpenAIJsonError,
  generateStudyPlanWithOpenAI
} from "@/lib/openai";
import { LEVELS, PREFERENCES, splitSubjects, type Level, type Preference } from "@/lib/types";
import { serializeStudyPlan } from "@/lib/study-plan-serializer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateBody = {
  userId?: string;
  objective?: string;
  deadline?: string;
  subjects?: string;
  level?: Level;
  availableDays?: string[];
  hoursPerDay?: number;
  preference?: Preference;
  notes?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const validationError = validateGenerateBody(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Identifique o usuario antes de gerar o cronograma." },
        { status: 401 }
      );
    }

    const aiResponse = await generateStudyPlanWithOpenAI({
      objective: body.objective!.trim(),
      deadline: body.deadline!,
      subjects: body.subjects!.trim(),
      level: body.level!,
      availableDays: body.availableDays!,
      hoursPerDay: Number(body.hoursPerDay),
      preference: body.preference!,
      notes: body.notes?.trim() ?? "",
      userName: user.name ?? user.email.split("@")[0],
      userEmail: user.email
    });

    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        objective: body.objective!.trim(),
        deadline: new Date(`${body.deadline}T00:00:00`),
        subjects: JSON.stringify(splitSubjects(body.subjects!)),
        availableDays: JSON.stringify(body.availableDays),
        hoursPerDay: Number(body.hoursPerDay),
        level: body.level!,
        preference: body.preference!,
        aiResponse: JSON.stringify(aiResponse)
      }
    });

    if (aiResponse.recommendations.length > 0) {
      await prisma.recommendationHistory.createMany({
        data: aiResponse.recommendations.map((recommendationText) => ({
          userId: user.id,
          studyPlanId: studyPlan.id,
          recommendationText
        }))
      });
    }

    return NextResponse.json({ studyPlan: serializeStudyPlan(studyPlan) });
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
        { error: "A IA retornou uma resposta fora do formato esperado. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Nao foi possivel gerar o cronograma agora." },
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

function validateGenerateBody(body: GenerateBody) {
  if (!body.userId) return "Identifique o usuario antes de gerar o cronograma.";
  if (!body.objective?.trim()) return "Informe o objetivo do estudo.";
  if (!body.deadline) return "Informe a data da prova ou prazo final.";
  if (!body.subjects?.trim() || splitSubjects(body.subjects).length === 0) {
    return "Informe pelo menos uma materia.";
  }
  if (!body.level || !LEVELS.includes(body.level)) return "Selecione o nivel atual.";
  if (!Array.isArray(body.availableDays) || body.availableDays.length === 0) {
    return "Selecione pelo menos um dia disponivel.";
  }
  if (!body.hoursPerDay || Number(body.hoursPerDay) <= 0) {
    return "Informe quantas horas por dia voce pode estudar.";
  }
  if (!body.preference || !PREFERENCES.includes(body.preference)) {
    return "Selecione a preferencia de estudo.";
  }

  return null;
}
