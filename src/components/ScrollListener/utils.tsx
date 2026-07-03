import type {
  RefObject,
  Dispatch,
  SetStateAction
} from 'react'

/**
 * Scroll-related measurements for the document and viewport.
 *
 * @property win - Window inner dimensions.
 * @property html - Document root element dimensions.
 * @property scroll - Current scroll position.
 * @property viewport - Current viewport bounds in document coordinates.
 */
export type GlobalScrollData = {
  win: {
    height: number
    width: number
  }
  html: {
    width: number
    height: number
  }
  scroll: {
    x: number
    y: number
  }
  viewport: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
}

/**
 * Position and size of a tracked element relative to the document.
 *
 * @property offsetX - Horizontal offset in pixels.
 * @property offsetY - Vertical offset in pixels.
 * @property width - Element width in pixels.
 * @property height - Element height in pixels.
 */
export type LocalScrollData = {
  offsetX: number
  offsetY: number
  width: number
  height: number
}

/**
 * Combined scroll state passed to each registered {@link ScrollListener}.
 *
 * @property global - Document-level scroll data.
 * @property local - Element-level position data.
 */
export type ScrollState = {
  global: GlobalScrollData
  local: LocalScrollData
}

export const globalDocumentScrollListener = (): GlobalScrollData => {
  const win = {
    height: window.innerHeight,
    width: window.innerWidth
  }
  const html = {
    width: document.body.parentElement?.offsetWidth ?? 0,
    height: document.body.parentElement?.offsetHeight ?? 0
  }
  const scroll = {
    x: window.scrollX,
    y: window.scrollY
  }
  const viewport = {
    minX: scroll.x,
    minY: scroll.y,
    maxX: scroll.x + win.width,
    maxY: scroll.y + win.height
  }
  return { win, html, scroll, viewport }
}

export const localElementScrollListener = (div: HTMLDivElement): LocalScrollData => {
  const offsetX = div.offsetLeft
  const offsetY = div.offsetTop
  const width = div.offsetWidth
  const height = div.offsetHeight
  return {
    offsetX,
    offsetY,
    width,
    height
  }
}

window.addEventListener('scroll', () => {
  const global = globalDocumentScrollListener()
  Array.from(registeredIds).forEach(([, item]) => {
    const { rootRef, setData } = item
    if (rootRef.current === null) return
    const local = localElementScrollListener(rootRef.current)
    setData({ global, local })
  })
})

/**
 * An entry registered with the global scroll listener.
 *
 * @property id - Unique identifier for this registration.
 * @property rootRef - Ref to the tracked DOM element.
 * @property setData - State setter to update the component's scroll state.
 */
export type RegisterEntry = {
  id: string
  rootRef: RefObject<HTMLDivElement | null>
  setData: Dispatch<SetStateAction<ScrollState | undefined>>
}

export const registeredIds = new Map<string, RegisterEntry>()

export const register = (props: RegisterEntry): void => {
  const { id, rootRef, setData } = props
  registeredIds.set(id, { id, rootRef, setData })
}

export const unregister = (id: string): void => {
  registeredIds.delete(id)
}
