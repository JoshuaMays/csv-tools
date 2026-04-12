import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import ValidationResults from '@/features/validator/components/ValidationResults'
import type { ValidationResult } from '@/types/validator'

const allValidResult: ValidationResult = {
  totalRows: 5,
  validRows: 5,
  errors: [],
}

const resultWithErrors: ValidationResult = {
  totalRows: 3,
  validRows: 1,
  errors: [
    {
      row: 2,
      column: 'email',
      value: 'not-an-email',
      message: 'Must be a valid email address',
    },
    { row: 3, column: 'name', value: '', message: 'This field is required' },
  ],
}

describe('ValidationResults', () => {
  describe('all-valid state', () => {
    it('renders the all-valid summary message', () => {
      render(<ValidationResults result={allValidResult} onReset={vi.fn()} />)
      expect(screen.getByText(/all rows are valid/i)).toBeInTheDocument()
    })

    it('shows rows-passed stats in the summary', () => {
      render(<ValidationResults result={allValidResult} onReset={vi.fn()} />)
      expect(screen.getByText(/5 of 5 rows passed/i)).toBeInTheDocument()
    })

    it('does not render an error table when there are no errors', () => {
      render(<ValidationResults result={allValidResult} onReset={vi.fn()} />)
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders the errors-found message with the count', () => {
      render(<ValidationResults result={resultWithErrors} onReset={vi.fn()} />)
      expect(screen.getByText(/2 error\(s\) found/i)).toBeInTheDocument()
    })

    it('renders the error table with correct column headers', () => {
      render(<ValidationResults result={resultWithErrors} onReset={vi.fn()} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText(/^Row$/i)).toBeInTheDocument()
      expect(screen.getByText(/^Column$/i)).toBeInTheDocument()
      expect(screen.getByText(/^Value$/i)).toBeInTheDocument()
      expect(screen.getByText(/^Error$/i)).toBeInTheDocument()
    })

    it('renders a row for each error entry', () => {
      render(<ValidationResults result={resultWithErrors} onReset={vi.fn()} />)
      const rows = screen.getAllByRole('row')
      // thead row + 2 error rows
      expect(rows).toHaveLength(3)
    })

    it('displays the error row number, column, value, and message', () => {
      render(<ValidationResults result={resultWithErrors} onReset={vi.fn()} />)
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('email')).toBeInTheDocument()
      expect(screen.getByText('not-an-email')).toBeInTheDocument()
      expect(
        screen.getByText('Must be a valid email address'),
      ).toBeInTheDocument()
    })

    it('shows an "empty" label for errors with an empty value', () => {
      render(<ValidationResults result={resultWithErrors} onReset={vi.fn()} />)
      expect(screen.getByText(/empty/i)).toBeInTheDocument()
    })
  })

  describe('start over button', () => {
    it('renders the start-over button', () => {
      render(<ValidationResults result={allValidResult} onReset={vi.fn()} />)
      expect(
        screen.getByRole('button', { name: /start over/i }),
      ).toBeInTheDocument()
    })

    it('calls onReset when the start-over button is clicked', () => {
      const onReset = vi.fn()
      render(<ValidationResults result={allValidResult} onReset={onReset} />)
      fireEvent.click(screen.getByRole('button', { name: /start over/i }))
      expect(onReset).toHaveBeenCalledOnce()
    })
  })

  describe('accessibility', () => {
    it('wraps the summary in a role="status" live region', () => {
      render(<ValidationResults result={allValidResult} onReset={vi.fn()} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('provides a visually-hidden caption for the error table', () => {
      render(<ValidationResults result={resultWithErrors} onReset={vi.fn()} />)
      // The caption element is not a named role — query by tag
      const caption = document.querySelector('caption')
      expect(caption).toBeInTheDocument()
      expect(caption!.textContent).toBeTruthy()
    })
  })
})
