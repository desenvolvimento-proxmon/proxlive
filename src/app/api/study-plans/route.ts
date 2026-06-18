import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeStudyPlan } from "@/lib/study-plan-serializer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Informe o userId." }, { status: 400 });
    }

    const studyPlans = await prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      studyPlans: studyPlans.map(serializeStudyPlan)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nao foi possivel carregar o historico." },
      { status: 500 }
    );
  }
}
