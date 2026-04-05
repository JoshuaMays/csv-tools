import { CheckCircle, XCircle } from 'lucide-react'

import { m } from '@/paraglide/messages'
import type { ValidationResult } from '@/types/validator'

type Props = {
  result: ValidationResult
  onReset: () => void
}

export default function ValidationResults({ result, onReset }: Props) {
  const { totalRows, validRows, errors } = result
  const allValid = errors.length === 0

  return (
    <div className="flex flex-col gap-6">
      {/* Summary banner */}
      <div
        role="status"
        aria-live="polite"
        className={[
          'island-shell flex items-center gap-4 rounded-2xl p-5',
          allValid ? 'bg-(--hero-b)' : 'bg-[rgba(220,38,38,0.06)]',
        ].join(' ')}
      >
        {allValid ? (
          <CheckCircle
            size={28}
            aria-hidden={true}
            className="shrink-0 text-(--palm)"
          />
        ) : (
          <XCircle
            size={28}
            aria-hidden={true}
            className="shrink-0 text-red-500"
          />
        )}
        <div>
          <p className="font-bold text-(--sea-ink)">
            {allValid
              ? m.validator_results_all_valid()
              : m.validator_results_errors_found({ count: errors.length })}
          </p>
          <p className="text-sm text-(--sea-ink-soft)">
            {m.validator_results_rows_passed({
              valid: validRows,
              total: totalRows,
            })}
          </p>
        </div>
      </div>

      {/* Error table */}
      {errors.length > 0 && (
        <div className="island-shell overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                {m.validator_results_table_caption()}
              </caption>
              <thead>
                <tr className="border-b border-(--line) text-left text-xs font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                  <th className="px-4 py-3">{m.validator_results_col_row()}</th>
                  <th className="px-4 py-3">
                    {m.validator_results_col_column()}
                  </th>
                  <th className="px-4 py-3">
                    {m.validator_results_col_value()}
                  </th>
                  <th className="px-4 py-3">
                    {m.validator_results_col_error()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err) => (
                  <tr
                    key={`${err.row}:${err.column}:${err.message}`}
                    className="border-b border-(--line) last:border-0 hover:bg-(--hero-a)"
                  >
                    <td className="px-4 py-3 font-mono text-(--sea-ink)">
                      {err.row}
                    </td>
                    <td className="px-4 py-3 font-semibold text-(--sea-ink)">
                      {err.column}
                    </td>
                    <td className="max-w-50 truncate px-4 py-3 font-mono text-(--sea-ink-soft)">
                      {err.value || (
                        <em className="opacity-50">
                          {m.validator_results_empty_value()}
                        </em>
                      )}
                    </td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400">
                      {err.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="self-start rounded-full border border-(--line) bg-(--chip-bg) px-5 py-2 text-sm font-semibold text-(--sea-ink) transition-colors hover:bg-(--link-bg-hover)"
      >
        {m.validator_start_over()}
      </button>
    </div>
  )
}
