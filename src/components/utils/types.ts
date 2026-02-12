export type WithClassName <T extends Record<string, unknown>> = T & {
  className?: string | Array<string | null | undefined>
}
