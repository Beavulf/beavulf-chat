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
      <Markdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // ссылки открываются в новой вкладке
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className='underline'>{children}</a>
          ),
          // стилизация блоков кода
          pre: ({ children }) => (
            <pre className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto">{children}</pre>
          ),
          // стилизация инлайн кода
          code: ({ children }) => (
            <code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded text-sm">{children}</code>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}