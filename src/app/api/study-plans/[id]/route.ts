import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeStudyPlan } from "@/lib/study-plan-serializer";

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

    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id }
    });

    if (!studyPlan) {
      return NextResponse.json({ error: "Cronograma nao encontrado." }, { status: 404 });
    }

    if (userId && studyPlan.userId !== userId) {
      return NextResponse.json({ error: "Voce nao tem acesso a este cronograma." }, { status: 403 });
    }

    return NextResponse.json({ studyPlan: serializeStudyPlan(studyPlan) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nao foi possivel carregar o cronograma." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Informe o usuario para excluir." }, { status: 400 });
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

    await prisma.studyPlan.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nao foi possivel excluir o cronograma." },
      { status: 500 }
    );
  }
}
