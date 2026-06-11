import {
  type JSX,
  type FunctionComponent,
  type IframeHTMLAttributes,
  type ReactNode,
  useMemo
} from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../utils/index.js'
import { iframe as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'
import type { WithClassName } from '../utils/types.js'
import { isNotNullish } from '../../agnostic/misc/is-nullish/index.js'

/**
 * Props for the {@link Iframe} component.
 *
 * Extends native {@link IframeHTMLAttributes} with optional class name support.
 *
 * @property className - Additional class name(s) applied to the root element.
 * @property children - React content rendered as the iframe document body.
 * @property srcDoc - Raw HTML string used as iframe content when `children` is not provided.
 *
 * @remarks
 * This component behaves as a hybrid between a native `<iframe>` and a React renderer.
 *
 * Rendering priority:
 * - `children` takes precedence over `srcDoc` when provided.
 * - If `children` is `null` or `undefined`, `srcDoc` is used directly.
 *
 * When `children` is provided, it is converted to static HTML using
 * `renderToStaticMarkup` and injected into a complete HTML document:
 * `<!doctype html><html><body>...</body></html>`.
 */
export type Props = WithClassName<{}> & IframeHTMLAttributes<HTMLIFrameElement>

/**
 * Iframe component with React-to-HTML rendering support.
 *
 * Renders either:
 * - A raw HTML string via the `srcDoc` attribute, or
 * - A ReactNode rendered into static HTML via `renderToStaticMarkup`.
 *
 * ### Rendering strategy
 * 1. If `children` is defined (non-nullish), it is rendered to static HTML
 *    and used as iframe content.
 * 2. Otherwise, `srcDoc` is used as-is.
 *
 * The resulting content is wrapped in a minimal HTML document:
 * `<!doctype html><html><body>...</body></html>`.
 *
 * ### Notes
 * - The iframe content is static (no hydration, no client-side React inside iframe).
 * - `children` overrides `srcDoc`.
 * - Useful for embedding server-rendered UI fragments or documentation blocks.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A styled iframe element with computed HTML document content.
 */
export const Iframe: FunctionComponent<Props> = ({
  className,
  children,
  srcDoc,
  ...iframeProps
}): JSX.Element => {
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  const html = useMemo(() => {
    const body = isNotNullish(children)
      ? renderToStaticMarkup(children)
      : srcDoc
    return `<!doctype html><html><body>${body}</body></html>`
  }, [children, srcDoc])
  return <iframe
    {...iframeProps}
    className={rootClss}
    srcDoc={html}
  />
}
