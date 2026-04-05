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
import { getLocale } from '@/paraglide/runtime'
import type { ColumnDef, RowError, ValidationResult } from '@/types/validator'
import { spawnWorker } from '@/utils/spawn-worker'

export type ValidatorMessages = {
  required: string
  mustBeNumber: string
  numberMin: (min: number) => string
  numberMax: (max: number) => string
  mustBeEmail: string
  mustBeUrl: string
  mustBeDate: string
  mustBeBoolean: string
  stringMinLength: (min: number) => string
  stringMaxLength: (max: number) => string
  enum: (values: string) => string
}

export function getValidatorMessages(): ValidatorMessages {
  return {
    required: m.validator_error_required(),
    mustBeNumber: m.validator_error_must_be_number(),
    numberMin: (min) => m.validator_error_number_min({ min }),
    numberMax: (max) => m.validator_error_number_max({ max }),
    mustBeEmail: m.validator_error_must_be_email(),
    mustBeUrl: m.validator_error_must_be_url(),
    mustBeDate: m.validator_error_must_be_date(),
    mustBeBoolean: m.validator_error_must_be_boolean(),
    stringMinLength: (min) => m.validator_error_string_min_length({ min }),
    stringMaxLength: (max) => m.validator_error_string_max_length({ max }),
    enum: (values) => m.validator_error_enum({ values }),
  }
}

function buildColumnValidator(
  col: ColumnDef,
  messages: ValidatorMessages,
): BaseSchema<unknown, unknown, BaseIssue<unknown>> {
  let schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>

  switch (col.type) {
    case 'number': {
      const checks: PipeItem<string, string, BaseIssue<unknown>>[] = [
        check(
          (val) => val.trim() !== '' && !isNaN(Number(val)),
          messages.mustBeNumber,
        ),
      ]
      if (col.min !== undefined) {
        const min = col.min
        checks.push(check((val) => Number(val) >= min, messages.numberMin(min)))
      }
      if (col.max !== undefined) {
        const max = col.max
        checks.push(check((val) => Number(val) <= max, messages.numberMax(max)))
      }
      schema = pipe(string(), ...checks)
      break
    }
    case 'email': {
      const pipes: PipeItem<string, string, BaseIssue<unknown>>[] = [
        email(messages.mustBeEmail),
      ]
      if (col.minLength !== undefined) pipes.push(minLength(col.minLength))
      if (col.maxLength !== undefined) pipes.push(maxLength(col.maxLength))
      schema = pipe(string(), ...pipes)
      break
    }
    case 'url': {
      const pipes: PipeItem<string, string, BaseIssue<unknown>>[] = [
        url(messages.mustBeUrl),
      ]
      if (col.minLength !== undefined) pipes.push(minLength(col.minLength))
      if (col.maxLength !== undefined) pipes.push(maxLength(col.maxLength))
      schema = pipe(string(), ...pipes)
      break
    }
    case 'date': {
      schema = pipe(string(), isoDate(messages.mustBeDate))
      break
    }
    case 'boolean': {
      schema = pipe(
        string(),
        regex(/^(true|false|yes|no|1|0)$/i, messages.mustBeBoolean),
      )
      break
    }
    default: {
      // string
      const pipes: PipeItem<string, string, BaseIssue<unknown>>[] = []
      if (col.minLength !== undefined)
        pipes.push(
          minLength(col.minLength, messages.stringMinLength(col.minLength)),
        )
      if (col.maxLength !== undefined)
        pipes.push(
          maxLength(col.maxLength, messages.stringMaxLength(col.maxLength)),
        )
      if (col.enum && col.enum.length > 0) {
        const allowed = col.enum
        pipes.push(
          check(
            (val) => allowed.includes(val),
            messages.enum(allowed.join(', ')),
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
  messages: ValidatorMessages = getValidatorMessages(),
): ValidationResult {
  const errors: RowError[] = []
  const errorRows = new Set<number>()

  // Build column validators once, not once per row.
  const validators = columns.map((col) => buildColumnValidator(col, messages))

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1

    for (let j = 0; j < columns.length; j++) {
      const col = columns[j]
      const rawValue = row[col.name]

      // Handle required/optional missing values
      if (!rawValue) {
        if (col.required) {
          errors.push({
            row: rowNum,
            column: col.name,
            value: rawValue ?? '',
            message: messages.required,
          })
          errorRows.add(rowNum)
        }
        continue
      }

      const result = safeParse(validators[j], rawValue)

      if (!result.success) {
        const firstIssue = result.issues[0]
        errors.push({
          row: rowNum,
          column: col.name,
          value: rawValue,
          message: firstIssue.message,
        })
        errorRows.add(rowNum)
      }
    }
  }

  const validRows = rows.length - errorRows.size

  return { totalRows: rows.length, validRows, errors }
}

type ValidatorWorkerRequest = {
  rows: Record<string, string | undefined>[]
  columns: ColumnDef[]
  locale: string
}

export function validateRowsInWorker(
  rows: Record<string, string | undefined>[],
  columns: ColumnDef[],
): Promise<ValidationResult> {
  return spawnWorker<ValidatorWorkerRequest, ValidationResult>(
    new URL('../workers/validator.worker.ts', import.meta.url),
    { rows, columns, locale: getLocale() },
  )
}
