import { STAGES } from '@/features/validator/hooks/useValidatorFlow'
import type { Stage } from '@/features/validator/hooks/useValidatorFlow'
import { m } from '@/paraglide/messages'

interface Props {
  stage: Stage
}

function StepIndicator({ stage }: Props) {
  return (
    <nav
      aria-label={m.validator_steps_nav_label()}
      className="mb-8 flex items-center gap-2 text-sm font-semibold"
    >
      {STAGES.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden={true} className="text-(--text-muted)">
              /
            </span>
          )}
          <span
            aria-current={stage === s ? 'step' : undefined}
            className={
              stage === s
                ? 'text-(--text-base)'
                : 'text-(--text-muted) opacity-50'
            }
          >
            {i + 1}.{' '}
            {s === 'upload'
              ? m.validator_step_upload()
              : s === 'schema'
                ? m.validator_step_schema()
                : m.validator_step_results()}
          </span>
        </span>
      ))}
    </nav>
  )
}

export default StepIndicator
