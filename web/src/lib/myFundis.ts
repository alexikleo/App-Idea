// "My Fundis": saved providers and recently viewed, kept on this device.
// Moves to the user's account once logins exist (Phase 2).

import { useSyncExternalStore } from 'react'

const KEY = 'fundi:my-fundis:v1'
const MAX_RECENT = 8

interface State {
  saved: string[]
  recent: string[]
}

function read(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { saved: [], recent: [], ...(JSON.parse(raw) as Partial<State>) }
  } catch {
    // Storage unavailable: start empty.
  }
  return { saved: [], recent: [] }
}

let state = read()
const listeners = new Set<() => void>()

function write(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Keep working in memory.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useMyFundis() {
  const snapshot = useSyncExternalStore(subscribe, () => state)
  return {
    saved: snapshot.saved,
    recent: snapshot.recent,
    isSaved: (id: string) => snapshot.saved.includes(id),
    toggleSaved: (id: string) =>
      write({
        ...state,
        saved: state.saved.includes(id) ? state.saved.filter((s) => s !== id) : [id, ...state.saved],
      }),
    clearRecent: () => write({ ...state, recent: [] }),
  }
}

export function recordView(id: string) {
  if (state.recent[0] === id) return
  write({ ...state, recent: [id, ...state.recent.filter((r) => r !== id)].slice(0, MAX_RECENT) })
}
