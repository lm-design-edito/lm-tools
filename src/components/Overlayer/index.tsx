import {
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { overlayer as publicClassname } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Describes a single overlay positioned over the base content.
 *
 * @property content - React node rendered inside the overlay element.
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
  content?: ReactNode
  xPercent?: number
  yPercent?: number
  justify?: 'left' | 'center' | 'right' | number
}

/**
 * Props for the {@link Overlayer} component.
 *
 * @property overlays - Array of {@link Overlay} descriptors rendered on top of
 * the base content. Overlays with falsy `content` are skipped.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Content rendered in the base layer, below all overlays.
 */
export type Props = PropsWithChildren<WithClassName<{
  overlays?: Overlay[]
}>>

/**
 * Absolute positioning overlay component. Renders a base content layer and
 * stacks one or more overlays on top of it, each independently positioned via
 * percentage coordinates and a justify alignment.
 *
 * ### Child elements
 * - `__base` — wrapping `<div>` that contains `children`.
 * - `__overlay` — one `<div>` per entry in `overlays` (falsy `content` entries
 * are omitted).
 *
 * ### CSS custom properties on each overlay element
 * - `--PRIVATE-left` — derived from `xPercent` (e.g. `42%`). Used internally
 * to set the horizontal anchor position.
 * - `--PRIVATE-top` — derived from `yPercent` (e.g. `10%`). Used internally
 * to set the vertical anchor position.
 * - `--PRIVATE-translate-x` — derived from `justify`. Used internally to shift
 * the overlay relative to its anchor.
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
  const c = clss(publicClassname, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  const baseClss = c('base')
  return <div className={rootClss}>
    <div className={baseClss}>{children}</div>
    {overlays?.map(({
      content,
      xPercent = 0,
      yPercent = 0,
      justify
    }) => {
      const overlayClss = c('overlay')
      let computedTranslateX: string
      if (typeof justify === 'number') { computedTranslateX = `-${justify}%` }
      else if (justify === 'center') { computedTranslateX = '-50%' }
      else if (justify === 'left') { computedTranslateX = '0%' }
      else if (justify === 'right') { computedTranslateX = '-100%' }
      else { computedTranslateX = '-50%' }
      const overlayCustomProps: Record<string, string> = {
        '--PRIVATE-left': `${xPercent}%`,
        '--PRIVATE-top': `${yPercent}%`,
        '--PRIVATE-translate-x': computedTranslateX
      }
      if (isFalsy(content)) return null
      return <div
        className={overlayClss}
        style={overlayCustomProps}>
        {content}
      </div>
    })}
  </div>
}
