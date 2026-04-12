import { m } from '@/paraglide/messages'

interface Props {
  onBrowse: () => void
}

function FileUploadIdlePrompt({ onBrowse }: Props) {
  return (
    <div>
      <p className="font-semibold text-(--text-base)">
        {m.validator_upload_heading()}
      </p>
      <p className="text-sm text-(--text-muted)">
        {m.validator_upload_or()}{' '}
        <button
          type="button"
          onClick={onBrowse}
          className="font-semibold text-(--text-link) underline underline-offset-2 hover:opacity-80"
        >
          {m.validator_upload_browse_files()}
        </button>
      </p>
    </div>
  )
}

export default FileUploadIdlePrompt
