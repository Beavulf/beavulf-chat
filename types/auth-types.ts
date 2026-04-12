import type { User } from "@supabase/supabase-js";

export type TAuthSession = 'anon' | 'user';

export type TAuthSessionResponse = {
  type: TAuthSession;
  user: User;
};