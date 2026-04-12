import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import SchemaBuilder from '@/features/validator/components/SchemaBuilder'
import type { ColumnDef } from '@/types/validator'

const sampleColumns: ColumnDef[] = [
  { name: 'name', type: 'string', required: false },
  { name: 'age', type: 'number', required: true },
]

function renderBuilder(
  overrides?: Partial<Parameters<typeof SchemaBuilder>[0]>,
) {
  const props = {
    columns: sampleColumns,
    onChange: vi.fn(),
    onValidate: vi.fn(),
    onChangeFile: vi.fn(),
    ...overrides,
  }
  return { ...render(<SchemaBuilder {...props} />), props }
}

describe('SchemaBuilder', () => {
  describe('rendering', () => {
    it('renders a fieldset for each column', () => {
      renderBuilder()
      const fieldsets = document.querySelectorAll('fieldset')
      expect(fieldsets).toHaveLength(sampleColumns.length)
    })

    it('renders the column name as each fieldset legend', () => {
      renderBuilder()
      expect(screen.getByText('name')).toBeInTheDocument()
      expect(screen.getByText('age')).toBeInTheDocument()
    })

    it('renders a type select for each column', () => {
      renderBuilder()
      const selects = screen.getAllByRole('combobox')
      expect(selects).toHaveLength(sampleColumns.length)
    })

    it('renders the Run Validation button', () => {
      renderBuilder()
      expect(
        screen.getByRole('button', { name: /run validation/i }),
      ).toBeInTheDocument()
    })

    it('renders the Change file button', () => {
      renderBuilder()
      expect(
        screen.getByRole('button', { name: /change file/i }),
      ).toBeInTheDocument()
    })

    it('reflects the required state of each column via checkbox', () => {
      renderBuilder()
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).not.toBeChecked()
      expect(checkboxes[1]).toBeChecked()
    })

    it('sets the correct initial value on each type select', () => {
      renderBuilder()
      const selects = screen.getAllByRole<HTMLSelectElement>('combobox')
      expect(selects[0].value).toBe('string')
      expect(selects[1].value).toBe('number')
    })
  })

  describe('string-type extra fields', () => {
    it('renders min/max length inputs for a string column', () => {
      renderBuilder({
        columns: [{ name: 'notes', type: 'string', required: false }],
      })
      expect(screen.getByText(/min length/i)).toBeInTheDocument()
      expect(screen.getByText(/max length/i)).toBeInTheDocument()
    })

    it('renders the allowed values input for a string column', () => {
      renderBuilder({
        columns: [{ name: 'status', type: 'string', required: false }],
      })
      expect(screen.getByText(/allowed values/i)).toBeInTheDocument()
    })
  })

  describe('number-type extra fields', () => {
    it('renders min/max value inputs for a number column', () => {
      renderBuilder({
        columns: [{ name: 'score', type: 'number', required: false }],
      })
      expect(screen.getByText(/min value/i)).toBeInTheDocument()
      expect(screen.getByText(/max value/i)).toBeInTheDocument()
    })

    it('does not render min/max length for a number column', () => {
      renderBuilder({
        columns: [{ name: 'score', type: 'number', required: false }],
      })
      expect(screen.queryByText(/min length/i)).not.toBeInTheDocument()
    })
  })

  describe('non-string/number column types', () => {
    it('does not render string-specific constraints for a boolean column', () => {
      renderBuilder({
        columns: [{ name: 'active', type: 'boolean', required: false }],
      })
      expect(screen.queryByText(/allowed values/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/min value/i)).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onValidate when the Run Validation button is clicked', () => {
      const { props } = renderBuilder()
      fireEvent.click(screen.getByRole('button', { name: /run validation/i }))
      expect(props.onValidate).toHaveBeenCalledOnce()
    })

    it('calls onChangeFile when the Change file button is clicked', () => {
      const { props } = renderBuilder()
      fireEvent.click(screen.getByRole('button', { name: /change file/i }))
      expect(props.onChangeFile).toHaveBeenCalledOnce()
    })

    it('calls onChange when the required checkbox is toggled', () => {
      const onChange = vi.fn()
      renderBuilder({ onChange })
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      expect(onChange).toHaveBeenCalledOnce()
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].required).toBe(true)
    })

    it('calls onChange when the type select changes', () => {
      const onChange = vi.fn()
      renderBuilder({ onChange })
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: 'email' } })
      expect(onChange).toHaveBeenCalledOnce()
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].type).toBe('email')
    })

    it('calls onChange with updated minLength when the min-length input changes', () => {
      const onChange = vi.fn()
      render(
        <SchemaBuilder
          columns={[{ name: 'notes', type: 'string', required: false }]}
          onChange={onChange}
          onValidate={vi.fn()}
          onChangeFile={vi.fn()}
        />,
      )
      const inputs = screen.getAllByRole('spinbutton')
      fireEvent.change(inputs[0], { target: { value: '5' } })
      expect(onChange).toHaveBeenCalledOnce()
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].minLength).toBe(5)
    })

    it('calls onChange with undefined minLength when the min-length input is cleared', () => {
      const onChange = vi.fn()
      render(
        <SchemaBuilder
          columns={[
            { name: 'notes', type: 'string', required: false, minLength: 3 },
          ]}
          onChange={onChange}
          onValidate={vi.fn()}
          onChangeFile={vi.fn()}
        />,
      )
      const inputs = screen.getAllByRole('spinbutton')
      fireEvent.change(inputs[0], { target: { value: '' } })
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].minLength).toBeUndefined()
    })

    it('calls onChange with updated maxLength when the max-length input changes', () => {
      const onChange = vi.fn()
      render(
        <SchemaBuilder
          columns={[{ name: 'notes', type: 'string', required: false }]}
          onChange={onChange}
          onValidate={vi.fn()}
          onChangeFile={vi.fn()}
        />,
      )
      const inputs = screen.getAllByRole('spinbutton')
      fireEvent.change(inputs[1], { target: { value: '100' } })
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].maxLength).toBe(100)
    })

    it('calls onChange with parsed enum values when the allowed-values input changes', () => {
      const onChange = vi.fn()
      render(
        <SchemaBuilder
          columns={[{ name: 'status', type: 'string', required: false }]}
          onChange={onChange}
          onValidate={vi.fn()}
          onChangeFile={vi.fn()}
        />,
      )
      const enumInput = screen.getByPlaceholderText(/e\.g\. active/i)
      fireEvent.change(enumInput, { target: { value: 'active, inactive' } })
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].enum).toEqual(['active', 'inactive'])
    })

    it('calls onChange with updated min when the number min input changes', () => {
      const onChange = vi.fn()
      render(
        <SchemaBuilder
          columns={[{ name: 'score', type: 'number', required: false }]}
          onChange={onChange}
          onValidate={vi.fn()}
          onChangeFile={vi.fn()}
        />,
      )
      const inputs = screen.getAllByRole('spinbutton')
      fireEvent.change(inputs[0], { target: { value: '0' } })
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].min).toBe(0)
    })

    it('calls onChange with updated max when the number max input changes', () => {
      const onChange = vi.fn()
      render(
        <SchemaBuilder
          columns={[{ name: 'score', type: 'number', required: false }]}
          onChange={onChange}
          onValidate={vi.fn()}
          onChangeFile={vi.fn()}
        />,
      )
      const inputs = screen.getAllByRole('spinbutton')
      fireEvent.change(inputs[1], { target: { value: '100' } })
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].max).toBe(100)
    })

    it('calls onChange with undefined max when the number max input is cleared', () => {
      const onChange = vi.fn()
      render(
        <SchemaBuilder
          columns={[
            { name: 'score', type: 'number', required: false, max: 50 },
          ]}
          onChange={onChange}
          onValidate={vi.fn()}
          onChangeFile={vi.fn()}
        />,
      )
      const inputs = screen.getAllByRole('spinbutton')
      fireEvent.change(inputs[1], { target: { value: '' } })
      const updated: ColumnDef[] = onChange.mock.calls[0][0]
      expect(updated[0].max).toBeUndefined()
    })
  })
})
