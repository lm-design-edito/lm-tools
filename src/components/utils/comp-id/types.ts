/** The optional `compId` every component takes. */
export type CompIdProps = {
  compId?: string
}

/** Extends a type with {@link CompIdProps}. */
export type WithCompId <T> = T & CompIdProps
