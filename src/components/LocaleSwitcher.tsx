// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale
import { useEffect, useState } from 'react'

import { getLocale, locales, setLocale } from '@/paraglide/runtime'
import { m } from '@/paraglide/messages'

export default function LocaleSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<string | null>(null)

  useEffect(() => {
    setCurrentLocale(getLocale())
  }, [])

  if (currentLocale === null) return null

  return (
    <div className="flex items-center gap-1 text-(--text-base)">
      <select
        className="select select-ghost select-sm font-medium text-(--text-base)"
        value={currentLocale}
        onChange={(e) => setLocale(e.target.value as (typeof locales)[number])}
        aria-label={m.language_label()}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {locale.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  )
}
