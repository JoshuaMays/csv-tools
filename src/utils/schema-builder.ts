import type { BaseIssue, BaseSchema, PipeItem } from 'valibot'
import {
  check,
  email,
  isoDate,
  maxLength,
  minLength,
  optional,
  pipe,
  regex,
  safeParse,
  string,
  url,
} from 'valibot'

import { m } from '@/paraglide/messages'
import type { ColumnDef, RowError, ValidationResult } from '@/types/validator'

function buildColumnValidator(
  col: ColumnDef,
): BaseSchema<unknown, unknown, BaseIssue<unknown>> {
  let schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>

  switch (col.type) {
    case 'number': {
      const checks: PipeItem<string, string, BaseIssue<unknown>>[] = [
        check(
          (val) => val.trim() !== '' && !isNaN(Number(val)),
          m.validator_error_must_be_number(),
        ),
      ]
      if (col.min !== undefined) {
        const min = col.min
        checks.push(
          check(
            (val) => Number(val) >= min,
            m.validator_error_number_min({ min }),
          ),
        )
      }
      if (col.max !== undefined) {
        const max = col.max
        checks.push(
          check(
            (val) => Number(val) <= max,
            m.validator_error_number_max({ max }),
          ),
        )
      }
      schema = pipe(string(), ...checks)
      break
    }
    case 'email': {
      const pipes: PipeItem<string, string, BaseIssue<unknown>>[] = [
        email(m.validator_error_must_be_email()),
      ]
      if (col.minLength !== undefined) pipes.push(minLength(col.minLength))
      if (col.maxLength !== undefined) pipes.push(maxLength(col.maxLength))
      schema = pipe(string(), ...pipes)
      break
    }
    case 'url': {
      const pipes: PipeItem<string, string, BaseIssue<unknown>>[] = [
        url(m.validator_error_must_be_url()),
      ]
      if (col.minLength !== undefined) pipes.push(minLength(col.minLength))
      if (col.maxLength !== undefined) pipes.push(maxLength(col.maxLength))
      schema = pipe(string(), ...pipes)
      break
    }
    case 'date': {
      schema = pipe(string(), isoDate(m.validator_error_must_be_date()))
      break
    }
    case 'boolean': {
      schema = pipe(
        string(),
        regex(
          /^(true|false|yes|no|1|0)$/i,
          m.validator_error_must_be_boolean(),
        ),
      )
      break
    }
    default: {
      // string
      const pipes: PipeItem<string, string, BaseIssue<unknown>>[] = []
      if (col.minLength !== undefined)
        pipes.push(
          minLength(
            col.minLength,
            m.validator_error_string_min_length({ min: col.minLength }),
          ),
        )
      if (col.maxLength !== undefined)
        pipes.push(
          maxLength(
            col.maxLength,
            m.validator_error_string_max_length({ max: col.maxLength }),
          ),
        )
      if (col.enum && col.enum.length > 0) {
        const allowed = col.enum
        pipes.push(
          check(
            (val) => allowed.includes(val),
            m.validator_error_enum({ values: allowed.join(', ') }),
          ),
        )
      }
      schema = pipes.length > 0 ? pipe(string(), ...pipes) : string()
      break
    }
  }

  return col.required ? schema : optional(schema)
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
            message: m.validator_error_required(),
          })
        }
        continue
      }

      const colSchema = buildColumnValidator(col)
      const result = safeParse(colSchema, rawValue)

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
