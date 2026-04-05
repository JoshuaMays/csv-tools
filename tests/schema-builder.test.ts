import { describe, it, expect } from 'vitest'

import { validateRows, getValidatorMessages } from '@/utils/schema-builder'
import type { ColumnDef } from '@/types/validator'

describe('validateRows – string type', () => {
  const col: ColumnDef = { name: 'name', type: 'string', required: true }

  it('passes a valid string', () => {
    const result = validateRows([{ name: 'Alice' }], [col])
    expect(result.errors).toHaveLength(0)
    expect(result.validRows).toBe(1)
    expect(result.totalRows).toBe(1)
  })

  it('fails when required field is empty', () => {
    const result = validateRows([{ name: '' }], [col])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toBe('This field is required')
  })

  it('passes when optional field is empty', () => {
    const result = validateRows([{ name: '' }], [{ ...col, required: false }])
    expect(result.errors).toHaveLength(0)
  })

  it('fails when required field is whitespace-only', () => {
    const result = validateRows([{ name: '   ' }], [col])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toBe('This field is required')
  })

  it('passes when optional field is whitespace-only', () => {
    const result = validateRows(
      [{ name: '   ' }],
      [{ ...col, required: false }],
    )
    expect(result.errors).toHaveLength(0)
  })

  it('enforces minLength', () => {
    const c: ColumnDef = { ...col, minLength: 3 }
    const result = validateRows([{ name: 'ab' }], [c])
    expect(result.errors).toHaveLength(1)
  })

  it('enforces maxLength', () => {
    const c: ColumnDef = { ...col, maxLength: 4 }
    const result = validateRows([{ name: 'toolongname' }], [c])
    expect(result.errors).toHaveLength(1)
  })

  it('enforces enum', () => {
    const c: ColumnDef = { ...col, enum: ['active', 'inactive'] }
    expect(validateRows([{ name: 'pending' }], [c]).errors).toHaveLength(1)
    expect(validateRows([{ name: 'active' }], [c]).errors).toHaveLength(0)
  })
})

describe('validateRows – number type', () => {
  const col: ColumnDef = { name: 'age', type: 'number', required: true }

  it('passes a valid numeric string', () => {
    expect(validateRows([{ age: '25' }], [col]).errors).toHaveLength(0)
  })

  it('fails a non-numeric string', () => {
    expect(validateRows([{ age: 'abc' }], [col]).errors).toHaveLength(1)
  })

  it('enforces min', () => {
    const c: ColumnDef = { ...col, min: 18 }
    expect(validateRows([{ age: '10' }], [c]).errors).toHaveLength(1)
    expect(validateRows([{ age: '18' }], [c]).errors).toHaveLength(0)
  })

  it('enforces max', () => {
    const c: ColumnDef = { ...col, max: 100 }
    expect(validateRows([{ age: '150' }], [c]).errors).toHaveLength(1)
    expect(validateRows([{ age: '100' }], [c]).errors).toHaveLength(0)
  })
})

describe('validateRows – email type', () => {
  const col: ColumnDef = { name: 'email', type: 'email', required: true }

  it('passes a valid email', () => {
    expect(
      validateRows([{ email: 'user@example.com' }], [col]).errors,
    ).toHaveLength(0)
  })

  it('fails an invalid email', () => {
    expect(
      validateRows([{ email: 'not-an-email' }], [col]).errors,
    ).toHaveLength(1)
  })
})

describe('validateRows – url type', () => {
  const col: ColumnDef = { name: 'website', type: 'url', required: true }

  it('passes a valid URL', () => {
    expect(
      validateRows([{ website: 'https://example.com' }], [col]).errors,
    ).toHaveLength(0)
  })

  it('fails an invalid URL', () => {
    expect(validateRows([{ website: 'not a url' }], [col]).errors).toHaveLength(
      1,
    )
  })
})

describe('validateRows – date type', () => {
  const col: ColumnDef = { name: 'dob', type: 'date', required: true }

  it('passes a valid ISO date', () => {
    expect(validateRows([{ dob: '2000-01-15' }], [col]).errors).toHaveLength(0)
  })

  it('fails a non-ISO date', () => {
    expect(validateRows([{ dob: '01/15/2000' }], [col]).errors).toHaveLength(1)
  })
})

describe('validateRows – boolean type', () => {
  const col: ColumnDef = { name: 'active', type: 'boolean', required: true }

  it.each(['true', 'false', 'yes', 'no', '1', '0', 'TRUE', 'YES'])(
    'passes "%s"',
    (val) => {
      expect(validateRows([{ active: val }], [col]).errors).toHaveLength(0)
    },
  )

  it('fails an invalid boolean', () => {
    expect(validateRows([{ active: 'maybe' }], [col]).errors).toHaveLength(1)
  })
})

describe('validateRows – multi-column and multi-row', () => {
  const columns: ColumnDef[] = [
    { name: 'name', type: 'string', required: true, minLength: 2 },
    { name: 'age', type: 'number', required: true, min: 0 },
    { name: 'email', type: 'email', required: false },
  ]

  it('counts validRows correctly when some rows have errors', () => {
    const rows = [
      { name: 'Alice', age: '30', email: 'alice@example.com' },
      { name: 'B', age: '25', email: '' }, // name too short
      { name: 'Carol', age: 'bad', email: '' }, // age invalid
    ]
    const result = validateRows(rows, columns)
    expect(result.totalRows).toBe(3)
    expect(result.validRows).toBe(1)
    expect(result.errors).toHaveLength(2)
  })

  it('a row with multiple column errors counts as one invalid row', () => {
    const cols: ColumnDef[] = [
      { name: 'email', type: 'email', required: true },
      { name: 'age', type: 'number', required: true },
    ]
    const result = validateRows([{ email: 'bad', age: 'bad' }], cols)
    expect(result.errors).toHaveLength(2)
    expect(result.totalRows).toBe(1)
    expect(result.validRows).toBe(0)
  })
})

describe('getValidatorMessages', () => {
  it('returns strings for all scalar message properties', () => {
    const msgs = getValidatorMessages()
    expect(typeof msgs.required).toBe('string')
    expect(typeof msgs.mustBeNumber).toBe('string')
    expect(typeof msgs.mustBeEmail).toBe('string')
    expect(typeof msgs.mustBeUrl).toBe('string')
    expect(typeof msgs.mustBeDate).toBe('string')
    expect(typeof msgs.mustBeBoolean).toBe('string')
  })

  it('returns strings from all function message properties when called', () => {
    const msgs = getValidatorMessages()
    expect(typeof msgs.numberMin(5)).toBe('string')
    expect(typeof msgs.numberMax(100)).toBe('string')
    expect(typeof msgs.stringMinLength(3)).toBe('string')
    expect(typeof msgs.stringMaxLength(50)).toBe('string')
    expect(typeof msgs.enum('a, b, c')).toBe('string')
  })

  it('interpolates values into parameterised messages', () => {
    const msgs = getValidatorMessages()
    expect(msgs.numberMin(18)).toContain('18')
    expect(msgs.numberMax(65)).toContain('65')
    expect(msgs.stringMinLength(2)).toContain('2')
    expect(msgs.stringMaxLength(10)).toContain('10')
    expect(msgs.enum('yes, no')).toContain('yes, no')
  })
})
