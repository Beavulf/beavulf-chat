import { NextResponse, NextRequest } from "next/server";
import { messageService } from "@/service/message-service";
import { handleError } from "@/lib/utils";

// получение списка сообщений чата
export async function GET(
    { params } : { params: Promise<{chatId: string}> }
) {
    try {
        const { chatId } = await params;
        const messages = await messageService.getMessagesByChatId(chatId);    
        return NextResponse.json(
            { messages }, 
            { status: 200 }
        );
    }
    catch(e) {
        return handleError(e); 
    }
}

// создание сообщения для чата по айди
export async function POST(
    req: NextRequest,
    { params } : { params: Promise<{chatId: string}> }
) {
    try {
        const { chatId } = await params;
        const { content, role } : {role: "user" | "assistant", content: string} = await req.json();
        
        if (role !== "user" && role !== "assistant") {
            return NextResponse.json(
                { error: "Некорректная роль сообщения" }, 
                { status: 400 }
            );
        }

        if (content?.length && content.length > 1000) {
            return NextResponse.json(
                { error: "Текст сообщения не должен превышать 1000 символов" }, 
                { status: 400 }
            );
        }

        const message = await messageService.createMessage(content, role, chatId);
        return NextResponse.json(
            { message }, 
            { status: 200 }
        );
    }
    catch(e) {
        return handleError(e); 
    }
}