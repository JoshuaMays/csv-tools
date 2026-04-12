import { useReducer } from 'react'

import { m } from '@/paraglide/messages'
import { WorkerError } from '@/utils/spawn-worker'
import type { ColumnDef, ParsedCsv, ValidationResult } from '@/types/validator'

export const STAGES = ['upload', 'schema', 'results'] as const
export type Stage = (typeof STAGES)[number]

type ValidatorState = {
  stage: Stage
  error: string | null
  announcement: string
  rows: Record<string, string | undefined>[]
  columns: ColumnDef[]
  result: ValidationResult | null
}

type ValidatorAction =
  | { type: 'PARSED'; payload: ParsedCsv }
  | { type: 'COLUMNS_CHANGED'; payload: ColumnDef[] }
  | { type: 'VALIDATED'; payload: ValidationResult }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' }

const initialState: ValidatorState = {
  stage: 'upload',
  error: null,
  announcement: '',
  rows: [],
  columns: [],
  result: null,
}

function validatorReducer(
  state: ValidatorState,
  action: ValidatorAction,
): ValidatorState {
  switch (action.type) {
    case 'PARSED':
      return {
        ...state,
        stage: 'schema',
        error: null,
        rows: action.payload.rows,
        columns: action.payload.headers.map((header) => ({
          name: header,
          type: 'string',
          required: false,
        })),
        announcement: m.validator_announcement_schema(),
      }
    case 'COLUMNS_CHANGED':
      return { ...state, columns: action.payload }
    case 'VALIDATED':
      return {
        ...state,
        stage: 'results',
        result: action.payload,
        announcement: m.validator_announcement_results(),
      }
    case 'ERROR':
      return { ...state, error: action.payload }
    case 'RESET':
      return {
        ...initialState,
        announcement: m.validator_announcement_upload(),
      }
  }
}

type UseValidatorFlowReturn = {
  stage: Stage
  error: string | null
  announcement: string
  columns: ColumnDef[]
  result: ValidationResult | null
  handleParsed: (data: ParsedCsv) => void
  handleColumnsChange: (columns: ColumnDef[]) => void
  handleValidate: () => Promise<void>
  handleReset: () => void
  handleError: (message: string) => void
}

export function useValidatorFlow(): UseValidatorFlowReturn {
  const [state, dispatch] = useReducer(validatorReducer, initialState)

  function handleParsed(data: ParsedCsv) {
    dispatch({ type: 'PARSED', payload: data })
  }

  async function handleValidate() {
    try {
      const { validateRowsInWorker } = await import('@/utils/schema-builder')
      const result = await validateRowsInWorker(state.rows, state.columns)
      dispatch({ type: 'VALIDATED', payload: result })
    } catch (err) {
      dispatch({
        type: 'ERROR',
        payload:
          err instanceof WorkerError
            ? m.validator_error_validation_failed()
            : err instanceof Error
              ? err.message
              : m.validator_error_validation_failed(),
      })
    }
  }

  return {
    stage: state.stage,
    error: state.error,
    announcement: state.announcement,
    columns: state.columns,
    result: state.result,
    handleParsed,
    handleColumnsChange: (columns) =>
      dispatch({ type: 'COLUMNS_CHANGED', payload: columns }),
    handleValidate,
    handleReset: () => dispatch({ type: 'RESET' }),
    handleError: (message) => dispatch({ type: 'ERROR', payload: message }),
  }
}
