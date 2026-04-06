import { NextResponse, NextRequest } from "next/server";
import { chatService } from "@/service/chat-service";
import { handleError } from "@/lib/utils";
import { ERRORS_CODES } from "@/constants/constants";
import { isUuidV4 } from "@/lib/utils";

// получение чата по айди
export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{chatId: string}>}
): Promise<NextResponse> {
  try {
    const { chatId }  = await params;
    isUuidV4(chatId);
    const chat = await chatService.getChatById(chatId);

    return NextResponse.json(
      {chat},
      {status: 200}
    );
  }
  catch(e) {
    return handleError(e);
  }
}

// удаление чата по айди
export async function DELETE(
  req: NextRequest,
  {params}: {params: Promise<{chatId:string}>},
): Promise<NextResponse> {
  try {
    const { chatId } = await params;   
    isUuidV4(chatId);
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
): Promise<NextResponse> {
  try {
    const { chatId } = await params;    
    isUuidV4(chatId);
    const { newTitle } : { newTitle: string} = await req.json();

    if (typeof newTitle !== 'string' ) {
      return NextResponse.json(
        { error: "Название чата должно быть строкой", code: ERRORS_CODES.INVALID_TITLE },
        { status: 400 }
      );
    }

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