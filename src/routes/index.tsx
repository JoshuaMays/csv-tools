import { createFileRoute } from '@tanstack/react-router'

import Island from '@/components/Island'
import PageContainer from '@/components/PageContainer'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      { title: m.home_page_title() },
      { name: 'description', content: m.home_page_description() },
    ],
  }),
})

function Home() {
  return (
    <PageContainer>
      <Island className="relative overflow-hidden rounded-hero px-6 py-10 sm:px-10 sm:py-14">
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-(--sea-ink) sm:text-6xl">
          {m.home_heading()}
        </h1>
        <p className="mb-8 max-w-2xl text-base text-(--sea-ink-soft) sm:text-lg">
          {m.home_body()}
        </p>
      </Island>
    </PageContainer>
  )
}
