import { NextResponse } from "next/server";


export function validateEmailPass(email: string, password: string): NextResponse | null {
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email и пароль обязательны" },
      { status: 400 }
    )
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Email и пароль должны быть строками" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен быть не менее 6 символов" },
      { status: 400 }
    );
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return NextResponse.json(
      { error: "Некорректный email" },
      { status: 400 }
    );
  }

  return null;
}