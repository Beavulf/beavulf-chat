import { LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import type { TAuthSessionResponse } from "@/types/auth-types";
import { AuthDialog } from "../auth/AuthDialog";
import { API_CONFIG } from "@/config/api-config";

export default function UserCard(
    {
      authSessionData,
      collapsed
    }:
    {
      authSessionData: TAuthSessionResponse,
      collapsed: boolean
    }
) {
  const isAuthenticated = !!authSessionData?.user && !authSessionData.user.is_anonymous;

  // если свернут
  if (collapsed) {
    return (
      <AuthDialog view={isAuthenticated ? 'login' : 'login'}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#2f2f2f] transition-colors"
          title={isAuthenticated ? "Профиль" : "Войти"}
        >
          <User size={18} />
        </div>
      </AuthDialog>
    );
  }

  // если авторизован
  if (isAuthenticated) {
    const user = authSessionData.user;
    return (
      // <AuthDialog>
        <Link
          href={API_CONFIG.AUTH.SIGN_OUT}
          data-testid="link-profile"
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm hover:bg-[#2f2f2f] transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#406535] border border-[#5a8a4a] shrink-0">
            <User size={15} className="text-white" />
          </div>
          <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#d1d1d1] truncate">
                {user.email}
              </span>
              <span className="text-[11px] text-[#5a8a4a] truncate">Профиль</span>
          </div>
          <LogOut size={14} className="ml-auto shrink-0 text-[#5a5a5a]" />
        </Link>
      // </AuthDialog>
    );
  }

  // если аноним
  return (
    <AuthDialog view="login">
      <div
        data-testid="link-login"
        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm text-[#acacac] hover:bg-[#2f2f2f] hover:text-white transition-colors cursor-pointer"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f2f2f] border border-[#3f3f3f] shrink-0">
          <User size={15} className="text-[#8e8ea0]" />
        </div>
        <div className="flex flex-col min-w-0 items-start">
          <span className="text-[13px] font-medium text-[#d1d1d1] truncate">Войти (аноним)</span>
          <span className="text-[11px] text-[#5a5a5a] truncate">или создать аккаунт</span>
        </div>
        <LogIn size={14} className="ml-auto shrink-0 text-[#5a5a5a]" />
      </div>
    </AuthDialog>
  );
}
