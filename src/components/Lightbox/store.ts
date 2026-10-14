/**
 * The registry of lightbox groups, shared by every {@link Lightbox} on the page.
 *
 * Deliberately outside React: nothing guarantees that two lightboxes of a page share
 * a tree — a caller is free to mount each component in its own root — so a context
 * could not reach from one to the other, where a module-level store can.
 *
 * Members are kept unordered here; the order that matters is the **document's**, and
 * it is read from the DOM when a group opens. React's mount order is not it.
 */

import type {
  LightboxMember,
  LightboxState
} from './types.js'

const listeners = new Set<() => void>()

let state: LightboxState = {
  openGroup: null,
  openMemberId: null,
  members: new Map()
}

// The one writer. Its equality check is what keeps a write that changes nothing — closing
// an already closed group, a `step` clamped at an end — from waking every member.
function setLightboxesStoreState (nextState: LightboxState): void {
  if (nextState.openGroup === state.openGroup
    && nextState.openMemberId === state.openMemberId
    && nextState.members === state.members) return
  state = nextState
  for (const listener of listeners) listener()
}

export function subscribe (listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getLightboxesStoreState (): LightboxState {
  return state
}

export function register (member: LightboxMember): void {
  setLightboxesStoreState({
    ...state,
    members: new Map(state.members).set(member.id, member)
  })
}

export function unregister (id: string): void {
  if (!state.members.has(id)) return
  const members = new Map(state.members)
  members.delete(id)
  // A member leaving while it is the one shown would strand the group on nothing.
  const leavesNothingOpen = state.openMemberId === id
  setLightboxesStoreState({
    openGroup: leavesNothingOpen ? null : state.openGroup,
    openMemberId: leavesNothingOpen ? null : state.openMemberId,
    members
  })
}

/**
 * The members of a group, in **document order**.
 *
 * `compareDocumentPosition` rather than mount order: React mounts a tree in its own
 * order, and a caller may mount each component in a root of its own, so nothing
 * guarantees the two match. Only runs when a group opens or navigates, over a
 * handful of members.
 */
export function membersOf (group: string): LightboxMember[] {
  const found = [...state.members.values()].filter(member => member.groups.includes(group))
  return found.sort((a, b) => {
    const aElt = a.getElement()
    const bElt = b.getElement()
    if (aElt === null || bElt === null) return 0
    const position = aElt.compareDocumentPosition(bElt)
    return (position & Node.DOCUMENT_POSITION_PRECEDING) !== 0 ? 1 : -1
  })
}

export function open (group: string, memberId: string): void {
  setLightboxesStoreState({ ...state, openGroup: group, openMemberId: memberId })
}

export function close (): void {
  setLightboxesStoreState({ ...state, openGroup: null, openMemberId: null })
}

/** Moves to another member of the open group by `offset`, clamped at both ends. */
export function step (offset: number): void {
  const { openGroup, openMemberId } = state
  if (openGroup === null || openMemberId === null) return
  const ordered = membersOf(openGroup)
  const current = ordered.findIndex(member => member.id === openMemberId)
  if (current === -1) return
  const index = Math.min(ordered.length - 1, Math.max(0, current + offset))
  // `index` is clamped into the list `current` was just found in.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const target = ordered[index]!
  setLightboxesStoreState({ ...state, openMemberId: target.id })
}
