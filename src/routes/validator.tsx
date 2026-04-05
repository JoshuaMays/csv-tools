import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import FileUpload from '@/features/validator/components/FileUpload'
import SchemaBuilder from '@/features/validator/components/SchemaBuilder'
import ValidationResults from '@/features/validator/components/ValidationResults'
import type { ColumnDef, ValidationResult } from '@/types/validator'

export const Route = createFileRoute('/validator')({ component: ValidatorPage })

type Stage = 'upload' | 'schema' | 'results'

function ValidatorPage() {
  const [stage, setStage] = useState<Stage>('upload')
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<Record<string, string | undefined>[]>([])
  const [columns, setColumns] = useState<ColumnDef[]>([])
  const [result, setResult] = useState<ValidationResult | null>(null)

  function handleParsed(data: {
    headers: string[]
    rows: Record<string, string | undefined>[]
  }) {
    setError(null)
    setRows(data.rows)
    setColumns(
      data.headers.map((header) => ({
        name: header,
        type: 'string',
        required: false,
      })),
    )
    setStage('schema')
  }

  async function handleValidate() {
    const { validateRows } = await import('@/utils/schema-builder')
    const validationResult = validateRows(rows, columns)
    setResult(validationResult)
    setStage('results')
  }

  function handleReset() {
    setStage('upload')
    setError(null)
    setRows([])
    setColumns([])
    setResult(null)
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="mb-8">
        <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-(--sea-ink) sm:text-4xl">
          CSV Validator
        </h1>
        <p className="text-sm text-(--sea-ink-soft)">
          Upload a CSV, define your schema, and validate every row.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2 text-sm font-semibold">
        {(['upload', 'schema', 'results'] as Stage[]).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-(--sea-ink-soft)">/</span>}
            <span
              className={
                stage === s
                  ? 'text-(--sea-ink)'
                  : 'text-(--sea-ink-soft) opacity-50'
              }
            >
              {i + 1}.{' '}
              {s === 'upload'
                ? 'Upload'
                : s === 'schema'
                  ? 'Schema'
                  : 'Results'}
            </span>
          </span>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {stage === 'upload' && (
        <FileUpload onParsed={handleParsed} onError={setError} />
      )}

      {stage === 'schema' && (
        <SchemaBuilder
          columns={columns}
          onChange={setColumns}
          onValidate={handleValidate}
          onChangeFile={handleReset}
        />
      )}

      {stage === 'results' && result && (
        <ValidationResults result={result} onReset={handleReset} />
      )}
    </main>
  )
}
