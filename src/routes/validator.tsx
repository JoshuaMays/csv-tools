import { createFileRoute } from '@tanstack/react-router'

import ErrorAlert from '@/components/ErrorAlert'
import PageContainer from '@/components/PageContainer'
import ScreenReaderAnnouncement from '@/components/ScreenReaderAnnouncement'
import FileUpload from '@/features/validator/components/FileUpload'
import SchemaBuilder from '@/features/validator/components/SchemaBuilder'
import StepIndicator from '@/features/validator/components/StepIndicator'
import ValidationResults from '@/features/validator/components/ValidationResults'
import { useValidatorFlow } from '@/features/validator/hooks/useValidatorFlow'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/validator')({
  component: ValidatorPage,
  head: () => ({
    meta: [
      { title: m.validator_meta_title() },
      { name: 'description', content: m.validator_meta_description() },
    ],
  }),
})

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
    <PageContainer>
      <ScreenReaderAnnouncement message={announcement} />
      <div className="mb-8">
        <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-(--text-base) sm:text-4xl">
          {m.validator_page_title()}
        </h1>
        <p className="text-sm text-(--text-muted)">
          {m.validator_page_description()}
        </p>
      </div>

      <StepIndicator stage={stage} />

      {error && <ErrorAlert error={error} />}

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
    </PageContainer>
  )
}
