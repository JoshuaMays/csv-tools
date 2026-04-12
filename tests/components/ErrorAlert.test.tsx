import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import ErrorAlert from '@/components/ErrorAlert'

describe('ErrorAlert', () => {
  it('renders the error message', () => {
    render(<ErrorAlert error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('uses role="alert" so screen readers announce it immediately', () => {
    render(<ErrorAlert error="File is invalid" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders the alert content inside the role="alert" element', () => {
    render(<ErrorAlert error="Bad input" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Bad input')
  })
})
