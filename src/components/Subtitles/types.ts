/**
 * A single parsed subtitle entry from an SRT file.
 *
 * @property id - Sequential subtitle number.
 * @property start - Start time in milliseconds.
 * @property end - End time in milliseconds.
 * @property content - Subtitle text content.
 */
export type ParsedSub = {
  id: number
  start?: number
  end?: number
  content?: string
}

/**
 * The inclusive ID boundaries of a subtitle group.
 *
 * @property startId - ID of the first subtitle in the group.
 * @property endId - ID of the last subtitle in the group.
 */
export type SubGroupBoundaries = {
  startId: number
  endId: number
}
