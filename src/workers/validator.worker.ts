/// <reference lib="webworker" />

import { overwriteGetLocale, locales, baseLocale } from '@/paraglide/runtime'
import { validateRows, getValidatorMessages } from '@/utils/schema-builder'
import type { WorkerResponse } from '@/utils/spawn-worker'
import type { ColumnDef, ValidationResult } from '@/types/validator'

type Locale = (typeof locales)[number]

type ValidatorWorkerRequest = {
  rows: Record<string, string | undefined>[]
  columns: ColumnDef[]
  locale: string
}

self.onmessage = (event: MessageEvent<ValidatorWorkerRequest>) => {
  const { rows, columns, locale } = event.data
  const safeLocale: Locale = (locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : baseLocale
  overwriteGetLocale(() => safeLocale)
  const messages = getValidatorMessages()
  try {
    const result = validateRows(rows, columns, messages)
    const response: WorkerResponse<ValidationResult> = {
      ok: true,
      data: result,
    }
    self.postMessage(response)
  } catch (err) {
    const response: WorkerResponse<ValidationResult> = {
      ok: false,
      error: err instanceof Error ? err.message : 'Validation failed',
    }
    self.postMessage(response)
  }
}
