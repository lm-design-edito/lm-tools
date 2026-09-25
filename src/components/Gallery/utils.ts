/** A tolerance in px, so a sub-pixel scroll position does not read as « can still go ». */
const EDGE_TOLERANCE = 1

/** The layout, measured once, so that reading the active slot touches no element. */
export type Geometry = {
  /** Scroll positions that bring each slot to the middle, clamped to the track. */
  scrollPositions: number[]
  /** Midpoints between consecutive slot centres, in content coordinates. */
  boundaries: number[]
  /** Half the viewport, kept here rather than read again on every scroll. */
  halfViewport: number
  /** The far end of the track. */
  maxScroll: number
}

export const EMPTY_GEOMETRY: Geometry = {
  scrollPositions: [],
  boundaries: [],
  halfViewport: 0,
  maxScroll: 0
}

/**
 * Everything the gallery needs to know about its own layout.
 *
 * Positions are taken against the scroller's own box rather than the DOM's `offsetLeft`,
 * which is relative to whichever ancestor happens to be positioned — so a gallery nested
 * anywhere measures the same.
 *
 * **Boundaries come from slot centres, and scroll positions are clamped.** Keeping them
 * apart is what avoids ties: two slots at the same end of the track share a scroll
 * position, but never a centre, so every slot owns a range of its own.
 */
export function measureGeometry (scroller: HTMLElement): Geometry {
  const { clientWidth, scrollWidth, scrollLeft } = scroller
  const halfViewport = clientWidth / 2
  const maxScroll = Math.max(0, scrollWidth - clientWidth)
  const scrollerLeft = scroller.getBoundingClientRect().left
  const centers = Array.from(scroller.children).map(child => {
    const rect = child.getBoundingClientRect()
    return rect.left - scrollerLeft + scrollLeft + rect.width / 2
  })
  return {
    scrollPositions: centers.map(center => Math.min(Math.max(center - halfViewport, 0), maxScroll)),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- i is in range by construction, centers[i] sits before the one being mapped
    boundaries: centers.slice(1).map((center, i) => (centers[i]! + center) / 2),
    halfViewport,
    maxScroll
  }
}

/**
 * Which slot the middle of the viewport is nearest — numbers only, whatever the count.
 *
 * Same answer as walking the slots and keeping the closest centre, which is what the
 * table was built from.
 */
export function readActiveIndex (geometry: Geometry, scrollLeft: number): number {
  const { boundaries, halfViewport } = geometry
  const viewportCenter = scrollLeft + halfViewport
  let index = 0
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- index is bounded by the loop condition
  while (index < boundaries.length && viewportCenter > boundaries[index]!) index += 1
  return index
}

/** Whether there is track left on each side, within {@link EDGE_TOLERANCE}. */
export function readReach (geometry: Geometry, scrollLeft: number): {
  canGoLeft: boolean
  canGoRight: boolean
} {
  return {
    canGoLeft: scrollLeft > EDGE_TOLERANCE,
    canGoRight: scrollLeft < geometry.maxScroll - EDGE_TOLERANCE
  }
}
