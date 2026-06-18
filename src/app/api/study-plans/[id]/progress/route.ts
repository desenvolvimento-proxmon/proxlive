import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildDatedStudyCalendar,
  normalizeCompletedCalendarSessions,
  parseAiStudyPlan,
  parseJsonArray
} from "@/lib/types";
import { serializeStudyPlan } from "@/lib/study-plan-serializer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      userId?: string;
      completedSessions?: string[];
    };

    if (!body.userId) {
      return NextResponse.json({ error: "Informe o usuario." }, { status: 400 });
    }

    if (!Array.isArray(body.completedSessions)) {
      return NextResponse.json({ error: "Informe as sessoes concluidas." }, { status: 400 });
    }

    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id }
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Cronograma nao encontrado." }, { status: 404 });
    }

    if (studyPlan.userId !== body.userId) {
      return NextResponse.json({ error: "Voce nao tem acesso a este cronograma." }, { status: 403 });
    }

    const aiResponse = parseAiStudyPlan(studyPlan.aiResponse);
    const calendar = buildDatedStudyCalendar(
      aiResponse,
      studyPlan.deadline.toISOString(),
      parseJsonArray(studyPlan.availableDays),
      studyPlan.createdAt.toISOString(),
      parseJsonArray(studyPlan.subjects),
      studyPlan.objective
    );
    const normalizedSessions = normalizeCompletedCalendarSessions(calendar, body.completedSessions);

    const updatedPlan = await prisma.studyPlan.update({
      where: { id },
      data: {
        completedSessions: JSON.stringify(normalizedSessions)
      }
    });

    return NextResponse.json({ studyPlan: serializeStudyPlan(updatedPlan) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nao foi possivel atualizar o progresso." },
      { status: 500 }
    );
  }
}
