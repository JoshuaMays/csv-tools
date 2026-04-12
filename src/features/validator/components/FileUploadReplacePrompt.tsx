import { m } from '@/paraglide/messages'

interface Props {
  fileName: string
  onBrowse: () => void
}

function FileUploadReplacePrompt({ fileName, onBrowse }: Props) {
  return (
    <div>
      <p className="font-semibold text-(--text-base)">{fileName}</p>
      <p className="text-sm text-(--text-muted)">
        {m.validator_upload_replace_or()}{' '}
        <button
          type="button"
          onClick={onBrowse}
          className="font-semibold text-(--text-link) underline underline-offset-2 hover:opacity-80"
        >
          {m.validator_upload_browse()}
        </button>
      </p>
    </div>
  )
}

export default FileUploadReplacePrompt
