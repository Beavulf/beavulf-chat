import { AI_MODELS, LOCAL_STORAGE_ITEM, type AiModels } from "@/constants/constants";
import type { UIMessage } from "ai";

type TFile = {
  name: string;
  url: string;
  type: string;
}

export function getInitialMessageDataFromLocalStorage():{model: AiModels, attachedFile: TFile | null} {
  const model = localStorage.getItem(LOCAL_STORAGE_ITEM.LAST_MODEL) as AiModels || AI_MODELS.GROK;
  let attachedFile:TFile | null = null;
  const fileData = localStorage.getItem(LOCAL_STORAGE_ITEM.LAST_FILE);
  if (fileData) {
    attachedFile = JSON.parse(fileData);
    localStorage.removeItem(LOCAL_STORAGE_ITEM.LAST_FILE);
  }

  return {model, attachedFile};
}


export function createMessageParts(
  {model, messageText, file}:
  {model: AiModels, messageText: string, file?:TFile | null}
  ){
  const parts: UIMessage['parts'] = [];
  const metadata: UIMessage['metadata'] = {model};

  if (messageText) {
    parts.push({ type: 'text', text: messageText });
  }

  if (file) {
    parts.push({
      type: 'file',
      url: file.url,
      mediaType: file.type,
      filename: file.name,
    });
  }

  return { parts, metadata };
}