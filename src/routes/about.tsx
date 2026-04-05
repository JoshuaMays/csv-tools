import { createFileRoute } from '@tanstack/react-router'

import Island from '@/components/Island'
import PageContainer from '@/components/PageContainer'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/about')({
  component: About,
  head: () => ({
    meta: [
      { title: m.about_page_title() },
      { name: 'description', content: m.about_page_description() },
    ],
  }),
})

function About() {
  return (
    <PageContainer>
      <Island className="rounded-card p-6 sm:p-8">
        <h1 className="display-title mb-3 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          {m.about_heading()}
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-(--sea-ink-soft)">
          {m.about_body()}
        </p>
      </Island>
    </PageContainer>
  )
}
