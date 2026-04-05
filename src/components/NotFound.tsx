import PageContainer from '@/components/PageContainer'

export default function NotFound() {
  return (
    <PageContainer className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-3xl font-bold text-(--text-base)">404</h1>
      <p className="text-(--text-muted)">Page not found.</p>
    </PageContainer>
  )
}
