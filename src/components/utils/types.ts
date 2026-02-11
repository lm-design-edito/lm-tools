export type WithClassName <T extends Record<string, unknown>> = T & {
  className?: string
}
