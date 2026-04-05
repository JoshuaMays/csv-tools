import { Upload } from 'lucide-react'

import { useFileUpload } from '@/features/validator/hooks/useFileUpload'
import { m } from '@/paraglide/messages'
import type { ParsedCsv } from '@/types/validator'

type Props = {
  onParsed: (result: ParsedCsv) => void
  onError: (message: string) => void
}

export default function FileUpload({ onParsed, onError }: Props) {
  const { dragging, fileName, dropZoneRef, inputRef, onInputChange } =
    useFileUpload({ onParsed, onError })

  return (
    <div
      ref={dropZoneRef}
      className={[
        'island-shell flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-colors',
        dragging ? 'border-(--lagoon) bg-(--hero-a)' : 'border-(--line)',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-hidden={true}
        tabIndex={-1}
        onChange={onInputChange}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--chip-bg) text-(--lagoon)">
        <Upload size={24} aria-hidden={true} />
      </div>
      {fileName ? (
        <div>
          <p className="font-semibold text-(--sea-ink)">{fileName}</p>
          <p className="text-sm text-(--sea-ink-soft)">
            {m.validator_upload_replace_or()}{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-(--lagoon) underline underline-offset-2 hover:opacity-80"
            >
              {m.validator_upload_browse()}
            </button>
          </p>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-(--sea-ink)">
            {m.validator_upload_heading()}
          </p>
          <p className="text-sm text-(--sea-ink-soft)">
            {m.validator_upload_or()}{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-(--lagoon) underline underline-offset-2 hover:opacity-80"
            >
              {m.validator_upload_browse_files()}
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
