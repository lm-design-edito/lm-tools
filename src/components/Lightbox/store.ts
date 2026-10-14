import type {
  LightboxesStoreState,
  RegisteredLightbox
} from './types.js'

const storeStateChangeCallbacks = new Set<() => void>()

let storeState: LightboxesStoreState = {
  openGroup: null,
  openLightboxId: null,
  lightboxesById: new Map()
}

export const getLightboxesStoreState = (): LightboxesStoreState => storeState

function setLightboxesStoreState (nextState: LightboxesStoreState): void {
  if (nextState.openGroup === storeState.openGroup
    && nextState.openLightboxId === storeState.openLightboxId
    && nextState.lightboxesById === storeState.lightboxesById) return
  storeState = nextState
  for (const onStoreStateChange of storeStateChangeCallbacks) onStoreStateChange()
}

export function watchLightboxesStoreState (onStoreStateChange: () => void): () => void {
  storeStateChangeCallbacks.add(onStoreStateChange)
  const unwatchLightboxesStoreState = (): void => {
    storeStateChangeCallbacks.delete(onStoreStateChange)
  }
  return unwatchLightboxesStoreState
}

export function registerLightbox (lightbox: RegisteredLightbox): void {
  setLightboxesStoreState({
    ...storeState,
    lightboxesById: new Map(storeState.lightboxesById).set(lightbox.id, lightbox)
  })
}

export function unregisterLightbox (lightboxId: string): void {
  if (!storeState.lightboxesById.has(lightboxId)) return
  const lightboxesById = new Map(storeState.lightboxesById)
  lightboxesById.delete(lightboxId)
  // A lightbox leaving while it is the one shown would strand the group on nothing.
  const leavesNothingOpen = storeState.openLightboxId === lightboxId
  setLightboxesStoreState({
    openGroup: leavesNothingOpen ? null : storeState.openGroup,
    openLightboxId: leavesNothingOpen ? null : storeState.openLightboxId,
    lightboxesById
  })
}

export function getGroupLightboxes (group: string): RegisteredLightbox[] {
  const found = [...storeState.lightboxesById.values()]
    .filter(lightbox => lightbox.groups.includes(group))
  return found.sort((a, b) => {
    const aElt = a.getElement()
    const bElt = b.getElement()
    if (aElt === null || bElt === null) return 0
    const position = aElt.compareDocumentPosition(bElt)
    return (position & Node.DOCUMENT_POSITION_PRECEDING) !== 0 ? 1 : -1
  })
}

export function openLightbox (group: string, lightboxId: string): void {
  setLightboxesStoreState({ ...storeState, openGroup: group, openLightboxId: lightboxId })
}

export function closeLightbox (): void {
  setLightboxesStoreState({ ...storeState, openGroup: null, openLightboxId: null })
}

export function navigateOpenGroupBy (offset: number): void {
  const { openGroup, openLightboxId } = storeState
  if (openGroup === null || openLightboxId === null) return
  const ordered = getGroupLightboxes(openGroup)
  const current = ordered.findIndex(lightbox => lightbox.id === openLightboxId)
  if (current === -1) return
  const index = Math.min(ordered.length - 1, Math.max(0, current + offset))
  // `index` is clamped into the list `current` was just found in.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const target = ordered[index]!
  setLightboxesStoreState({ ...storeState, openLightboxId: target.id })
}
