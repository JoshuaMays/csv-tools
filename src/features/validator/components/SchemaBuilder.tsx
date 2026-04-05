import type { ColumnDef, ColumnType } from '@/types/validator'
import { useSchemaBuilder } from '@/features/validator/hooks/useSchemaBuilder'

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

export default function SchemaBuilder({
  columns,
  onChange,
  onValidate,
  onChangeFile,
}: Props) {
  const { handleType, handleField, handleEnumChange } = useSchemaBuilder({
    columns,
    onChange,
  })

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
          <fieldset
            key={col.name}
            className="island-shell flex flex-col gap-3 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <legend className="float-left truncate font-semibold text-(--sea-ink)">
                {col.name}
              </legend>
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

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                Type
              </span>
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
            </label>

            {(col.type === 'string' ||
              col.type === 'email' ||
              col.type === 'url') && (
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Min length
                  </span>
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
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Max length
                  </span>
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
                </label>
              </div>
            )}

            {col.type === 'string' && (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                  Allowed values (comma-separated)
                </span>
                <input
                  type="text"
                  placeholder="e.g. active, inactive, pending"
                  value={col.enum?.join(', ') ?? ''}
                  onChange={(e) => handleEnumChange(i, e.target.value)}
                  className="w-full rounded-lg border border-(--line) bg-(--chip-bg) px-3 py-2 text-sm text-(--sea-ink) focus:outline-none focus:ring-2 focus:ring-(--lagoon)"
                />
              </label>
            )}

            {col.type === 'number' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Min value
                  </span>
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
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    Max value
                  </span>
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
                </label>
              </div>
            )}
          </fieldset>
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
