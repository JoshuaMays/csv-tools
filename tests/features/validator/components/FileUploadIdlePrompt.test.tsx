import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import FileUploadIdlePrompt from '@/features/validator/components/FileUploadIdlePrompt'

describe('FileUploadIdlePrompt', () => {
  it('renders the drop-zone heading', () => {
    render(<FileUploadIdlePrompt onBrowse={vi.fn()} />)
    expect(screen.getByText(/drop your csv file here/i)).toBeInTheDocument()
  })

  it('renders the browse-files button', () => {
    render(<FileUploadIdlePrompt onBrowse={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /browse files/i }),
    ).toBeInTheDocument()
  })

  it('calls onBrowse when the browse button is clicked', () => {
    const onBrowse = vi.fn()
    render(<FileUploadIdlePrompt onBrowse={onBrowse} />)
    fireEvent.click(screen.getByRole('button', { name: /browse files/i }))
    expect(onBrowse).toHaveBeenCalledOnce()
  })

  it('browse trigger is a <button> element (not div or span)', () => {
    render(<FileUploadIdlePrompt onBrowse={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /browse files/i })
    expect(btn.tagName).toBe('BUTTON')
  })
})
