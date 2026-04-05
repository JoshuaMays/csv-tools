export type ColumnType =
  | 'string'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'boolean'

export type ColumnDef = {
  name: string
  type: ColumnType
  required: boolean
  // string constraints
  minLength?: number
  maxLength?: number
  pattern?: string
  enum?: string[]
  // number constraints
  min?: number
  max?: number
}

export type RowError = {
  row: number
  column: string
  value: string
  message: string
}

export type ValidationResult = {
  totalRows: number
  validRows: number
  errors: RowError[]
}

export type ParsedCsv = {
  headers: string[]
  rows: Record<string, string | undefined>[]
}
