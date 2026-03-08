import { type FunctionComponent } from 'react'
import {
  Scrllgngn,
  type Props as ScrllgngnProps
} from '~/components/Scrllgngn/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Scrllgngn'
const description = 'Some description'
const tsxDetails = `import { stuff } from 'anything'

/* A comment */

const Truc = (props: Thing) => <div>{children}</div>
`

const props: ScrllgngnProps = {
  forceStickBlocks: 'none',
  thresholdOffsetPercent: 80,
  pages: [{
    id: 'premiere-page',
    blocks: [{
      id: 'scr-blk-1',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'linen'
      }}>scrl-blk-1</div>
    }, {
      id: 'bk-blk-1',
      depth: 'back',
      zIndex: 1000,
      children: <div style={{ width: 100, height: 200, marginLeft: 200, backgroundColor: 'maroon' }}>back 1</div>
    }, {
      id: 'ft-blk-1',
      depth: 'front',
      children: <div style={{ width: 100, height: 200, marginLeft: 50, backgroundColor: 'darkorange' }}>front 1</div>
    }, {
      depth: 'back',
      children: <div style={{ width: 100, height: 200, marginLeft: 50, marginTop: 200, backgroundColor: 'violet' }}>back 2</div>
    }]
  }, {
    id: 'deuz-page',
    blocks: [{
      id: 'scr-blk-2',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'gold'
      }}>scrl-blk-2</div>
    }, {
      id: 'bk-blk-1'
    }]
  }, {
    id: 'troiz-page',
    blocks: [{
      id: 'scr-blk-3',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'honeydew'
      }}>scrl-blk-3</div>
    }, {
      id: 'ft-blk-1'
    }]
  }, {
    id: 'quatr-page',
    blocks: [{
      id: 'scr-blk-4',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'fuchsia'
      }}>scrl-blk-4</div>
    }]
  }, {
    id: 'cinq-page',
    blocks: [{
      id: 'scr-blk-5',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'orangered'
      }}>scrl-blk-5</div>
    }]
  }, {
    id: 'six-page',
    blocks: [{
      id: 'scr-blk-6',
      depth: 'scroll',
      children: <div style={{
        width: 300,
        height: 2000,
        backgroundColor: 'papayawhip'
      }}>scrl-blk-6</div>
    }, {
      id: 'ft-blk-1'
    }]}
  ]
}

export const ScrllgngnDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}>
    <Scrllgngn {...props} />
  </CompDisplayer>
}
