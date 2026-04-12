import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import FileUploadReplacePrompt from '@/features/validator/components/FileUploadReplacePrompt'

describe('FileUploadReplacePrompt', () => {
  it('renders the file name', () => {
    render(<FileUploadReplacePrompt fileName="data.csv" onBrowse={vi.fn()} />)
    expect(screen.getByText('data.csv')).toBeInTheDocument()
  })

  it('renders the browse button', () => {
    render(<FileUploadReplacePrompt fileName="data.csv" onBrowse={vi.fn()} />)
    expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument()
  })

  it('calls onBrowse when the browse button is clicked', () => {
    const onBrowse = vi.fn()
    render(<FileUploadReplacePrompt fileName="data.csv" onBrowse={onBrowse} />)
    fireEvent.click(screen.getByRole('button', { name: /browse/i }))
    expect(onBrowse).toHaveBeenCalledOnce()
  })

  it('browse trigger is a <button> element', () => {
    render(<FileUploadReplacePrompt fileName="data.csv" onBrowse={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /browse/i })
    expect(btn.tagName).toBe('BUTTON')
  })

  it('renders the drop-to-replace hint text', () => {
    render(<FileUploadReplacePrompt fileName="report.csv" onBrowse={vi.fn()} />)
    expect(screen.getByText(/drop to replace/i)).toBeInTheDocument()
  })
})
