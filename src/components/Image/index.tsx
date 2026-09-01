import {
  type FunctionComponent,
  type ImgHTMLAttributes,
  useState,
  useMemo
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
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
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
 * @property disclaimer - Presentation of the internal {@link Disclaimer}: its
 * panel content and toggler. Providing it is what gates the image behind a
 * disclaimer at all. Its state props are deliberately absent — the state lives
 * here, on `isDisclaimerOn` and its siblings.
 * @property isDisclaimerOn - Controlled disclaimer state. When defined, the
 * disclaimer is fully driven by the parent and internal state is never updated.
 * @property defaultIsDisclaimerOn - Initial disclaimer state in uncontrolled
 * mode. Ignored when `isDisclaimerOn` is provided. Defaults to `true`, so a
 * disclaimer shows up as soon as one is declared.
 * @property onDisclaimerDismissClicked - Called when the disclaimer's toggler is
 * clicked, before the image reacts, with the disclaimer state as it was.
 * @property onIsDisclaimerOnChanged - Called after the disclaimer state changed,
 * with the new value.
 * @property theatre - Props forwarded to the internal {@link Theatre} component.
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  sources?: string | string[] | SourceData[]
  disclaimer?: Omit<
    DisclaimerProps,
    'isOn' | 'defaultIsOn' | 'onDismissClicked' | 'onIsOnChanged' | 'children'
  >
  isDisclaimerOn?: boolean
  defaultIsDisclaimerOn?: boolean
  onDisclaimerDismissClicked?: (isDisclaimerOn: boolean) => void
  onIsDisclaimerOnChanged?: (isDisclaimerOn: boolean) => void
  theatre?: TheatreProps
}> & ImgHTMLAttributes<HTMLImageElement>

/**
 * Image component. Wraps a native `<img>` (or `<picture>`) element with
 * optional responsive sources, an optional disclaimer gate, and
 * viewport-driven visibility tracking.
 *
 *
 * ### CSS elements
 * - `picture` — wrapping `<picture>` element, always rendered. Contains the
 * `<source>` elements (if any) and the `<img>`.
 * - `image` — the native `<img>` element.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A `<figure>` element containing a `<picture>` with the image,
 * and an optional disclaimer overlay.
 *
 * @remarks
 * The disclaimer state is owned here, and the internal {@link Disclaimer} is
 * always driven as a controlled component. Consumers never reach into it to
 * read or set that state: `isDisclaimerOn`, `defaultIsDisclaimerOn`,
 * `onDisclaimerDismissClicked` and `onIsDisclaimerOnChanged` are the whole API.
 */
export const Image: FunctionComponent<Props> = ({
  sources,
  disclaimer,
  isDisclaimerOn: isDisclaimerOnProp,
  defaultIsDisclaimerOn = true,
  onDisclaimerDismissClicked,
  onIsDisclaimerOnChanged,
  theatre,
  className,
  ...intrinsicImgAttributes
}) => {
  // State
  const [internalIsDisclaimerOn, setInternalIsDisclaimerOn] = useState(defaultIsDisclaimerOn)
  const isDisclaimerControlled = isDisclaimerOnProp !== undefined
  const isDisclaimerOn = isDisclaimerOnProp ?? internalIsDisclaimerOn
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

  // State dispatch
  useChangeDispatch(isDisclaimerOn, onIsDisclaimerOnChanged)

  // User actions handlers
  const handleDisclaimerDismissClick = (): void => {
    onDisclaimerDismissClicked?.(isDisclaimerOn)
    if (isDisclaimerControlled) return
    setInternalIsDisclaimerOn(false)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
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
        isOn={isDisclaimerOn}
        onDismissClicked={handleDisclaimerDismissClick}>
        {theatricalContent}
      </Disclaimer>
    : theatricalContent

  return <figure className={rootClss}>
    {disclaimedContent}
  </figure>
}
