/**
 * Extends a type with an optional `className` prop accepting a string or an array of string-or-nullish values.
 *
 * @template T - The base type to extend.
 */
export type WithClassName <T extends Record<string, unknown>> = T & {
  className?: string | Array<string | null | undefined>
}

/**
 * Extends a type with the settings of the {@link IntersectionObserver} a component
 * mounts at its root, and with what it sees.
 *
 * A component that offers viewport-driven behaviour has to offer its dial too:
 * `autoPlayWhenVisible` means little if "visible" can't be told to mean *thirty
 * percent* visible. The three settings go straight to the observer, and
 * `onVisibilityChanged` reports every crossing whether or not any behaviour is
 * bound to it.
 *
 * The three settings mirror `ObserverOptions` of the `IntersectionObserver`
 * component, which is where they end up. They are restated here rather than
 * imported from it: that component reads `WithClassName` from this very file, and
 * the two shouldn't import each other.
 *
 * `Scrllgngn` deliberately stays out of this: its observers take a `rootMargin`
 * derived from its `viewportOffset*` props, which are its own version of the dial.
 *
 * @template T - The base type to extend.
 */
export type WithViewportObservation <T extends Record<string, unknown>> = T & {
  threshold?: number | number[]
  root?: HTMLElement
  rootMargin?: string
  onVisibilityChanged?: (isVisible: boolean) => void
}
