import Papa from 'papaparse'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseCsvFile, parseCsvString } from '@/utils/csv'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parseCsvString', () => {
  it('parses valid CSV into headers and rows', () => {
    const result = parseCsvString('name,age\nAlice,30\nBob,25')
    expect(result.headers).toEqual(['name', 'age'])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({ name: 'Alice', age: '30' })
  })

  it('skips empty lines', () => {
    const result = parseCsvString('name,age\nAlice,30\n\nBob,25')
    expect(result.rows).toHaveLength(2)
  })

  it('returns empty headers array when meta.fields is undefined', () => {
    vi.spyOn(Papa, 'parse').mockReturnValueOnce({
      data: [],
      errors: [],
      meta: {
        delimiter: ',',
        linebreak: '\n',
        aborted: false,
        truncated: false,
        cursor: 0,
      },
    } as unknown as ReturnType<typeof Papa.parse>)
    const result = parseCsvString('no-header-content')
    expect(result.headers).toEqual([])
  })

  it('throws when PapaParse reports a parse error', () => {
    // A row with more fields than the header triggers a FieldMismatch/TooManyFields error
    expect(() => parseCsvString('a,b\n1,2,3')).toThrow('CSV parse error:')
  })
})

describe('parseCsvFile', () => {
  it('resolves with headers and rows for a valid CSV file', async () => {
    const file = new File(['name,age\nAlice,30\nBob,25'], 'test.csv', {
      type: 'text/csv',
    })
    const result = await parseCsvFile(file)
    expect(result.headers).toEqual(['name', 'age'])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({ name: 'Alice', age: '30' })
  })

  it('resolves with empty headers when meta.fields is undefined', async () => {
    vi.spyOn(Papa, 'parse').mockImplementationOnce(
      (_input: unknown, config: Parameters<typeof Papa.parse>[1]) => {
        const cfg = config as { complete?: (r: object) => void }
        cfg.complete?.({
          data: [],
          errors: [],
          meta: {
            delimiter: ',',
            linebreak: '\n',
            aborted: false,
            truncated: false,
            cursor: 0,
          },
        })
        return undefined as unknown as ReturnType<typeof Papa.parse>
      },
    )
    const file = new File([''], 'test.csv', { type: 'text/csv' })
    const result = await parseCsvFile(file)
    expect(result.headers).toEqual([])
  })

  it('rejects when the parsed CSV contains field-count errors', async () => {
    const file = new File(['a,b\n1,2,3'], 'bad.csv', { type: 'text/csv' })
    await expect(parseCsvFile(file)).rejects.toThrow('CSV parse error:')
  })

  it('rejects when PapaParse encounters an IO error reading the file', async () => {
    vi.spyOn(Papa, 'parse').mockImplementationOnce(
      (_input: unknown, config: Parameters<typeof Papa.parse>[1]) => {
        const cfg = config as { error?: (err: Error) => void }
        cfg.error?.(new Error('read error'))
        return undefined as unknown as ReturnType<typeof Papa.parse>
      },
    )
    const file = new File([''], 'test.csv', { type: 'text/csv' })
    await expect(parseCsvFile(file)).rejects.toThrow('read error')
  })
})
