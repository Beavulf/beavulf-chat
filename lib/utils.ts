import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AppError } from "./errors"
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleError(error: unknown) {
  
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  // непредвиденная ошибка
  console.error('[Unexpected error]', error)
  return NextResponse.json(
    { error: 'Внутренняя ошибка сервера', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

export async function isResOk(res: Response) {
  if (!res.ok) {
    const body = await res.json()
    throw Object.assign(new Error(body.error), { code: body.code })
  } 
}
