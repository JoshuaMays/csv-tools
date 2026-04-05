import * as v from 'valibot'
import type { ColumnDef, RowError, ValidationResult } from '@/types/validator'

function buildColumnValidator(
  col: ColumnDef,
): v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> {
  let schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>

  switch (col.type) {
    case 'number': {
      const checks: v.PipeItem<string, string, v.BaseIssue<unknown>>[] = [
        v.check(
          (val) => val.trim() !== '' && !isNaN(Number(val)),
          'Must be a valid number',
        ),
      ]
      if (col.min !== undefined) {
        const min = col.min
        checks.push(
          v.check((val) => Number(val) >= min, `Must be at least ${min}`),
        )
      }
      if (col.max !== undefined) {
        const max = col.max
        checks.push(
          v.check((val) => Number(val) <= max, `Must be at most ${max}`),
        )
      }
      schema = v.pipe(v.string(), ...checks)
      break
    }
    case 'email': {
      const pipes: v.PipeItem<string, string, v.BaseIssue<unknown>>[] = [
        v.email('Must be a valid email address'),
      ]
      if (col.minLength !== undefined) pipes.push(v.minLength(col.minLength))
      if (col.maxLength !== undefined) pipes.push(v.maxLength(col.maxLength))
      schema = v.pipe(v.string(), ...pipes)
      break
    }
    case 'url': {
      const pipes: v.PipeItem<string, string, v.BaseIssue<unknown>>[] = [
        v.url('Must be a valid URL'),
      ]
      if (col.minLength !== undefined) pipes.push(v.minLength(col.minLength))
      if (col.maxLength !== undefined) pipes.push(v.maxLength(col.maxLength))
      schema = v.pipe(v.string(), ...pipes)
      break
    }
    case 'date': {
      schema = v.pipe(
        v.string(),
        v.isoDate('Must be a valid ISO date (YYYY-MM-DD)'),
      )
      break
    }
    case 'boolean': {
      schema = v.pipe(
        v.string(),
        v.regex(
          /^(true|false|yes|no|1|0)$/i,
          'Must be true/false, yes/no, or 1/0',
        ),
      )
      break
    }
    default: {
      // string
      const pipes: v.PipeItem<string, string, v.BaseIssue<unknown>>[] = []
      if (col.minLength !== undefined)
        pipes.push(
          v.minLength(
            col.minLength,
            `Must be at least ${col.minLength} characters`,
          ),
        )
      if (col.maxLength !== undefined)
        pipes.push(
          v.maxLength(
            col.maxLength,
            `Must be at most ${col.maxLength} characters`,
          ),
        )
      if (col.pattern)
        pipes.push(
          v.regex(
            new RegExp(col.pattern),
            `Must match pattern: ${col.pattern}`,
          ),
        )
      if (col.enum && col.enum.length > 0) {
        const allowed = col.enum
        pipes.push(
          v.check(
            (val) => allowed.includes(val),
            `Must be one of: ${allowed.join(', ')}`,
          ),
        )
      }
      schema = pipes.length > 0 ? v.pipe(v.string(), ...pipes) : v.string()
      break
    }
  }

  return col.required ? schema : v.optional(schema)
}

export function validateRows(
  rows: Record<string, string | undefined>[],
  columns: ColumnDef[],
): ValidationResult {
  const errors: RowError[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1

    for (const col of columns) {
      const rawValue = row[col.name]

      // Handle required/optional missing values
      if (!rawValue) {
        if (col.required) {
          errors.push({
            row: rowNum,
            column: col.name,
            value: rawValue ?? '',
            message: 'This field is required',
          })
        }
        continue
      }

      const colSchema = buildColumnValidator(col)
      const result = v.safeParse(colSchema, rawValue)

      if (!result.success) {
        const firstIssue = result.issues[0]
        errors.push({
          row: rowNum,
          column: col.name,
          value: rawValue,
          message: firstIssue.message,
        })
      }
    }
  }

  const errorRows = new Set(errors.map((e) => e.row))
  const validRows = rows.length - errorRows.size

  return { totalRows: rows.length, validRows, errors }
}
