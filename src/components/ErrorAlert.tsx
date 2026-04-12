interface Props {
  error: string
}

function ErrorAlert({ error }: Props) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3 text-sm text-(--error-text)"
    >
      {error}
    </div>
  )
}

export default ErrorAlert
