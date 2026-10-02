import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'fundi:theme'

const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

// The viewer's explicit choice; null means "follow the device".
let choice: Theme | null = stored()

function current(): Theme {
  return choice ?? (media().matches ? 'dark' : 'light')
}

const listeners = new Set<() => void>()

function apply() {
  const t = choice
  if (t) document.documentElement.dataset.theme = t
  else delete document.documentElement.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', current() === 'dark' ? '#0b1411' : '#0d4a3a')
  listeners.forEach((l) => l())
}

export function initTheme() {
  apply()
  media().addEventListener('change', apply)
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    current,
  )
  return {
    theme,
    toggle: () => {
      choice = theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(KEY, choice)
      } catch {
        // Storage blocked: the choice still applies for this visit.
      }
      apply()
    },
  }
}
