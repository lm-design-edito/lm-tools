/**
 * One `<source>` of a `<video>`.
 *
 * **Not interchangeable with a picture source**: a `<source>` inside a `<video>` carries
 * `src`, one inside a `<picture>` carries `srcSet`, `media` and `sizes`, and neither
 * element accepts the other's attributes.
 *
 * @property src - URL of the video file.
 * @property type - MIME type, so the browser can skip what it cannot play
 * (`'video/mp4'`).
 */
export type SourceData = {
  src?: string
  type?: string
}

/**
 * One `<track>` of a `<video>` — subtitles, captions, chapters.
 *
 * @property src - URL of the WebVTT file.
 * @property kind - What the track holds. Browsers default to `'subtitles'`.
 * @property srclang - Its BCP 47 language tag, required by the element whenever `kind`
 * is `'subtitles'`.
 * @property label - The name a browser shows in its own track menu.
 * @property default - Whether it is the one enabled when no preference says otherwise.
 * At most one track per element may carry it.
 */
export type TrackData = {
  src?: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srclang?: string
  label?: string
  default?: boolean
}
