import { NextResponse, NextRequest } from "next/server";
import { chatService } from "@/service/chat-service";
import { handleError } from "@/lib/utils";

export async function GET(
    {params}: {params: Promise<{chatId:string}>}
) {
    try {
        const { chatId } = await params;    

        const chat = await chatService.getChatById(chatId);
        return NextResponse.json({chat}, {status: 200})
    }
    catch(e) {
        return handleError(e); 
    }
}

// получение списка чатов авторизованного пользователя
export async function DELETE(
    {params}: {params: Promise<{chatId:string}>}
) {
    try {
        const { chatId } = await params;    

        await chatService.deleteChatById(chatId);    
        return new NextResponse(
            null,
            { status: 204 },
        )
    }
    catch(e) {
        return handleError(e); 
    }
}

// изменение имени чата
export async function PATCH(
    req: NextRequest,
    {params}: {params: Promise<{chatId:string}>}
) {
    try {
        const { chatId } = await params;    
        const { newTitle } : { newTitle: string} = await req.json();

        if (!newTitle?.trim()) {
            return NextResponse.json(
                { error: "Название не может быть пустым" },
                { status: 400 }
            );
        }

        if (newTitle.length > 100) {
            return NextResponse.json(
                {error: "Название чата не должно превышать 100 символов"}, 
                {status: 400}
            );
        }

        await chatService.renameChat(newTitle, chatId);    
        return new NextResponse(
            null,
            { status: 204 },
        )
    }
    catch(e) {
        return handleError(e); 
    }
}