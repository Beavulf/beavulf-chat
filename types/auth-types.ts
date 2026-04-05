import type { User } from "@supabase/supabase-js";

export type TAuthSession = 'anon' | 'user';

export type TUserDto = {
  id: string;
  email: string | null;
  created_at: string;
  is_anonymous: boolean
};

export type TAuthSessionResponse = {
  type: TAuthSession;
  user: User;
};