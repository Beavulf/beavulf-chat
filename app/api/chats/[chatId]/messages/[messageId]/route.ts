import { NextResponse, NextRequest } from "next/server";
import { messageService } from "@/service/message-service";
import { handleError, isUuidV4 } from "@/lib/utils";

export async function PATCH(
    req: NextRequest,
    { params } : { params: Promise<{messageId: string}> }
): Promise<NextResponse> {
    try {
        const { messageId } = await params;
        isUuidV4(messageId);

        const { content } : {content: string} = await req.json();

        if (typeof content !== 'string') {
            return NextResponse.json(
                { error: "Контент сообщения должен быть строкой" },
                { status: 400 }
            );
        }

        if (!content?.trim()) {
            return NextResponse.json(
                { error: "Контент сообщения не может быть пустым" },
                { status: 400 }
            );
        }

        if (content.length > 1000) {
            return NextResponse.json(
                { error: "Текст сообщения не должен превышать 1000 символов" },
                { status: 400 }
            );
        }

        await messageService.updateMessageById(messageId, content);
        return new NextResponse(
            null, 
            { status: 201 }
        );
    }
    catch(e) {
        return handleError(e); 
    }
}