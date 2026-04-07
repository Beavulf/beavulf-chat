import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatMessageMarkdown({ text, isUser }: { text: string, isUser: boolean }) {
  return (
    
    <div className={cn(
      'prose prose-neutral max-w-none dark:prose-invert',
      'rounded-2xl px-4 py-3 text-sm leading-relaxed',
      isUser
        ? 'bg-[#2f2f2f] text-white rounded-br-sm'
        : 'text-[#ececec] rounded-bl-sm'
    )}>
      <Markdown remarkPlugins={[remarkGfm]}>
        {text}
      </Markdown>
    </div>
  )
}