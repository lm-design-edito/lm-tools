import { useEffect, type FunctionComponent } from 'react'
import {
  IntersectionObserverComponent,
  type Props as IOCompProps
} from '~/components/IntersectionObserver/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'IntersectionObserverComponent'
const description = `
Component that observes its root element using the IntersectionObserver API
and notifies consumers about visibility changes.

@param props - Component properties.
@see {@link Props}

@returns A div element wrapping \`children\`, observed for intersection changes.

@remarks
- Automatically creates and disconnects the {@link IntersectionObserver} instance.
- Re-observes the element shortly after mount to handle late layout changes.
- Adds an \`is-intersecting\` modifier class when the element is intersecting.`

const tsxDetails = `
/** Alias for the native IntersectionObserver interface. */
export type IO = IntersectionObserver

/** Alias for the native IntersectionObserverEntry interface. */
export type IOE = IntersectionObserverEntry

/**
 * Configuration options for the underlying IntersectionObserver instance.
 *
 * @property root - The element used as the viewport for checking visibility.
 * If not provided, the browser viewport is used.
 * @property rootMargin - Margin around the root, in CSS margin format
 * (e.g. "10px 20px"). Expands or shrinks the effective root bounds.
 * @property threshold - A single number or an array of numbers indicating
 * at what percentage(s) of the target's visibility the observer callback
 * should be executed.
 */
export type ObserverOptions = {
  root?: HTMLElement
  rootMargin?: string
  threshold?: number[] | number
}

/**
 * Props for the IntersectionObserverComponent.
 *
 * @property onIntersected - Callback invoked whenever an intersection change
 * is reported. Receives an object containing the current
 * {@link IntersectionObserverEntry} (if available) and the active
 * {@link IntersectionObserver} instance.
 *
 * @property root - See {@link ObserverOptions.root}.
 * @property rootMargin - See {@link ObserverOptions.rootMargin}.
 * @property threshold - See {@link ObserverOptions.threshold}.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the observed element.
 */
export type Props = PropsWithChildren<WithClassName<{
  onIntersected?: (details: {
    ioEntry?: IOE | undefined
    observer: IO
  }) => void
} & ObserverOptions>>`

const demoProps: IOCompProps = {
  onIntersected: details => console.log('onIntersected handler', details),
  children: <div style={{
    backgroundColor: 'red',
    width: 400,
    height: 400
  }} />
}

export const IntersectionObserverDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}>
    <div style={{ height: '100vh' }}>Scroll down to make the IO comp appear and check the console</div>
    <IntersectionObserverComponent {...demoProps} />
  </CompDisplayer>
}
