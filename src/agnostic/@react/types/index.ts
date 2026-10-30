import type { ReactNode } from 'react'

/** The optional `className` every component takes, a string or a list of them. */
export type ClassNameProps = {
  className?: string | Array<string | null | undefined>
}

/** The `children` a component that renders them takes. */
export type ChildrenProps = {
  children?: ReactNode
}

/**
 * Extends a type with {@link ClassNameProps}.
 *
 * @template T - The base type to extend.
 */
export type WithClassName <T extends Record<string, unknown>> = T & ClassNameProps
