import { cn } from '@/utils/cn'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function Island({ children, className }: Props) {
  return <section className={cn('island-shell', className)}>{children}</section>
}
