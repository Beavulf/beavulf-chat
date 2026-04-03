import { LogIn, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BottomActions(
    props: {
        collapsed: boolean
    }
) {
    return (
        <div className={cn('border-t border-[#2f2f2f] p-3', props.collapsed && 'flex justify-center')}>
        {props.collapsed ? (
          <Link
            href="/auth/login"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#2f2f2f] transition-colors"
            title="Войти"
          >
            <User size={18} />
          </Link>
        ) : (
          <Link
            href="/auth/login"
            data-testid="link-login"
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm text-[#acacac] hover:bg-[#2f2f2f] hover:text-white transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f2f2f] border border-[#3f3f3f] shrink-0">
              <User size={15} className="text-[#8e8ea0]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#d1d1d1] truncate">Войти</span>
              <span className="text-[11px] text-[#5a5a5a] truncate">или создать аккаунт</span>
            </div>
            <LogIn size={14} className="ml-auto shrink-0 text-[#5a5a5a]" />
          </Link>
        )}
      </div>
    )
}