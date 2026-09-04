import {
  type FunctionComponent,
  type ImgHTMLAttributes,
  useMemo
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { image as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Describes a single responsive image source for use in a `<picture>` element.
 *
 * @property srcSet - One or more image URLs with optional width/density descriptors (e.g. `'img@2x.png 2x'`).
 * @property type - MIME type hint for the source (e.g. `'image/webp'`).
 * @property media - Media condition under which this source is selected (e.g. `'(max-width: 768px)'`).
 * @property sizes - Sizes attribute forwarded to the `<source>` element.
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
 */
export type Props = WithClassName<{
  sources?: string | string[] | SourceData[]
}> & ImgHTMLAttributes<HTMLImageElement>

/**
 * Image component. Wraps a native `<img>` (or `<picture>`) element with
 * optional responsive sources.
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
  sources,
  className,
  ...intrinsicImgAttributes
}) => {
  // State
  const parsedSources = useMemo(() => {
    if (sources === undefined) return []
    if (typeof sources === 'string') return [{ srcSet: sources }]
    if (Array.isArray(sources)) {
      if (sources.length === 0) return []
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element sampled just above; array is expected to be homogeneous
      if (typeof sources[0] === 'string') return (sources as string[]).map(srcSet => ({ srcSet }))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element was checked not to be a string just above; array is expected to be homogeneous
      return sources as SourceData[]
    }
    return []
  }, [sources])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  const pictureClss = c('picture')
  const imgClss = c('image')

  const pictureContent = <picture className={pictureClss}>
    {parsedSources.map((source, index) => <source
      key={index}
      srcSet={typeof source === 'string' ? source : source.srcSet}
      type={typeof source === 'string' ? undefined : source.type}
      media={typeof source === 'string' ? undefined : source.media}
      sizes={typeof source === 'string' ? undefined : source.sizes} />
    )}
    <img
      className={imgClss}
      {...intrinsicImgAttributes} />
  </picture>

  return <figure className={rootClss}>
    {pictureContent}
  </figure>
}
