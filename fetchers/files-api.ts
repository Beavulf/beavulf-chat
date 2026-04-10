import { API_CONFIG } from "@/config/api-config";
import { isResOk } from "@/lib/utils";

export async function uploadAttachment({ file }:{ file: File }): Promise<{url: string; name: string; type: string; path: string}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(API_CONFIG.FILES.UPLOAD, {
    method: 'POST',
    body: formData,
  });

  isResOk(res);
  const { file: uploaded } : { file: {url: string; name: string; type: string; path: string} } = await res.json();

  return uploaded;
}