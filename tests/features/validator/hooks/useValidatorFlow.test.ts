import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  useValidatorFlow,
  STAGES,
} from '@/features/validator/hooks/useValidatorFlow'
import type { ParsedCsv, ValidationResult, ColumnDef } from '@/types/validator'

const mockValidateRowsInWorker = vi.fn()

vi.mock('@/utils/schema-builder', () => ({
  validateRowsInWorker: (...args: unknown[]) =>
    mockValidateRowsInWorker(...args),
}))

const parsedCsv: ParsedCsv = {
  headers: ['name', 'email'],
  rows: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ],
}

const validResult: ValidationResult = {
  totalRows: 2,
  validRows: 2,
  errors: [],
}

describe('useValidatorFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initialises with stage=upload and no error', () => {
    const { result } = renderHook(() => useValidatorFlow())
    expect(result.current.stage).toBe('upload')
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
    expect(result.current.columns).toEqual([])
  })

  it('STAGES constant contains upload, schema, results in order', () => {
    expect(STAGES).toEqual(['upload', 'schema', 'results'])
  })

  describe('handleParsed', () => {
    it('advances stage to schema and builds column defs from headers', () => {
      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleParsed(parsedCsv)
      })

      expect(result.current.stage).toBe('schema')
      expect(result.current.error).toBeNull()
      expect(result.current.columns).toEqual([
        { name: 'name', type: 'string', required: false },
        { name: 'email', type: 'string', required: false },
      ])
    })

    it('sets an announcement string when advancing to schema', () => {
      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleParsed(parsedCsv)
      })

      expect(result.current.announcement).toBeTruthy()
      expect(typeof result.current.announcement).toBe('string')
    })
  })

  describe('handleColumnsChange', () => {
    it('updates the columns list', () => {
      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleParsed(parsedCsv)
      })

      const updated: ColumnDef[] = [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
      ]

      act(() => {
        result.current.handleColumnsChange(updated)
      })

      expect(result.current.columns).toEqual(updated)
    })
  })

  describe('handleError', () => {
    it('stores the error message without changing stage', () => {
      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleError('Something went wrong')
      })

      expect(result.current.error).toBe('Something went wrong')
      expect(result.current.stage).toBe('upload')
    })
  })

  describe('handleReset', () => {
    it('returns to upload stage and clears all state', () => {
      const { result } = renderHook(() => useValidatorFlow())

      // Advance to schema first
      act(() => {
        result.current.handleParsed(parsedCsv)
      })
      expect(result.current.stage).toBe('schema')

      act(() => {
        result.current.handleReset()
      })

      expect(result.current.stage).toBe('upload')
      expect(result.current.error).toBeNull()
      expect(result.current.result).toBeNull()
    })

    it('sets an announcement string on reset', () => {
      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleReset()
      })

      expect(result.current.announcement).toBeTruthy()
    })
  })

  describe('handleValidate', () => {
    it('dispatches VALIDATED and advances to results on success', async () => {
      mockValidateRowsInWorker.mockResolvedValueOnce(validResult)

      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleParsed(parsedCsv)
      })

      await act(async () => {
        await result.current.handleValidate()
      })

      expect(result.current.stage).toBe('results')
      expect(result.current.result).toEqual(validResult)
      expect(result.current.error).toBeNull()
    })

    it('sets an announcement string on successful validation', async () => {
      mockValidateRowsInWorker.mockResolvedValueOnce(validResult)

      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleParsed(parsedCsv)
      })

      await act(async () => {
        await result.current.handleValidate()
      })

      expect(result.current.announcement).toBeTruthy()
    })

    it('dispatches ERROR with a message when validateRowsInWorker rejects with Error', async () => {
      mockValidateRowsInWorker.mockRejectedValueOnce(
        new Error('Unexpected failure'),
      )

      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleParsed(parsedCsv)
      })

      await act(async () => {
        await result.current.handleValidate()
      })

      expect(result.current.error).toBe('Unexpected failure')
      expect(result.current.stage).toBe('schema')
    })

    it('dispatches ERROR with fallback message when rejection is not an Error', async () => {
      mockValidateRowsInWorker.mockRejectedValueOnce('raw string rejection')

      const { result } = renderHook(() => useValidatorFlow())

      act(() => {
        result.current.handleParsed(parsedCsv)
      })

      await act(async () => {
        await result.current.handleValidate()
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.stage).toBe('schema')
    })
  })
})
