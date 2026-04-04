import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          About CSV Tools
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          CSV Tools is an open-source, browser-based toolkit for validating,
          inspecting, and transforming CSV files. No uploads to external
          servers &mdash; everything runs locally in your browser.
        </p>
      </section>
    </main>
  )
}
