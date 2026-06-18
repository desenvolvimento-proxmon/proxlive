import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha para continuar." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail valido." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
        createdAt: user.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Nao foi possivel identificar o usuario agora." },
      { status: 500 }
    );
  }
}
