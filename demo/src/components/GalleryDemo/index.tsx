import { useState, type FunctionComponent } from 'react'
import {
  Gallery,
  type Props as GalleryProps
} from '~/components/Gallery/index.js'
import { gallery as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'Gallery'
const description = 'Some description'
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
/* thing */

`

const demoProps: GalleryProps = {
  paddingLeft: '30%',
  paddingRight: '30%',
  prevButtonContent: '<',
  nextButtonContent: '>',
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
