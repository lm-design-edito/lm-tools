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
 *
 * **`ListLoader` is the last consumer**, and that is the shape of things: a component
 * that watches itself to *do* something now takes `ViewportBehaviours` instead, which
 * carries its own `visibility…` dial. What is left here is for the one that watches a
 * sentinel to load more — no vocabulary, no instructions, just an observer.
 */
export type ViewportObserverOptions = {
  threshold?: number | number[]
  root?: HTMLElement
  rootMargin?: string
}

