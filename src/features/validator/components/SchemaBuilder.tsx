import type { ColumnDef, ColumnType } from '@/types/validator'

const COLUMN_TYPES: { value: ColumnType; label: string }[] = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date (ISO)' },
  { value: 'boolean', label: 'Boolean' },
]

type Props = {
  columns: ColumnDef[]
  onChange: (columns: ColumnDef[]) => void
  onValidate: () => void
  onChangeFile: () => void
}

function updateColumn(
  columns: ColumnDef[],
  index: number,
  patch: Partial<ColumnDef>,
): ColumnDef[] {
  return columns.map((col, i) => (i === index ? { ...col, ...patch } : col))
}

export default function SchemaBuilder({
  columns,
  onChange,
  onValidate,
  onChangeFile,
}: Props) {
  function handleType(index: number, type: ColumnType) {
    // Clear type-specific constraints when changing type
    const {
      minLength,
      maxLength,
      pattern,
      enum: _enum,
      min,
      max,
      ...rest
    } = columns[index]
    void minLength
    void maxLength
    void pattern
    void _enum
    void min
    void max
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-(--sea-ink)">Define Schema</h2>
          <button
            onClick={onChangeFile}
            className="text-sm font-semibold text-(--sea-ink-soft) underline underline-offset-2 hover:text-(--sea-ink)"
          >
            Change file
          </button>
        </div>
        <p className="text-sm text-(--sea-ink-soft)">
          Set validation rules for each detected column.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {columns.map((col, i) => (
          <div
            key={col.name}
            className="island-shell flex flex-col gap-3 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold text-(--sea-ink)">
                {col.name}
              </span>
              <label className="flex cursor-pointer items-center gap-1.5 text-sm text-(--sea-ink-soft)">
                <input
                  type="checkbox"
                  checked={col.required}
                  onChange={(e) => handleField(i, 'required', e.target.checked)}
                  className="accent-(--lagoon)"
                />
                Required
              </label>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                Type
              </label>
              <select
                value={col.type}
                onChange={(e) => handleType(i, e.target.value as ColumnType)}
                className="w-full rounded-lg border border-(--line) bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-(--lagoon)"
              >
                {COLUMN_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {(col.type === 'string' ||
              col.type === 'email' ||
              col.type === 'url') && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Min length
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="—"
                    value={col.minLength ?? ''}
                    onChange={(e) =>
                      handleField(
                        i,
                        'minLength',
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="w-full rounded-lg border border-(--line) bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-(--lagoon)"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Max length
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="—"
                    value={col.maxLength ?? ''}
                    onChange={(e) =>
                      handleField(
                        i,
                        'maxLength',
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="w-full rounded-lg border border-(--line) bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-(--lagoon)"
                  />
                </div>
              </div>
            )}

            {col.type === 'string' && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Pattern (regex)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ^[A-Z]+"
                    value={col.pattern ?? ''}
                    onChange={(e) =>
                      handleField(i, 'pattern', e.target.value || undefined)
                    }
                    className="w-full rounded-lg border border-(--line) bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-(--lagoon)"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Allowed values (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. active, inactive, pending"
                    value={col.enum?.join(', ') ?? ''}
                    onChange={(e) => handleEnumChange(i, e.target.value)}
                    className="w-full rounded-lg border border-(--line) bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-(--lagoon)"
                  />
                </div>
              </>
            )}

            {col.type === 'number' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Min value
                  </label>
                  <input
                    type="number"
                    placeholder="—"
                    value={col.min ?? ''}
                    onChange={(e) =>
                      handleField(
                        i,
                        'min',
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="w-full rounded-lg border border-(--line) bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-(--lagoon)"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Max value
                  </label>
                  <input
                    type="number"
                    placeholder="—"
                    value={col.max ?? ''}
                    onChange={(e) =>
                      handleField(
                        i,
                        'max',
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="w-full rounded-lg border border-(--line) bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-(--lagoon)"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onValidate}
        className="self-start rounded-full bg-(--lagoon) px-6 py-2.5 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90 active:opacity-75"
      >
        Run Validation
      </button>
    </div>
  )
}
