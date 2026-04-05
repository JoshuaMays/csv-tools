import type { ColumnDef, ColumnType } from '@/types/validator'

type UseSchemaBuilderProps = {
  columns: ColumnDef[]
  onChange: (columns: ColumnDef[]) => void
}

type UseSchemaBuilderReturn = {
  handleType: (index: number, type: ColumnType) => void
  handleField: <TKey extends keyof ColumnDef>(
    index: number,
    key: TKey,
    value: ColumnDef[TKey],
  ) => void
  handleEnumChange: (index: number, raw: string) => void
}

function updateColumn(
  columns: ColumnDef[],
  index: number,
  patch: Partial<ColumnDef>,
): ColumnDef[] {
  return columns.map((col, i) => (i === index ? { ...col, ...patch } : col))
}

export function useSchemaBuilder({
  columns,
  onChange,
}: UseSchemaBuilderProps): UseSchemaBuilderReturn {
  function handleType(index: number, type: ColumnType) {
    // Clear type-specific constraints when changing type
    const {
      minLength: _minLength,
      maxLength: _maxLength,
      enum: _enum,
      min: _min,
      max: _max,
      ...rest
    } = columns[index]
    onChange(updateColumn(columns, index, { ...rest, type }))
  }

  function handleField<TKey extends keyof ColumnDef>(
    index: number,
    key: TKey,
    value: ColumnDef[TKey],
  ) {
    onChange(updateColumn(columns, index, { [key]: value }))
  }

  function handleEnumChange(index: number, raw: string) {
    const values = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onChange(
      updateColumn(columns, index, {
        enum: values.length ? values : undefined,
      }),
    )
  }

  return { handleType, handleField, handleEnumChange }
}
