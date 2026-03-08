import { type FunctionComponent } from 'react'
import {
  Paginator,
  type Props as PaginatorProps
} from '~/components/Paginator/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Paginator'
const description = <>
  Wraps and treats its children as an array of "pages". Forwards classes and data-attributes indicating scroll direction and "current pages" (currently in viewport intersecting with the virtual "threshold" set via <code>thresholdOffset</code> prop) information on the wrapper. State changes can be handled via <code>onDirectionChange</code>, <code>onPageChange</code>, <code>dispatchedDirectionChangeEventType</code> and <code>dispatchedPageChangeEventType</code>
</>

const tsxDetails = `
type PageState = {
  position: 'prev' | 'curr' | 'next'
  currCount: number
}

type PagesState = Map<number, PageState>

type DirectionState = 'forwards' | 'backwards' | null

type Props = PropsWithChildren<WithClassName<{
  thresholdOffsetPercent?: number
  onDirectionChange?: (direction: DirectionState) => void
  onPageChange?: (pages: PageState[]) => void
  dispatchedDirectionChangeEventType?: string
  dispatchedPageChangeEventType?: string
}>>`

const demoProps: PaginatorProps = {
  thresholdOffsetPercent: 80,
  children: [
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'darkgrey' }}>Page 1</div>,
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'tan' }}>Page 2</div>,
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'plum' }}>Page 3</div>
  ],
  onDirectionChange: dir => console.log('Direction changed', dir),
  onPageChange: pages => console.log('Page changed', pages),
}

export const PaginatorDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}>
    <Paginator {...demoProps} />
  </CompDisplayer>
}
