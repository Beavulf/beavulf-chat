import { Sidebar } from '@/components/sidebar/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function ChatsLayout(
  { children }:
  { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#212121]">
      <TooltipProvider>
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
          <Toaster />
        </main>
      </TooltipProvider>
    </div>
  )
}
