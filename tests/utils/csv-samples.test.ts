import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { parseCsvString } from '@/utils/csv'
import { validateRows } from '@/utils/schema-builder'
import type { ColumnDef } from '@/types/validator'

const SAMPLES = join(import.meta.dirname, '../../samples')

function loadSample(filename: string) {
  const content = readFileSync(join(SAMPLES, filename), 'utf-8')
  return parseCsvString(content)
}

// ─── Users schema ────────────────────────────────────────────────────────────

const userSchema: ColumnDef[] = [
  { name: 'id', type: 'number', required: true },
  { name: 'name', type: 'string', required: true, minLength: 2 },
  { name: 'email', type: 'email', required: true },
  { name: 'age', type: 'number', required: true, min: 0, max: 120 },
  { name: 'website', type: 'url', required: false },
  { name: 'active', type: 'boolean', required: true },
  { name: 'joined_date', type: 'date', required: true },
]

describe('users-valid.csv', () => {
  const { rows } = loadSample('users-valid.csv')

  it('parses 10 rows', () => {
    expect(rows).toHaveLength(10)
  })

  it('produces no validation errors', () => {
    const result = validateRows(rows, userSchema)
    expect(result.errors).toHaveLength(0)
    expect(result.validRows).toBe(10)
    expect(result.totalRows).toBe(10)
  })
})

describe('users-with-errors.csv', () => {
  const { rows } = loadSample('users-with-errors.csv')

  it('parses 10 rows', () => {
    expect(rows).toHaveLength(10)
  })

  it('row 1 is valid', () => {
    const result = validateRows([rows[0]], userSchema)
    expect(result.errors).toHaveLength(0)
  })

  it('row 2 — invalid email', () => {
    const result = validateRows([rows[1]], userSchema)
    const emailError = result.errors.find((e) => e.column === 'email')
    expect(emailError).toBeDefined()
    expect(emailError!.value).toBe('bob-not-an-email')
  })

  it('row 3 — age below min (0)', () => {
    const result = validateRows([rows[2]], userSchema)
    const ageError = result.errors.find((e) => e.column === 'age')
    expect(ageError).toBeDefined()
    expect(ageError!.value).toBe('-5')
  })

  it('row 4 — required name is missing', () => {
    const result = validateRows([rows[3]], userSchema)
    const nameError = result.errors.find((e) => e.column === 'name')
    expect(nameError).toBeDefined()
    expect(nameError!.message).toBe('This field is required')
  })

  it('row 5 — invalid URL', () => {
    const result = validateRows([rows[4]], userSchema)
    const urlError = result.errors.find((e) => e.column === 'website')
    expect(urlError).toBeDefined()
    expect(urlError!.value).toBe('not-a-url')
  })

  it('row 6 — invalid boolean ("maybe")', () => {
    const result = validateRows([rows[5]], userSchema)
    const boolErr = result.errors.find((e) => e.column === 'active')
    expect(boolErr).toBeDefined()
    expect(boolErr!.value).toBe('maybe')
  })

  it('row 7 — non-ISO date format', () => {
    const result = validateRows([rows[6]], userSchema)
    const dateErr = result.errors.find((e) => e.column === 'joined_date')
    expect(dateErr).toBeDefined()
    expect(dateErr!.value).toBe('15/02/2025')
  })

  it('row 8 — non-numeric age', () => {
    const result = validateRows([rows[7]], userSchema)
    const ageErr = result.errors.find((e) => e.column === 'age')
    expect(ageErr).toBeDefined()
    expect(ageErr!.value).toBe('abc')
  })

  it('row 9 is valid', () => {
    const result = validateRows([rows[8]], userSchema)
    expect(result.errors).toHaveLength(0)
  })

  it('row 10 — age above max (120)', () => {
    const result = validateRows([rows[9]], userSchema)
    const ageErr = result.errors.find((e) => e.column === 'age')
    expect(ageErr).toBeDefined()
    expect(ageErr!.value).toBe('200')
  })

  it('full file: 8 errors across 8 rows, 2 valid rows', () => {
    const result = validateRows(rows, userSchema)
    expect(result.totalRows).toBe(10)
    expect(result.errors).toHaveLength(8)
    expect(result.validRows).toBe(2)
  })
})

// ─── Products schema ──────────────────────────────────────────────────────────

const productSchema: ColumnDef[] = [
  { name: 'sku', type: 'string', required: true },
  { name: 'name', type: 'string', required: true },
  {
    name: 'category',
    type: 'string',
    required: true,
    enum: ['hardware', 'electronics', 'furniture'],
  },
  { name: 'price', type: 'number', required: true, min: 0 },
  { name: 'stock', type: 'number', required: true, min: 0, max: 10000 },
  {
    name: 'status',
    type: 'string',
    required: true,
    enum: ['active', 'inactive'],
  },
]

describe('products-valid.csv', () => {
  const { rows } = loadSample('products-valid.csv')

  it('parses 10 rows', () => {
    expect(rows).toHaveLength(10)
  })

  it('produces no validation errors', () => {
    const result = validateRows(rows, productSchema)
    expect(result.errors).toHaveLength(0)
    expect(result.validRows).toBe(10)
  })
})

describe('products-with-errors.csv', () => {
  const { rows } = loadSample('products-with-errors.csv')

  it('parses 10 rows', () => {
    expect(rows).toHaveLength(10)
  })

  it('row 1 is valid', () => {
    expect(validateRows([rows[0]], productSchema).errors).toHaveLength(0)
  })

  it('row 2 — required name is missing', () => {
    const result = validateRows([rows[1]], productSchema)
    const err = result.errors.find((e) => e.column === 'name')
    expect(err?.message).toBe('This field is required')
  })

  it('row 3 — category not in enum and stock below min', () => {
    const result = validateRows([rows[2]], productSchema)
    const catErr = result.errors.find((e) => e.column === 'category')
    const stockErr = result.errors.find((e) => e.column === 'stock')
    expect(catErr?.value).toBe('gadgets')
    expect(stockErr?.value).toBe('-10')
  })

  it('row 4 — price is not a number', () => {
    const result = validateRows([rows[3]], productSchema)
    const err = result.errors.find((e) => e.column === 'price')
    expect(err?.value).toBe('free')
  })

  it('row 5 — status not in enum', () => {
    const result = validateRows([rows[4]], productSchema)
    const err = result.errors.find((e) => e.column === 'status')
    expect(err?.value).toBe('discontinued')
  })

  it('row 6 is valid', () => {
    expect(validateRows([rows[5]], productSchema).errors).toHaveLength(0)
  })

  it('row 7 — required price is missing', () => {
    const result = validateRows([rows[6]], productSchema)
    const err = result.errors.find((e) => e.column === 'price')
    expect(err?.message).toBe('This field is required')
  })

  it('row 8 — stock above max (10000)', () => {
    const result = validateRows([rows[7]], productSchema)
    const err = result.errors.find((e) => e.column === 'stock')
    expect(err?.value).toBe('999999')
  })

  it('row 9 is valid', () => {
    expect(validateRows([rows[8]], productSchema).errors).toHaveLength(0)
  })

  it('row 10 — status "ACTIVE" fails case-sensitive enum', () => {
    const result = validateRows([rows[9]], productSchema)
    const err = result.errors.find((e) => e.column === 'status')
    expect(err?.value).toBe('ACTIVE')
  })

  it('full file: 8 errors across 7 rows, 3 valid rows', () => {
    const result = validateRows(rows, productSchema)
    expect(result.totalRows).toBe(10)
    expect(result.errors).toHaveLength(8)
    expect(result.validRows).toBe(3)
  })
})

// ─── Malformed CSV samples ────────────────────────────────────────────────────

describe('malformed-too-many-fields.csv', () => {
  it('throws a CSV parse error', () => {
    const content = readFileSync(
      join(SAMPLES, 'malformed-too-many-fields.csv'),
      'utf-8',
    )
    expect(() => parseCsvString(content)).toThrow('CSV parse error:')
  })
})

describe('malformed-unclosed-quote.csv', () => {
  it('throws a CSV parse error', () => {
    const content = readFileSync(
      join(SAMPLES, 'malformed-unclosed-quote.csv'),
      'utf-8',
    )
    expect(() => parseCsvString(content)).toThrow('CSV parse error:')
  })
})
