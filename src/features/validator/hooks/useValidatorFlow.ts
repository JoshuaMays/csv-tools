import { useReducer } from 'react'
import type { ColumnDef, ParsedCsv, ValidationResult } from '@/types/validator'

type Stage = 'upload' | 'schema' | 'results'

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
        announcement:
          'Step 2 of 3: Define schema. Configure column types and validation rules.',
      }
    case 'COLUMNS_CHANGED':
      return { ...state, columns: action.payload }
    case 'VALIDATED':
      return {
        ...state,
        stage: 'results',
        result: action.payload,
        announcement: 'Step 3 of 3: Validation complete.',
      }
    case 'ERROR':
      return { ...state, error: action.payload }
    case 'RESET':
      return {
        ...initialState,
        announcement: 'Step 1 of 3: Upload a CSV file.',
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
      const { validateRows } = await import('@/utils/schema-builder')
      const result = validateRows(state.rows, state.columns)
      dispatch({ type: 'VALIDATED', payload: result })
    } catch (err) {
      dispatch({
        type: 'ERROR',
        payload:
          err instanceof Error
            ? err.message
            : 'Validation failed unexpectedly.',
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
