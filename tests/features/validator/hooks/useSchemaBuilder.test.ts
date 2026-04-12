import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { useSchemaBuilder } from '@/features/validator/hooks/useSchemaBuilder'
import type { ColumnDef } from '@/types/validator'

const baseColumns: ColumnDef[] = [
  { name: 'name', type: 'string', required: false },
  { name: 'age', type: 'number', required: false },
  { name: 'email', type: 'email', required: false },
]

describe('useSchemaBuilder', () => {
  describe('handleType', () => {
    it('updates the type of the specified column', () => {
      const onChange = (cols: ColumnDef[]) => {
        expect(cols[0].type).toBe('email')
      }
      const { result } = renderHook(() =>
        useSchemaBuilder({ columns: baseColumns, onChange }),
      )

      act(() => {
        result.current.handleType(0, 'email')
      })
    })

    it('clears string constraints when switching away from string', () => {
      const stringColWithConstraints: ColumnDef[] = [
        {
          name: 'notes',
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 100,
          enum: ['a', 'b'],
        },
      ]

      let captured: ColumnDef[] | null = null
      const onChange = (cols: ColumnDef[]) => {
        captured = cols
      }

      const { result } = renderHook(() =>
        useSchemaBuilder({ columns: stringColWithConstraints, onChange }),
      )

      act(() => {
        result.current.handleType(0, 'number')
      })

      expect(captured).not.toBeNull()
      expect(captured![0].minLength).toBeUndefined()
      expect(captured![0].maxLength).toBeUndefined()
      expect(captured![0].enum).toBeUndefined()
      expect(captured![0].type).toBe('number')
    })

    it('clears number constraints when switching away from number', () => {
      const numberColWithConstraints: ColumnDef[] = [
        { name: 'score', type: 'number', required: false, min: 0, max: 100 },
      ]

      let captured: ColumnDef[] | null = null
      const { result } = renderHook(() =>
        useSchemaBuilder({
          columns: numberColWithConstraints,
          onChange: (cols) => {
            captured = cols
          },
        }),
      )

      act(() => {
        result.current.handleType(0, 'string')
      })

      expect(captured![0].min).toBeUndefined()
      expect(captured![0].max).toBeUndefined()
    })

    it('does not mutate columns other than the target index', () => {
      let captured: ColumnDef[] | null = null
      const { result } = renderHook(() =>
        useSchemaBuilder({
          columns: baseColumns,
          onChange: (cols) => {
            captured = cols
          },
        }),
      )

      act(() => {
        result.current.handleType(0, 'email')
      })

      expect(captured![1]).toEqual(baseColumns[1])
      expect(captured![2]).toEqual(baseColumns[2])
    })
  })

  describe('handleField', () => {
    it('updates a boolean field on the target column', () => {
      let captured: ColumnDef[] | null = null
      const { result } = renderHook(() =>
        useSchemaBuilder({
          columns: baseColumns,
          onChange: (cols) => {
            captured = cols
          },
        }),
      )

      act(() => {
        result.current.handleField(1, 'required', true)
      })

      expect(captured![1].required).toBe(true)
      expect(captured![0].required).toBe(false)
    })

    it('updates a numeric field on the target column', () => {
      let captured: ColumnDef[] | null = null
      const { result } = renderHook(() =>
        useSchemaBuilder({
          columns: baseColumns,
          onChange: (cols) => {
            captured = cols
          },
        }),
      )

      act(() => {
        result.current.handleField(1, 'min', 5)
      })

      expect(captured![1].min).toBe(5)
    })

    it('sets a field to undefined when passed undefined', () => {
      const colWithMin: ColumnDef[] = [
        { name: 'score', type: 'number', required: false, min: 10 },
      ]

      let captured: ColumnDef[] | null = null
      const { result } = renderHook(() =>
        useSchemaBuilder({
          columns: colWithMin,
          onChange: (cols) => {
            captured = cols
          },
        }),
      )

      act(() => {
        result.current.handleField(0, 'min', undefined)
      })

      expect(captured![0].min).toBeUndefined()
    })
  })

  describe('handleEnumChange', () => {
    it('splits the raw string by comma and trims whitespace', () => {
      let captured: ColumnDef[] | null = null
      const { result } = renderHook(() =>
        useSchemaBuilder({
          columns: baseColumns,
          onChange: (cols) => {
            captured = cols
          },
        }),
      )

      act(() => {
        result.current.handleEnumChange(0, 'active, inactive, pending')
      })

      expect(captured![0].enum).toEqual(['active', 'inactive', 'pending'])
    })

    it('sets enum to undefined when the input is empty or blank', () => {
      const colWithEnum: ColumnDef[] = [
        {
          name: 'status',
          type: 'string',
          required: false,
          enum: ['active', 'inactive'],
        },
      ]

      let captured: ColumnDef[] | null = null
      const { result } = renderHook(() =>
        useSchemaBuilder({
          columns: colWithEnum,
          onChange: (cols) => {
            captured = cols
          },
        }),
      )

      act(() => {
        result.current.handleEnumChange(0, '   ')
      })

      expect(captured![0].enum).toBeUndefined()
    })

    it('filters out empty tokens produced by trailing commas', () => {
      let captured: ColumnDef[] | null = null
      const { result } = renderHook(() =>
        useSchemaBuilder({
          columns: baseColumns,
          onChange: (cols) => {
            captured = cols
          },
        }),
      )

      act(() => {
        result.current.handleEnumChange(0, 'a, b, ')
      })

      expect(captured![0].enum).toEqual(['a', 'b'])
    })
  })
})
