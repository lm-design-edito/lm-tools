import type {
  FunctionComponent,
  PropsWithChildren,
  ReactNode
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { overlayer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Describes a single overlay positioned over the base content.
 *
 * @property children - React node rendered inside the overlay element.
 * If falsy, the overlay is not rendered.
 * @property xPercent - Horizontal position of the overlay anchor as a percentage
 * of the root element's width. Defaults to `0`.
 * @property yPercent - Vertical position of the overlay anchor as a percentage
 * of the root element's height. Defaults to `0`.
 * @property justify - Controls the horizontal alignment of the overlay relative
 * to its anchor point via a CSS `translateX`:
 * - `'left'` — anchor is at the left edge of the overlay (`0%`).
 * - `'center'` — anchor is at the horizontal center (`-50%`). Default when omitted.
 * - `'right'` — anchor is at the right edge (`-100%`).
 * - `number` — arbitrary percentage offset (e.g. `25` produces `-25%`).
 */
type Overlay = {
  children?: ReactNode
  xPercent?: number
  yPercent?: number
  justify?: 'left' | 'center' | 'right' | number
}

/**
 * Props for the {@link Overlayer} component.
 *
 * @property overlays - Array of {@link Overlay} descriptors rendered on top of
 * the base content. Overlays with falsy `children` are skipped.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Content rendered in the base layer, below all overlays.
 */
export type Props = PropsWithChildren<WithClassName<{
  overlays?: Overlay[]
}>>

/**
 * Positions overlays over a base layer — **by publishing where they go, not by placing
 * them**. Each overlay carries its anchor and its shift as custom properties, and a
 * consumer's stylesheet turns them into a position. Naked like the rest of the library:
 * without such a sheet, the overlays render in the flow, under the base.
 *
 * ### Child elements
 * - `__base` — wrapping `<div>` that contains `children`.
 * - `__overlay` — one `<div>` per entry in `overlays` (falsy `children` entries
 * are omitted).
 *
 * ### CSS custom properties on each overlay element
 * **They are the whole of what this component does**, and they are public: it computes
 * three values and writes them down, and a consumer's stylesheet decides what to do with
 * them. It renders no positioning of its own — `styles.module.css` is empty, as for every
 * component here whose JavaScript measures nothing.
 * - `--lm-overlayer-anchor-x` — `xPercent` as a percentage (e.g. `42%`).
 * - `--lm-overlayer-anchor-y` — `yPercent` as a percentage (e.g. `10%`).
 * - `--lm-overlayer-translate-x` — `justify` as the shift it means: `0%` for `'left'`,
 * `-50%` for `'center'`, `-100%` for `'right'`, `-n%` for a number.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` containing the base layer and all positioned overlay elements.
 */
export const Overlayer: FunctionComponent<Props> = ({
  overlays,
  children,
  className
}) => {
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  const baseClss = c('base')
  return <div className={rootClss}>
    <div className={baseClss}>{children}</div>
    {overlays?.map(({
      children: overlayChildren,
      xPercent = 0,
      yPercent = 0,
      justify
    }, overlayPos) => {
      const overlayClss = c('overlay')
      let computedTranslateX: string
      if (typeof justify === 'number') { computedTranslateX = `-${justify}%` }
      else if (justify === 'center') { computedTranslateX = '-50%' }
      else if (justify === 'left') { computedTranslateX = '0%' }
      else if (justify === 'right') { computedTranslateX = '-100%' }
      else { computedTranslateX = '-50%' }
      // Written out in full, one literal per line: they are this component's public API,
      // a consumer greps for the exact string, and it has to exist in the source they
      // read. Public and not `--PRIVATE-`, because they are a conversion of props an
      // article wrote — three numbers given back as percentages — and not a mechanism
      // this component keeps to itself.
      const overlayCustomProps: Record<string, string> = {
        '--lm-overlayer-anchor-x': `${xPercent}%`,
        '--lm-overlayer-anchor-y': `${yPercent}%`,
        '--lm-overlayer-translate-x': computedTranslateX
      }
      if (isFalsy(overlayChildren)) return null
      return <div
        key={overlayPos}
        className={overlayClss}
        style={overlayCustomProps}>
        {overlayChildren}
      </div>
    })}
  </div>
}
