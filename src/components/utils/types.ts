/**
 * Extends a type with an optional `className` prop accepting a string or an array of string-or-nullish values.
 *
 * @template T - The base type to extend.
 */
export type WithClassName <T extends Record<string, unknown>> = T & {
  className?: string | Array<string | null | undefined>
}

/**
 * The settings of an {@link IntersectionObserver} a component mounts internally.
 *
 * A component that offers viewport-driven behaviour has to offer its dial too:
 * `autoPlayWhenVisible` means little if "visible" can't be told to mean *thirty
 * percent* visible, and an infinite list wants to start loading before its sentinel
 * shows, which is `rootMargin`'s job.
 *
 * They mirror `ObserverOptions` of the `IntersectionObserver` component, where they
 * end up. Restated here rather than imported from it: that component reads
 * {@link WithClassName} from this very file, and the two shouldn't import each other.
 */
export type ViewportObserverOptions = {
  threshold?: number | number[]
  root?: HTMLElement
  rootMargin?: string
}

/**
 * Extends a type with an internal observer's settings and with what it sees.
 *
 * For a component observing **one** element — itself, usually. A component with
 * several observers takes {@link ViewportObserverOptions} alone, since a single
 * visibility handler couldn't say which of them crossed.
 *
 * `Scrllgngn` deliberately stays out of both: its observers take a `rootMargin`
 * derived from its `viewportOffset*` props, which are its own version of the dial.
 *
 * @template T - The base type to extend.
 */
export type WithViewportObservation <T extends Record<string, unknown>> = T
  & ViewportObserverOptions
  & { onVisibilityChanged?: (isVisible: boolean) => void }
