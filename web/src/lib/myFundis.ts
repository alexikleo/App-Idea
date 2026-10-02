// "My Fundis": saved providers, recently viewed, the compare/quote shortlist,
// sent quote requests and listings created on this device.
// Moves to the user's account once logins exist (Phase 2).

import { useSyncExternalStore } from 'react'

const KEY = 'fundi:my-fundis:v1'
const MAX_RECENT = 8
export const MAX_SHORTLIST = 3

export type JobTiming = 'asap' | 'this_week' | 'flexible'

export interface QuoteRequest {
  id: string
  categoryId: string
  description: string
  suburb: string
  timing: JobTiming
  providerIds: string[]
  /** Provider ids the customer has tapped "send" for. */
  sentTo: string[]
  createdAt: string
}

interface State {
  saved: string[]
  recent: string[]
  shortlist: string[]
  requests: QuoteRequest[]
  myListings: string[]
}

const EMPTY: State = { saved: [], recent: [], shortlist: [], requests: [], myListings: [] }

function read(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<State>) }
  } catch {
    // Storage unavailable: start empty.
  }
  return EMPTY
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

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((s) => s !== id) : [id, ...list])

export function useMyFundis() {
  const s = useSyncExternalStore(subscribe, () => state)
  return {
    ...s,
    isSaved: (id: string) => s.saved.includes(id),
    toggleSaved: (id: string) => write({ ...state, saved: toggle(state.saved, id) }),
    clearRecent: () => write({ ...state, recent: [] }),

    isShortlisted: (id: string) => s.shortlist.includes(id),
    shortlistFull: s.shortlist.length >= MAX_SHORTLIST,
    /** Returns false when the shortlist is already full. */
    toggleShortlist: (id: string) => {
      if (!state.shortlist.includes(id) && state.shortlist.length >= MAX_SHORTLIST) return false
      write({ ...state, shortlist: state.shortlist.includes(id) ? state.shortlist.filter((x) => x !== id) : [...state.shortlist, id] })
      return true
    },
    clearShortlist: () => write({ ...state, shortlist: [] }),

    addRequest: (req: Omit<QuoteRequest, 'id' | 'createdAt' | 'sentTo'>) => {
      const created: QuoteRequest = { ...req, id: crypto.randomUUID(), sentTo: [], createdAt: new Date().toISOString() }
      write({ ...state, requests: [created, ...state.requests] })
      return created
    },
    markSent: (requestId: string, providerId: string) =>
      write({
        ...state,
        requests: state.requests.map((r) =>
          r.id === requestId && !r.sentTo.includes(providerId) ? { ...r, sentTo: [...r.sentTo, providerId] } : r,
        ),
      }),
    deleteRequest: (requestId: string) => write({ ...state, requests: state.requests.filter((r) => r.id !== requestId) }),

    isMyListing: (id: string) => s.myListings.includes(id),
  }
}

export function recordView(id: string) {
  if (state.recent[0] === id) return
  write({ ...state, recent: [id, ...state.recent.filter((r) => r !== id)].slice(0, MAX_RECENT) })
}

export function recordMyListing(id: string) {
  write({ ...state, myListings: [id, ...state.myListings] })
}
