import { Copy, CopyCheck } from "lucide-react"
import { CustomToolTip } from "../CustomToolTip"

export function CopyIconButton(
  {
    copied,
    handleCopy,
    iconStyle
  }:
  {
    copied: boolean,
    handleCopy: ()=>void,
    iconStyle: string
  }
) {
    
  return (
    <CustomToolTip content={copied ? 'Скопировано!' : 'Скопировать'}>
      <div
        onClick={handleCopy}
        className={iconStyle}
      >
        {copied ? <CopyCheck size={13}/> :<Copy size={13} />}
      </div>
    </CustomToolTip>
  )
}