/** The visibility triggers, and the settings the state they react to is measured with. */
export type VisibilityProps = {
  whenVisible?: string | string[]
  whenHidden?: string | string[]
  onVisibilityChanged?: (isVisible: boolean) => void
  visibilityThreshold?: number | number[]
  visibilityRoot?: HTMLElement
  visibilityRootMargin?: string
  visibilityOnAfterMs?: number
  visibilityOffAfterMs?: number
}

/** Extends a type with {@link VisibilityProps}. */
export type WithVisibility <T> = T & VisibilityProps
