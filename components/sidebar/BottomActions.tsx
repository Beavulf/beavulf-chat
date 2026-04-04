import { cn } from "@/lib/utils";
import type { TAuthSessionResponse } from "@/types/auth-types";
import UserCard from "./UserCard";

export default function BottomActions(
    {
      authSessionData,
      collapsed
    }:
    {
      authSessionData: TAuthSessionResponse,
      collapsed: boolean
    }
) {
    return (
      <div className={cn('border-t border-[#2f2f2f] p-3', collapsed && 'flex justify-center')}>
          <UserCard authSessionData={authSessionData} collapsed={collapsed} />
      </div>
    )
}