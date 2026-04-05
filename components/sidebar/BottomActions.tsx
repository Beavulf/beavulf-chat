import { cn } from "@/lib/utils";
import UserCard from "./UserCard";

export default function BottomActions(
    { collapsed }:
    { collapsed: boolean }
) {
    return (
      <div className={cn('border-t border-[#2f2f2f] p-3', collapsed && 'flex justify-center')}>
          <UserCard collapsed={collapsed} />
      </div>
    )
}