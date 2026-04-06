import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AppError } from "./errors"
import { NextResponse } from "next/server";
import { validate, version } from "uuid";
import { ERRORS_CODES } from "@/constants/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// общая обработка ошибок в роутах
export function handleError(error: unknown): NextResponse {
  
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  console.error('[Unexpected error]', error)
  return NextResponse.json(
    { error: 'Внутренняя ошибка сервера', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

// проверка ответа сервера в фетч запросах
export async function isResOk(res: Response): Promise<void> {
  if (!res.ok) {
    const body = await res.json()
    throw Object.assign(new Error(body.error), { code: body.code })
  } 
}

export function isUuidV4(uuid: string): NextResponse | undefined{
  const isUuidV4 = validate(uuid) && version(uuid) === 4;

  if (!isUuidV4) {
    return NextResponse.json(
      { error: "Неверный тип ID", code: ERRORS_CODES.NOT_FOUND },
      { status: 400 }
    )
  }

  return;
}
