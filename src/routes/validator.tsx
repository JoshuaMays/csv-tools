import { createFileRoute } from '@tanstack/react-router'

import FileUpload from '@/features/validator/components/FileUpload'
import SchemaBuilder from '@/features/validator/components/SchemaBuilder'
import ValidationResults from '@/features/validator/components/ValidationResults'
import { useValidatorFlow } from '@/features/validator/hooks/useValidatorFlow'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/validator')({ component: ValidatorPage })

type Stage = 'upload' | 'schema' | 'results'

function ValidatorPage() {
  const {
    stage,
    error,
    announcement,
    columns,
    result,
    handleParsed,
    handleColumnsChange,
    handleValidate,
    handleReset,
    handleError,
  } = useValidatorFlow()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      <div className="mb-8">
        <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-(--sea-ink) sm:text-4xl">
          {m.validator_page_title()}
        </h1>
        <p className="text-sm text-(--sea-ink-soft)">
          {m.validator_page_description()}
        </p>
      </div>

      {/* Step indicator */}
      <nav
        aria-label={m.validator_steps_nav_label()}
        className="mb-8 flex items-center gap-2 text-sm font-semibold"
      >
        {(['upload', 'schema', 'results'] as Stage[]).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden={true} className="text-(--sea-ink-soft)">
                /
              </span>
            )}
            <span
              aria-current={stage === s ? 'step' : undefined}
              className={
                stage === s
                  ? 'text-(--sea-ink)'
                  : 'text-(--sea-ink-soft) opacity-50'
              }
            >
              {i + 1}.{' '}
              {s === 'upload'
                ? m.validator_step_upload()
                : s === 'schema'
                  ? m.validator_step_schema()
                  : m.validator_step_results()}
            </span>
          </span>
        ))}
      </nav>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {stage === 'upload' && (
        <FileUpload onParsed={handleParsed} onError={handleError} />
      )}

      {stage === 'schema' && (
        <SchemaBuilder
          columns={columns}
          onChange={handleColumnsChange}
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
