import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark' | 'auto'

const CYCLE: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
}

const ICON: Record<ThemeMode, React.ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />,
  auto: <Monitor size={16} />,
}

const LABEL: Record<ThemeMode, string> = {
  light: 'Theme: light — switch to dark',
  dark: 'Theme: dark — switch to auto',
  auto: 'Theme: auto (system) — switch to light',
}

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }

  return 'auto'
}

function applyThemeMode(mode: ThemeMode) {
  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  function toggleMode() {
    const next = CYCLE[mode]
    setMode(next)
    applyThemeMode(next)
    window.localStorage.setItem('theme', next)
  }

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={LABEL[mode]}
      className="btn btn-ghost btn-sm text-(--text-base)"
    >
      {ICON[mode]}
    </button>
  )
}
