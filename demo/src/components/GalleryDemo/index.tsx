import { useState, type FunctionComponent } from 'react'
import {
  Gallery,
  type Props as GalleryProps
} from '~/components/Gallery/index.js'
import { gallery as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'Gallery'
const description = <>
  Horizontal scroller, scroll is either snaped or not depending on <code>noSnap</code> prop.
  Behavior is controlled when <code>active</code> prop is provided and the element becomes not user scrollable when controlled.
</>
const tsxDetails = `
type Props = PropsWithChildren<WithClassName<{
  paddingLeft?: string | number
  paddingRight?: string | number
  padding?: string | number
  prevButtonContent?: ReactNode
  nextButtonContent?: ReactNode
  paginationContent?: ReactNode | ((page: number) => ReactNode)
  initActive?: number
  active?: number
  noSnap?: boolean
  onPrevClick?: (activePos: number) => void
  onNextClick?: (activePos: number) => void
  onPaginationClick?: (activePos: number, targetPos: number) => void
  onSlotChange?: (activePos: number) => void
}>>

`

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
}

.${publicClassName}__actions button {
  cursor: pointer;
  margin : 8px;
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
}

`

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
