/**
 * The registry of theatre groups, shared by every {@link Theatre} on the page.
 *
 * Deliberately outside React. lm-link renders each component in its **own React
 * root** — `renderInTarget` calls `createRoot` per component — so two `<lm-image>`
 * in the same article never share a tree, and a context could not reach from one to
 * the other. A module-level store can.
 *
 * Members are kept unordered here; the order that matters is the **document's**, and
 * it is read from the DOM when a group opens. React's mount order is not it.
 */

/** What a member hands the store so the group can find and place it. */
export type TheatreMember = {
  id: string
  groups: string[]
  /** The member's anchor in the page, for ordering. `null` before it mounts. */
  getElement: () => HTMLElement | null
}

export type TheatreState = {
  /** The group currently on stage, `null` when nothing is open. */
  openGroup: string | null
  /** The member currently on stage. */
  openMemberId: string | null
}

const members = new Map<string, TheatreMember>()
const listeners = new Set<() => void>()

let state: TheatreState = {
  openGroup: null,
  openMemberId: null
}

function emit (): void {
  for (const listener of listeners) listener()
}

function setState (next: TheatreState): void {
  if (next.openGroup === state.openGroup
    && next.openMemberId === state.openMemberId) return
  state = next
  emit()
}

export function subscribe (listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getState (): TheatreState {
  return state
}

/** A member's own group, when it declared none: it is a group of one. */
export function soloGroupOf (id: string): string {
  return `solo:${id}`
}

export function register (member: TheatreMember): void {
  members.set(member.id, member)
  emit()
}

export function unregister (id: string): void {
  members.delete(id)
  // A member leaving while it is on stage would strand the group on nothing.
  if (state.openMemberId === id) setState({ openGroup: null, openMemberId: null })
  else emit()
}

/**
 * The members of a group, in **document order**.
 *
 * `compareDocumentPosition` rather than mount order: React mounts a tree in its own
 * order, and lm-link mounts each component in a root of its own, so nothing
 * guarantees the two match. Only runs when a group opens or navigates, over a
 * handful of members.
 */
export function membersOf (group: string): TheatreMember[] {
  const found = [...members.values()].filter(member => member.groups.includes(group))
  return found.sort((a, b) => {
    const aElt = a.getElement()
    const bElt = b.getElement()
    if (aElt === null || bElt === null) return 0
    const position = aElt.compareDocumentPosition(bElt)
    if ((position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0) return -1
    if ((position & Node.DOCUMENT_POSITION_PRECEDING) !== 0) return 1
    return 0
  })
}

/**
 * The member that renders the stage for a group — its first in document order.
 *
 * One stage per group, and it has to be rendered by *someone*: the roots are
 * separate, so there is no common parent to put it in. The first member is a stable
 * choice, unaffected by which member is on stage, so navigating doesn't tear the
 * stage down and build it again.
 */
export function hostOf (group: string): string | null {
  return membersOf(group)[0]?.id ?? null
}

export function open (group: string, memberId: string): void {
  setState({ openGroup: group, openMemberId: memberId })
}

export function close (): void {
  setState({ openGroup: null, openMemberId: null })
}

/** Moves the stage by `offset` within the open group, clamped at both ends. */
export function step (offset: number): void {
  const { openGroup, openMemberId } = state
  if (openGroup === null || openMemberId === null) return
  const ordered = membersOf(openGroup)
  const current = ordered.findIndex(member => member.id === openMemberId)
  if (current === -1) return
  const target = ordered[Math.min(ordered.length - 1, Math.max(0, current + offset))]
  if (target === undefined) return
  setState({ openGroup, openMemberId: target.id })
}
