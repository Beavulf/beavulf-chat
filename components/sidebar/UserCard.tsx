'use client'

import { LogIn, LogOut, User } from "lucide-react";
import { AuthDialog } from "../auth/AuthDialog";
import { useSession } from "@/hooks/use-session";
import { useAuth } from "@/hooks/use-auth";
export default function UserCard(
    { collapsed }:
    { collapsed: boolean }
) {
  const { user } = useSession();
  const { signOutUser } = useAuth();
  const isAuthenticated = !!user && !user.is_anonymous;

  const handleSignOut = async () => {
    await signOutUser.mutate();
  }

  // если свернут
  if (collapsed) {
    if (isAuthenticated) return (
      <div
        className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#2f2f2f] transition-colors"
        title={"Профиль"}
      >
        <User size={18} />
      </div>
    )
    return (
      <AuthDialog view={'login'}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#2f2f2f] transition-colors"
          title={"Войти"}
        >
          <User size={18} />
        </div>
      </AuthDialog>
    );
  }

  // если авторизован
  if (isAuthenticated) {
    return (
      <div
        data-testid="link-profile"
        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm hover:bg-[#2f2f2f] transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#406535] border border-[#5a8a4a] shrink-0">
          <User size={15} className="text-white" />
        </div>
        <div className="flex flex-col min-w-0 cursor-pointer">
            <span className="text-[13px] font-medium text-[#d1d1d1] truncate">
              {user.email}
            </span>
            <span className="text-[11px] text-[#5a8a4a] truncate">Профиль</span>
        </div>
        <LogOut 
          onClick={handleSignOut} 
          size={14} 
          className="ml-auto shrink-0 text-[#5a5a5a] cursor-pointer hover:text-white" 
        />
      </div>
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
