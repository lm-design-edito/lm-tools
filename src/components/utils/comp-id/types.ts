/** Extends a type with the optional `compId` every component takes. */
export type WithCompId <T> = T & {
  compId?: string
}
