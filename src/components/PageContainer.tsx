import { cn } from '@/utils/cn'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function PageContainer({ children, className }: Props) {
  return (
    <main
      className={cn(
        'page-wrap grow px-page-gutter pb-content-bottom pt-content-top',
        className,
      )}
    >
      {children}
    </main>
  )
}
