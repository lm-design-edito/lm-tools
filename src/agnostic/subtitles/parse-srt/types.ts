/**
 * One subtitle, complete.
 *
 * Every field is required: a cue missing its timecode or its text is not a cue the
 * parser should be handing out, and a consumer shouldn't have to defend itself
 * against the parser's own intermediate states.
 *
 * @property id - The cue number as written in the file. Kept because a consumer may
 * want to show it, but it carries no meaning for the parser: a concatenated or
 * hand-edited file numbers its cues however it likes. Order and identity come from
 * the position in the returned array.
 * @property start - Start position in milliseconds.
 * @property end - End position in milliseconds.
 * @property content - The cue's text, newlines preserved, surrounding whitespace
 * trimmed.
 */
export type SrtCue = {
  id: number
  start: number
  end: number
  content: string
}
