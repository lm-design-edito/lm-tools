import {
  type FunctionComponent,
  type ImgHTMLAttributes,
  useState,
  useMemo,
  useCallback
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import {
  Disclaimer,
  type Props as DisclaimerProps
} from '../Disclaimer/index.js'
import {
  Theatre,
  type Props as TheatreProps
} from '../Theatre/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { image as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Describes a single responsive image source for use in a `<picture>` element.
 *
 * @property srcSet - One or more image URLs with optional width/density descriptors
 * (e.g. `'img@2x.png 2x'`).
 * @property type - MIME type hint for the source (e.g. `'image/webp'`).
 * @property media - Media condition under which this source is selected
 * (e.g. `'(max-width: 768px)'`).
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
 * @property disclaimer - Props forwarded to the internal {@link Disclaimer} component.
 * While the disclaimer is active the `<img>` is hidden.
 * @property theatre - Props forwarded to the internal {@link Theatre} component.
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  sources?: string | string[] | SourceData[]
  disclaimer?: DisclaimerProps
  theatre?: TheatreProps
}> & ImgHTMLAttributes<HTMLImageElement>

/**
 * Image component. Wraps a native `<img>` (or `<picture>`) element with
 * optional responsive sources, an optional disclaimer gate, and
 * viewport-driven visibility tracking.
 *
 *
 * ### Child elements
 * - `__picture` — wrapping `<picture>` element, always rendered. Contains the
 * `<source>` elements (if any) and the `<img>`.
 * - `__img` — the native `<img>` element.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A `<figure>` element containing a `<picture>` with the image,
 * and an optional disclaimer overlay.
 */
export const Image: FunctionComponent<Props> = ({
  sources,
  disclaimer,
  theatre,
  className,
  ...intrinsicImgAttributes
}) => {
  // State
  const [isDisclaimerOn, setIsDisclaimerOn] = useState(
    disclaimer?.isOn === true
    || disclaimer?.defaultIsOn === true
    || (disclaimer !== undefined && disclaimer.defaultIsOn === undefined)
  )
  let shouldDisclaimerBeOn = isDisclaimerOn
  if (disclaimer?.isOn === true) shouldDisclaimerBeOn = true
  if (disclaimer?.isOn === false) shouldDisclaimerBeOn = false
  const parsedSources = useMemo(() => {
    if (sources === undefined) return []
    if (typeof sources === 'string') return [{ srcSet: sources }]
    if (Array.isArray(sources)) {
      if (sources.length === 0) return []
      if (typeof sources[0] === 'string') return (sources as string[]).map(srcSet => ({ srcSet }))
      return sources as SourceData[]
    }
    return []
  }, [sources])

  // User actions handlers
  const handleDisclaimerDismissClick = useCallback(() => {
    disclaimer?.onDismissClick?.(isDisclaimerOn)
    setIsDisclaimerOn(false)
  }, [])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  const rootAttributes = {}
  const pictureClss = c('picture')
  const imgClss = c('image')

  const sensitiveContent = <picture className={pictureClss}>
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

  const theatricalContent = theatre !== undefined
    ? <Theatre
        defaultIsOn={false}
        {...theatre}>
        {sensitiveContent}
      </Theatre>
    : sensitiveContent

  const disclaimedContent = disclaimer !== undefined
    ? <Disclaimer
        {...disclaimer}
        isOn={shouldDisclaimerBeOn}
        onDismissClick={handleDisclaimerDismissClick}>
        {theatricalContent}
      </Disclaimer>
    : theatricalContent

  return <figure
    className={rootClss}
    {...rootAttributes}>
    {disclaimedContent}
  </figure>
}
