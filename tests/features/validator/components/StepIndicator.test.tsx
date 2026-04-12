import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import StepIndicator from '@/features/validator/components/StepIndicator'
import { STAGES } from '@/features/validator/hooks/useValidatorFlow'

describe('StepIndicator', () => {
  it('renders all three steps', () => {
    render(<StepIndicator stage="upload" />)
    expect(screen.getByText(/Upload/i)).toBeInTheDocument()
    expect(screen.getByText(/Schema/i)).toBeInTheDocument()
    expect(screen.getByText(/Results/i)).toBeInTheDocument()
  })

  it('marks only the active step with aria-current="step"', () => {
    for (const active of STAGES) {
      const { unmount } = render(<StepIndicator stage={active} />)
      const current = screen.getAllByText(
        (_, el) => el?.getAttribute('aria-current') === 'step',
      )
      expect(current).toHaveLength(1)
      expect(current[0].textContent.toLowerCase()).toContain(active)
      unmount()
    }
  })

  it('does not set aria-current on inactive steps', () => {
    render(<StepIndicator stage="schema" />)
    const allStepSpans = screen.getAllByText(/\d\.\s/i)
    const currentSpans = allStepSpans.filter(
      (el) => el.getAttribute('aria-current') === 'step',
    )
    expect(currentSpans).toHaveLength(1)
  })

  it('renders step separators between steps but not before the first', () => {
    const { container } = render(<StepIndicator stage="upload" />)
    // There should be 2 separators (one between each pair of 3 steps)
    const separators = container.querySelectorAll('span[aria-hidden="true"]')
    expect(separators).toHaveLength(2)
    separators.forEach((sep) => expect(sep).toHaveTextContent('/'))
  })
})
