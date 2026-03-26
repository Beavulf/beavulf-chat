'use client'

export default function ChatPage({ params }: { params: { chat_id: string } }) {
  return <div>Chat {params.chat_id}</div>
}