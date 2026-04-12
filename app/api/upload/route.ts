// для масштабирования

import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/utils';
import { fileService } from '@/service/file-service';
import { ALLOWED_FILE_TYPES } from '@/constants/constants';

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

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Неподдерживаемый тип файла' }, { status: 400 });
    }

    const uploaded = await fileService.uploadTempFileAndGetSignedUrl(file);

    return NextResponse.json(
      { file: uploaded },
      { status: 200 }
    );
  } catch (e) {
    return handleError(e); 
  }
}