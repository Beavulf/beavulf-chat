import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AI_MODELS, type AiModels } from "@/constants/constants"
import { cn } from "@/lib/utils"

interface AiModelSelectProps {
  model: AiModels
  setModel: (model: AiModels) => void
  isPendingOrStreaming?: boolean
}

const models = [
  { label: "Grok 4.20", value: AI_MODELS.GROK as AiModels },
  { label: "Qwen 3.6+", value: AI_MODELS.QWEN as AiModels },
  { label: "GPT 5.4 Nano", value: AI_MODELS.GPT_NANO as AiModels },
  { label: "Gemini 2.5 Flash", value: AI_MODELS.GEMINI_FLASH as AiModels },
]

export function AiModelSelect({ model, setModel, isPendingOrStreaming }: AiModelSelectProps) {
  return (
    <Select
      value={model}
      onValueChange={(value: AiModels) => setModel(value)}
      disabled={isPendingOrStreaming}
    >
      <SelectTrigger className={cn(
        "rounded-2xl px-2 py-1 bg-[#252525] text-[#e3e3e3] text-xs border border-[#393939]", 
        "focus:outline-none focus:ring-1 focus:ring-[#eee] transition-colors disabled:opacity-60",
        "min-w-40 cursor-pointer"
      )}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#1c1c1c]">
        <SelectGroup >
          {models.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
