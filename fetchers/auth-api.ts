import { isResOk } from "@/lib/utils";
import { API_CONFIG } from "@/config/api-config";
import type { TAuthSessionResponse } from "@/types/auth-types";
import type { User } from "@supabase/supabase-js";

// проверка на авторизацию, возврат пользователя и типа авторизации user | anon
export async function checkAuthSession(): Promise<TAuthSessionResponse> {
  const res = await fetch(API_CONFIG.AUTH.ENSURE_SESSION);
  await isResOk(res);
  const data = (await res.json()) as TAuthSessionResponse;

  return data;
}

// авторизация
export async function signIn(
  { email, password }: 
  { email: string, password: string }
): Promise<User> {
  const res = await fetch(API_CONFIG.AUTH.SIGN_IN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  await isResOk(res);
  const { user }:{ user: User } = await res.json();

  return user;
}

// регистрация
export async function signUp():Promise<User> {
  const res = await fetch(API_CONFIG.AUTH.SIGN_UP, {
    method: "POST",
  });
  await isResOk(res);
  const { user }:{ user: User } = await res.json();

  return user;
}

// выход
export async function signOut(): Promise<void> {
  const res = await fetch(API_CONFIG.AUTH.SIGN_OUT, {
    method: "POST",
  });
  await isResOk(res);
}