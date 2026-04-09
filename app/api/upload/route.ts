import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { authService } from '@/service/auth-service';
import { messageService } from '@/service/message-service';
import { fileService } from '@/service/file-service';
import { handleError } from '@/lib/utils';

const BUCKET = 'chat-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const messageId = formData.get('messageId');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    if (typeof messageId !== 'string' || !messageId) {
      return NextResponse.json({ error: 'messageId обязателен' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой' }, { status: 400 });
    }

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'text/plain',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Неподдерживаемый тип файла' }, { status: 400 });
    }

    const userId = await authService.getUser();
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const message = await messageService.getMessageById(messageId);

    if (!message) {
      return NextResponse.json({ error: 'Сообщение не найдено' }, { status: 404 });
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop() : '';
    const safeName = file.name.replace(/[^\p{L}\p{N}._-]+/gu, '-');
    const path = `${userId}/${message.chat_id}/${messageId}/${randomUUID()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storageFile = await fileService.uploadFile({
        path,
        type: file.type,
        buffer
    });

    // const kind = file.type.startsWith('image/')
    //   ? 'image'
    //   : file.type === 'text/plain'
    //   ? 'text'
    //   : file.type === 'application/pdf'
    //   ? 'pdf'
    //   : 'document';

    const fileInTable = await fileService.insertToFileTable({
        message_id: messageId,
        bucket: BUCKET,
        original_name: file.name,
        storage_path: path,
        type: file.type
    });

    return NextResponse.json({ fileInTable });
  } catch (e) {
    return handleError(e); 
  }
}