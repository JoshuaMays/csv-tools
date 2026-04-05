import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

type Props = {
  onParsed: (result: {
    headers: string[]
    rows: Record<string, string | undefined>[]
  }) => void
  onError: (message: string) => void
}

export default function FileUpload({ onParsed, onError }: Props) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      onError('Please upload a .csv file.')
      return
    }
    setFileName(file.name)
    try {
      const { parseCsvFile } = await import('@/utils/csv')
      const result = await parseCsvFile(file)
      if (result.headers.length === 0) {
        onError(
          'The CSV file has no headers. Please upload a file with a header row.',
        )
        return
      }
      onParsed(result)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to parse CSV file.')
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload CSV file"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={[
        'island-shell flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-colors',
        dragging
          ? 'border-(--lagoon) bg-(--hero-a)'
          : 'border-(--line) hover:border-(--lagoon) hover:bg-(--hero-a)',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={onInputChange}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--chip-bg) text-(--lagoon)">
        <Upload size={24} />
      </div>
      {fileName ? (
        <div>
          <p className="font-semibold text-(--sea-ink)">{fileName}</p>
          <p className="text-sm text-(--sea-ink-soft)">
            Click or drop to replace
          </p>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-(--sea-ink)">
            Drop your CSV file here
          </p>
          <p className="text-sm text-(--sea-ink-soft)">or click to browse</p>
        </div>
      )}
    </div>
  )
}
