interface Props {
  message: string
}

function ScreenReaderAnnouncement({ message }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

export default ScreenReaderAnnouncement
