import { API_CONFIG } from "@/config/api-config";
import { isResOk } from "@/lib/utils";
import type { TMessageFile } from "@/types/db-types";

export async function uploadAttachment({ file }:{ file: File }): Promise<TMessageFile> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(API_CONFIG.FILES.UPLOAD, {
    method: 'POST',
    body: formData,
  });

  isResOk(res);
  const { messageFileData } : { messageFileData: TMessageFile } = await res.json();

  return messageFileData;
}

export async function createSignedUrl({fileDataId}:{fileDataId: string}): Promise<{url: string, name: string}> {
  const res = await fetch(API_CONFIG.FILES.GET.replace(':id', fileDataId),{
    method: 'POST',
  })
  isResOk(res);
  const { url, name } : { url: string, name: string } = await res.json();

  return { url, name };
}