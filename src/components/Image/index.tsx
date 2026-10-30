import {
  type FunctionComponent,
  type ImgHTMLAttributes,
  useMemo,
  useRef
} from 'react'
import type { WithClassName } from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import { parseSrcSetSourcesList } from '../Video/utils.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { WithCompId } from '../utils/comp-id/types.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { WithVisibility } from '../utils/visibility/types.js'
import { image as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Describes a single responsive image source for use in a `<picture>` element.
 *
 * @property srcSet - One or more image URLs with optional width/density descriptors (e.g. `'img@2x.png 2x'`).
 * @property type - MIME type hint for the source (e.g. `'image/webp'`).
 * @property media - Media condition under which this source is selected (e.g. `'(max-width: 768px)'`).
 * @property sizes - Sizes attribute forwarded to the `<source>` element.
 *
 * **A picture source is not a video source.** `Video` keeps a shape of its own: a
 * `<source>` inside a `<video>` carries `src` and nothing else useful, where this one
 * carries `srcSet`, `media` and `sizes`, and neither element accepts the other's
 * attributes. What the two do share is how a list of them is read — see
 * `parseSrcSetSourcesList` in `Video/utils`, whose `stringKey` is exactly that difference.
 */
type SourceData = {
  srcSet?: string
  type?: string
  media?: string
  sizes?: string
}

/**
 * Props for the {@link Image} component.
 *
 * Extends all native `ImgHTMLAttributes<HTMLImageElement>`, so any standard
 * img attribute (`alt`, `loading`, `sizes`, `srcSet`, etc.) can be passed
 * and will be forwarded to the underlying `<img>` element.
 *
 * @property sources - One or more responsive sources rendered as `<source>`
 * elements inside a wrapping `<picture>`. Accepts:
 * - a single srcSet string,
 * - an array of srcSet strings,
 * - an array of {@link SourceData} objects for full `<source>` control.
 * @property className - Optional additional class name(s) applied to the root element.
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`,
 * `onVisibilityChanged` and the five `visibility*` settings.
 */
export type Props = WithVisibility<WithCompId<WithClassName<{
  sources?: string | string[] | SourceData[]
}> & ImgHTMLAttributes<HTMLImageElement>>>

/**
 * Image component. Wraps a native `<img>` (or `<picture>`) element with
 * optional responsive sources.
 *
 * ### Root element modifiers
 * - `--visible` — the component has settled into view. Absent until something asks
 *   about visibility, since nothing is observed before that.
 *
 * ### CSS elements
 * - `picture` — wrapping `<picture>` element, always rendered. Contains the
 * `<source>` elements (if any) and the `<img>`.
 * - `image` — the native `<img>` element.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A `<figure>` element containing a `<picture>` with the image.
 */
export const Image: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  sources,
  className,
  ...intrinsicImgAttributes
}) => {
  const compId = useCompId(givenCompId)
  const rootRef = useRef<HTMLElement>(null)
  const isVisible = useVisibilityTriggers(compId, rootRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })

  // State
  const parsedSources = useMemo(
    () => parseSrcSetSourcesList<SourceData>(sources, 'srcSet'),
    [sources]
  )

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, { visible: isVisible === true }), className)
  const pictureClss = c('picture')
  const imgClss = c('image')

  const pictureContent = <picture className={pictureClss}>
    {parsedSources.map((source, index) => <source
      key={index}
      srcSet={source.srcSet}
      type={source.type}
      media={source.media}
      sizes={source.sizes} />
    )}
    <img
      className={imgClss}
      {...intrinsicImgAttributes} />
  </picture>

  return <figure
    {...compIdAttribute(compId)}
    ref={rootRef}
    className={rootClss}>
    {pictureContent}
  </figure>
}
