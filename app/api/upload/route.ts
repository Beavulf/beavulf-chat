import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/utils';
import { fileService } from '@/service/file-service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
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

    const messageFileData = await fileService.attachFileToMessage(messageId, file);

    return NextResponse.json(
      { messageFileData },
      { status: 200 }
    );
  } catch (e) {
    return handleError(e); 
  }
}