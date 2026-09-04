import type { RefObject } from 'react'

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
 * Combined scroll state handed to each subscribed {@link ScrollListener}.
 *
 * @property global - Document-level scroll data, measured once per frame and
 * shared by every subscriber.
 * @property local - Position and size of this subscriber's own element.
 */
export type ScrollState = {
  global: GlobalScrollData
  local: LocalScrollData
}

/**
 * A component subscribed to the shared scroll listener.
 *
 * @property rootRef - Ref to the tracked element. A subscriber whose ref is not
 * attached yet is skipped for that frame.
 * @property onScrollStateChange - Receives the freshly measured state.
 */
export type Subscriber = {
  rootRef: RefObject<HTMLDivElement | null>
  onScrollStateChange: (scrollState: ScrollState) => void
}

/* * * * * * * * * * * * * * * * *
 *
 * Measuring
 *
 * * * * * * * * * * * * * * * * */

function measureGlobal (): GlobalScrollData {
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

function measureLocal (element: HTMLElement): LocalScrollData {
  return {
    offsetX: element.offsetLeft,
    offsetY: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight
  }
}

/* * * * * * * * * * * * * * * * *
 *
 * The shared listener
 *
 * * * * * * * * * * * * * * * * */

/**
 * Every mounted {@link ScrollListener} shares one pair of `scroll` / `resize`
 * listeners and one measurement pass per animation frame, however many
 * components are on the page: the document is measured once, and only each
 * subscriber's own element is measured individually.
 *
 * The listeners are attached on the first subscription and detached on the
 * last, so importing this module has no effect on its own — which is what keeps
 * it importable outside a browser.
 */
const subscribers = new Map<string, Subscriber>()

let scheduledFrame: number | null = null

function notifySubscribers (): void {
  scheduledFrame = null
  const global = measureGlobal()
  subscribers.forEach(({ rootRef, onScrollStateChange }) => {
    const element = rootRef.current
    if (element === null) return
    onScrollStateChange({ global, local: measureLocal(element) })
  })
}

/** Coalesces every event of a frame into a single measurement pass. */
function scheduleNotification (): void {
  if (scheduledFrame !== null) return
  scheduledFrame = window.requestAnimationFrame(notifySubscribers)
}

/**
 * Starts tracking one element, attaching the shared listeners if this is the
 * first subscriber. A measurement is scheduled right away, so a subscriber gets
 * its initial state without waiting for a first scroll.
 *
 * @param id - Identifies the subscriber for {@link unsubscribe}.
 * @param subscriber - The element to track and where to report.
 */
export function subscribe (id: string, subscriber: Subscriber): void {
  const isFirstSubscriber = subscribers.size === 0
  subscribers.set(id, subscriber)
  if (isFirstSubscriber) {
    window.addEventListener('scroll', scheduleNotification, { passive: true })
    window.addEventListener('resize', scheduleNotification, { passive: true })
  }
  scheduleNotification()
}

/**
 * Stops tracking one element, detaching the shared listeners once no subscriber
 * is left. Unsubscribing an unknown id is a no-op.
 *
 * @param id - The id passed to {@link subscribe}.
 */
export function unsubscribe (id: string): void {
  subscribers.delete(id)
  if (subscribers.size > 0) return
  window.removeEventListener('scroll', scheduleNotification)
  window.removeEventListener('resize', scheduleNotification)
  if (scheduledFrame === null) return
  window.cancelAnimationFrame(scheduledFrame)
  scheduledFrame = null
}

/* * * * * * * * * * * * * * * * *
 *
 * CSS custom properties
 *
 * * * * * * * * * * * * * * * * */

/** Spans the scroll positions where the element is fully inside the viewport. */
function innerRange (offset: number, size: number, winSize: number): [number, number] {
  return [offset + size - winSize, offset]
}

/** Spans the scroll positions where the element overlaps the viewport at all. */
function outerRange (offset: number, size: number, winSize: number): [number, number] {
  return [offset - winSize, offset + size]
}

/** Where `scroll` sits in `range`, as a `0`–`1` ratio. */
function progressIn (scroll: number, [from, to]: [number, number]): number {
  return (scroll - from) / Math.max(to - from, 1)
}

/**
 * The element's outer scroll progress on each axis — `0` when it is about to
 * enter the viewport, `1` once it has fully left it.
 */
export function getScrollProgress (scrollState: ScrollState): { x: number, y: number } {
  const { global: { win, scroll }, local } = scrollState
  return {
    x: progressIn(scroll.x, outerRange(local.offsetX, local.width, win.width)),
    y: progressIn(scroll.y, outerRange(local.offsetY, local.height, win.height))
  }
}

/**
 * Builds the CSS custom properties exposed on a {@link ScrollListener} root.
 *
 * Measurements are lengths and come with a `-raw` twin carrying the plain number
 * for `calc()`; ratios are unitless and have no twin.
 *
 * @param scrollState - The state to expose.
 * @returns The custom properties, keyed by their full name.
 */
export function toScrollCssProps (scrollState: ScrollState): Record<string, string> {
  const { global: { win, html, scroll }, local } = scrollState
  const windowScrolledXRatio = scroll.x / Math.max(html.width - win.width, 1)
  const windowScrolledYRatio = scroll.y / Math.max(html.height - win.height, 1)
  const selfInnerScrolledXRatio = progressIn(scroll.x, innerRange(local.offsetX, local.width, win.width))
  const selfOuterScrolledXRatio = progressIn(scroll.x, outerRange(local.offsetX, local.width, win.width))
  const selfInnerScrolledYRatio = progressIn(scroll.y, innerRange(local.offsetY, local.height, win.height))
  const selfOuterScrolledYRatio = progressIn(scroll.y, outerRange(local.offsetY, local.height, win.height))
  return {
    '--lm-scroll-listener-window-width': `${win.width}px`,
    '--lm-scroll-listener-window-width-raw': `${win.width}`,
    '--lm-scroll-listener-window-height': `${win.height}px`,
    '--lm-scroll-listener-window-height-raw': `${win.height}`,
    '--lm-scroll-listener-html-width': `${html.width}px`,
    '--lm-scroll-listener-html-width-raw': `${html.width}`,
    '--lm-scroll-listener-html-height': `${html.height}px`,
    '--lm-scroll-listener-html-height-raw': `${html.height}`,
    '--lm-scroll-listener-scroll-x': `${scroll.x}px`,
    '--lm-scroll-listener-scroll-x-raw': `${scroll.x}`,
    '--lm-scroll-listener-scroll-y': `${scroll.y}px`,
    '--lm-scroll-listener-scroll-y-raw': `${scroll.y}`,
    '--lm-scroll-listener-width': `${local.width}px`,
    '--lm-scroll-listener-width-raw': `${local.width}`,
    '--lm-scroll-listener-height': `${local.height}px`,
    '--lm-scroll-listener-height-raw': `${local.height}`,
    '--lm-scroll-listener-offset-x': `${local.offsetX}px`,
    '--lm-scroll-listener-offset-x-raw': `${local.offsetX}`,
    '--lm-scroll-listener-offset-y': `${local.offsetY}px`,
    '--lm-scroll-listener-offset-y-raw': `${local.offsetY}`,
    '--lm-scroll-listener-window-scrolled-x-ratio': `${windowScrolledXRatio}`,
    '--lm-scroll-listener-window-scrolled-y-ratio': `${windowScrolledYRatio}`,
    '--lm-scroll-listener-self-inner-scrolled-x-ratio': `${selfInnerScrolledXRatio}`,
    '--lm-scroll-listener-self-outer-scrolled-x-ratio': `${selfOuterScrolledXRatio}`,
    '--lm-scroll-listener-self-inner-scrolled-y-ratio': `${selfInnerScrolledYRatio}`,
    '--lm-scroll-listener-self-outer-scrolled-y-ratio': `${selfOuterScrolledYRatio}`
  }
}
