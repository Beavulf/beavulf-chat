import { NextResponse, NextRequest } from "next/server";
import { chatService } from "@/service/chat-service";
import { handleError } from "@/lib/utils";
import { ERRORS_CODES } from "@/constants/constants";

// получение списка чатов авторизованного пользователя
export async function GET(): Promise<NextResponse> {
    try {
        const chats = await chatService.getChatsByUserId();    
        return NextResponse.json(
            { chats }, 
            { status: 200 }
        );
    }
    catch(e) {
        return handleError(e); 
    }
}

// создание чата для авторизованного пользователя
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { title } : { title?: string} = await req.json();

        if ( typeof title !== 'string' ) {
            return NextResponse.json(
                { error: "Название чата должно быть строкой", code: ERRORS_CODES.INVALID_TITLE },
                { status: 400 }
            );
        }
        if (title?.length && title.length > 100) {
            return NextResponse.json(
                {error: "Название чата не должно превышать 100 символов"}, 
                {status: 400}
            );
        }

        const finalTitle = title?.toString()?.trim() || "Новый чат";
        const chat = await chatService.createChat(finalTitle); 
        return NextResponse.json(
            { chat }, 
            { status: 201 }
        );
    }
    catch(e) {
        return handleError(e); 
    }
}