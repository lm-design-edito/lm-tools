/**
 * Whether the subtree a component sits in has been disclosed to the reader.
 *
 * An object rather than a bare boolean, so a later field — which disclaimer, and why —
 * can join it without touching every consumer.
 */
export type DisclosureState = {
  isDisclosed: boolean
}
