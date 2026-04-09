import { fileService } from '@/service/file-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const fileMessage = await fileService.getFileMessage(id);


  if (!fileMessage) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
  }

  const signedUrl = await fileService.createSignedUrl(fileMessage.storage_path);

  if (signedUrl) {
    return NextResponse.json({ error: 'Не удалось создать ссылку' }, { status: 500 });
  }

  return NextResponse.json({
    url: signedUrl,
    name: fileMessage.original_name,
  });
}