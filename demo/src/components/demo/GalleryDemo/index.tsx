import { useState, type FunctionComponent } from 'react'
import {
  Gallery,
  type Props as GalleryProps
} from '~/components/Gallery/index.js'
import { gallery as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Gallery'
const description = `
Horizontally scrollable gallery component with navigation controls and pagination.

Tracks the active slot based on scroll position and exposes state through CSS class names
and a \`data-active\` attribute on the root element.

@param props - Component properties.
@see {@link Props}
@returns A container element wrapping:
- A scrollable area containing each child in a slot wrapper,
- Previous/next navigation controls,
- Pagination controls allowing direct slot activation.`

const tsxDetails = `
/**
 * Props for the Gallery component.
 *
 * @property paddingLeft - Left padding applied to the first slot. Accepts a number (pixels) or any valid CSS length value.
 * If not provided, falls back to \`padding\` or \`0px\`.
 * @property paddingRight - Right padding applied to the last slot. Accepts a number (pixels) or any valid CSS length value.
 * If not provided, falls back to \`padding\` or \`0px\`.
 * @property padding - Shorthand horizontal padding applied to both ends when \`paddingLeft\` and/or \`paddingRight\`
 * are not explicitly defined. Accepts a number (pixels) or any valid CSS length value.
 * @property prevButtonContent - Content rendered inside the "previous" navigation control.
 * Defaults to the string \`"prev"\` when not provided.
 * @property nextButtonContent - Content rendered inside the "next" navigation control.
 * Defaults to the string \`"next"\` when not provided.
 * @property paginationContent - Content rendered inside each pagination item.
 * Can be:
 * - A ReactNode used for all pages,
 * - A function receiving the page index and returning a ReactNode,
 * - Undefined, in which case the page index is displayed.
 * @property initActive - Optional. When uncontrolled mode, sets the default active slot at mount
 * @property active - Optional controlled index. When provided, the active slot is driven by this
 * value instead of internal scroll-derived state. When omitted, the component manages its own
 * active index based on scroll position.
 * @property noSnap - Optional, defines if scroll is free in side the scroller or not (defaults to false)
 * @property stateHandlers - Callbacks called after the state changed
 * @property stateHandlers.slotChanged - Called when the active slot changes due to scrolling. Receives the new active index.
 * @property actionHandlers - Callbacks called after a user interaction
 * @property actionHandlers.prevClick - Called when the "previous" control is clicked. Receives the current active index before navigation occurs.
 * @property actionHandlers.nextClick - Called when the "next" control is clicked. Receives the current active index before navigation occurs.
 * @property actionHandlers.paginationClick - Called when a pagination item is clicked. Receives the current active index and the target index.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Elements rendered as gallery slots. Each child is wrapped in a slot container.
 */`

const demoStyles = `
.${publicClassName} {
  position: relative;
}

.${publicClassName}__actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.${publicClassName}__actions button {
  cursor: pointer;
  margin : 8px;
  pointer-events: all;
}

.${publicClassName}__pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.${publicClassName}__page {
  width: 8px;
  height: 8px;
  cursor: pointer;
  border-radius: 8px;
  background-color: black;
  opacity: .4;
  transition: opacity 200ms;
  font-size: 0;
}

.${publicClassName}__page:hover {
  opacity: .6;
}

.${publicClassName}__page.${publicClassName}__page--active {
  opacity: 1;
}`

const demoProps: GalleryProps = {
  paddingLeft: '30%',
  paddingRight: '30%',
  prevButtonContent: <button>‹</button>,
  nextButtonContent: <button>›</button>,
  paginationContent: page => `${page}`,
  noSnap: true,
  children: [
    <div style={{ width: '40px', height: '200px', backgroundColor: 'coral', margin: 40 }}>truc</div>,
    <div style={{ width: '400px', height: '200px', backgroundColor: 'cadetblue', margin: 40 }}>trac</div>,
    <div style={{ width: '800px', height: '200px', backgroundColor: 'chartreuse', margin: 40 }}>troc</div>,
    <div style={{ width: '80px', height: '200px', backgroundColor: 'coral', margin: 40 }}>truc</div>,
    <div style={{ width: '120px', height: '200px', backgroundColor: 'cadetblue', margin: 40 }}>trac</div>,
    <div style={{ width: '1200px', height: '200px', backgroundColor: 'chartreuse', margin: 40 }}>troc</div>,
    <div style={{ width: '40px', height: '200px', backgroundColor: 'coral', margin: 40 }}>truc</div>,
    <div style={{ width: '400px', height: '200px', backgroundColor: 'cadetblue', margin: 40 }}>trac</div>,
    <div style={{ width: '800px', height: '200px', backgroundColor: 'chartreuse', margin: 40 }}>troc</div>,
    <div style={{ width: '80px', height: '200px', backgroundColor: 'coral', margin: 40 }}>truc</div>,
    <div style={{ width: '120px', height: '200px', backgroundColor: 'cadetblue', margin: 40 }}>trac</div>,
    <div style={{ width: '1200px', height: '200px', backgroundColor: 'chartreuse', margin: 40 }}>troc</div>
  ]
}

export const GalleryDemo: FunctionComponent = () => {
  const [slot, setSlot] = useState<number | undefined>(undefined)
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    <div>
      Force specific slot:
      <button onClick={() => setSlot(undefined)}>{slot === undefined ? <strong>undefined</strong> : 'undefined'}</button>
      <button onClick={() => setSlot(0)}>{slot === 0 ? <strong>0</strong> : '0'}</button>
      <button onClick={() => setSlot(1)}>{slot === 1 ? <strong>1</strong> : '1'}</button>
      <button onClick={() => setSlot(2)}>{slot === 2 ? <strong>2</strong> : '2'}</button>
      <button onClick={() => setSlot(3)}>{slot === 3 ? <strong>3</strong> : '3'}</button>
    </div>
    <Gallery
      {...demoProps}
      active={slot} />
  </CompDisplayer>
}
