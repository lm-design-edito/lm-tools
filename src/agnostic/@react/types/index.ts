/**
 * Extends a type with an optional `className` prop accepting a string or an array of string-or-nullish values.
 *
 * @template T - The base type to extend.
 */
export type WithClassName <T extends Record<string, unknown>> = T & {
  className?: string | Array<string | null | undefined>
}
