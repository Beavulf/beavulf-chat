import { NextResponse, NextRequest } from "next/server";
import { messageService } from "@/service/message-service";
import { handleError } from "@/lib/utils";

export async function PATCH(
    req: NextRequest,
    { params } : { params: Promise<{messageId: string}> }
) {
    try {
        const { messageId } = await params;
        const { content } : {content: string} = await req.json();

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