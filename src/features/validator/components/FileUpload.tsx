import { Upload } from 'lucide-react'

import FileUploadIdlePrompt from '@/features/validator/components/FileUploadIdlePrompt'
import FileUploadReplacePrompt from '@/features/validator/components/FileUploadReplacePrompt'
import { useFileUpload } from '@/features/validator/hooks/useFileUpload'
import type { ParsedCsv } from '@/types/validator'

type Props = {
  onParsed: (result: ParsedCsv) => void
  onError: (message: string) => void
}

export default function FileUpload({ onParsed, onError }: Props) {
  const { dragging, fileName, dropZoneRef, inputRef, onBrowse, onInputChange } =
    useFileUpload({ onParsed, onError })

  return (
    <div
      ref={dropZoneRef}
      className={[
        'island-shell flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-colors',
        dragging ? 'border-(--text-link) bg-(--hero-a)' : 'border-(--line)',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="sr-only"
        aria-hidden={true}
        tabIndex={-1}
        onChange={onInputChange}
      />
      <div className="flex h-14 w-14 items-center justify-center text-(--text-link)">
        <Upload size={24} aria-hidden={true} />
      </div>
      {fileName ? (
        <FileUploadReplacePrompt fileName={fileName} onBrowse={onBrowse} />
      ) : (
        <FileUploadIdlePrompt onBrowse={onBrowse} />
      )}
    </div>
  )
}
