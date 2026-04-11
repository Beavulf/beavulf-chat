// для масштабирования

import { handleError } from '@/lib/utils';
import { fileService } from '@/service/file-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const fileMessage = await fileService.getMessageFileData(id);
    if (!fileMessage) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
    }
  
    const signedUrl = await fileService.createSignedUrl(fileMessage.storage_path);
    if (!signedUrl) {
      return NextResponse.json({ error: 'Не удалось создать ссылку' }, { status: 500 });
    }
  
    return NextResponse.json(
      {
        url: signedUrl,
        name: fileMessage.original_name,
      }, 
      {status: 200}
    );
  }
  catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const fileMessage = await fileService.getMessageFileData(id);
  
    if (!fileMessage) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
    }
  
    await fileService.deleteFileInStorage(fileMessage.storage_path);
    await fileService.deleteMessageFileData(fileMessage.id);
  
    return NextResponse.json(
      { success: true }, 
      { status: 200 }
    );
  }
  catch(e) {
    return handleError(e);
  }
}