import type {
  RefObject,
  Dispatch,
  SetStateAction
} from 'react'

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

export type LocalScrollData = {
  offsetX: number
  offsetY: number
  width: number
  height: number
}

export type ScrollState = {
  global: GlobalScrollData
  local: LocalScrollData
}

export const globalDocumentScrollListener = (): GlobalScrollData => {
  const win = {
    height: window.innerHeight,
    width: window.innerWidth,
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

export type RegisterEntry = {
  id: string
  rootRef: RefObject<HTMLDivElement | null>
  setData: Dispatch<SetStateAction<ScrollState | undefined>>
}

export const registeredIds: Map<string, RegisterEntry> = new Map()

export const register = (props: RegisterEntry) => {
  const { id, rootRef, setData } = props
  registeredIds.set(id, { id, rootRef, setData })
}

export const unregister = (id: string) => {
  registeredIds.delete(id)
}
