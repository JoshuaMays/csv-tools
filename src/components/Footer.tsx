export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-(--line) px-4 pb-8 py-8 text-(--text-muted)">
      <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} CSV Tools. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
