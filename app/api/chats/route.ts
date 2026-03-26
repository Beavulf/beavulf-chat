import { NextResponse, NextRequest } from "next/server";
import { chatService } from "@/app/service/chat-service";

export async function GET() {
    const chats = await chatService.getAllChats();
    return NextResponse.json(chats);
}

export async function POST(request: NextRequest) {
    const { title } = await request.json();
    const userId = request.cookies.get('userId')?.value;
    if (!userId) {
        return NextResponse.json({ error: "userId cookie required" }, { status: 400 });
    }
    const newChat = await chatService.createChatForUser(title, userId);
    return NextResponse.json(newChat);
}