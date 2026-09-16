import { type FunctionComponent } from 'react'
import {
  Sequencer,
  type Props as SequencerProps
} from '~/components/Sequencer/index.js'
import { sequencer as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Sequencer'
const description = `
A sequencer over its children, which it classifies and never moves. It renders no box
of its own around anything: the modifiers go straight onto the children, by
\`cloneElement\`. A wrapper would take the place a consumer lays out — it would be the
grid or flex item, leaving the element they actually wrote one level down — and a
sequencer exists precisely so that a stylesheet can animate that element. The cost is
the contract: a child has to honour \`className\`.

Children that are not elements — text, whitespace — are rendered untouched and take no
part: they carry no class, so they simply stay visible throughout.

Two numbers run it, and they are not the same one. The **position** is the counter: it
goes from \`0\` to \`totalSteps - 1\` and the tempo advances it. The **active step** is
what the position means — \`stepMap[position] ?? position\`. Children are matched against
the active step, never against the position.

### On the root
\`--playing\`, \`--at-start\`, \`--at-end\`, \`--ended\`, plus \`data-step\`,
\`data-active-step\`, \`data-total-steps\` and \`data-tempo\`.

### On each element child
The \`__child\` element class, then three pairs, one of each always present:
- \`--on\` / \`--off\` — whether it belongs to the active step.
- \`--is-first\` / \`--not-first\` — whether its first turn in this lap is still to come.
- \`--is-last\` / \`--not-last\` — whether it has another turn left in this lap.

The three pairs are derived, not remembered: the order of the whole lap is known from
\`stepMap\` alone, so "has it been shown yet" is a question about positions before this
one, not about what happened since mount.

A child says which steps it answers to with \`data-steps="2, 6"\`, and falls back to its
own position among the element children. Written on the child rather than gathered in a
prop: a parallel array and a children list derive from one another, and inserting a
child in the middle would mean reindexing the array.`

const tsxDetails = `
export type Props = PropsWithChildren<WithClassName<{
  totalSteps?: number
  stepMap?: number[]
  step?: number
  defaultStep?: number
  play?: boolean
  tempo?: number
  loop?: boolean
  onStepChanged?: (step: number, activeStep: number) => void
  onIsPlayingChanged?: (isPlaying: boolean) => void
  onIsEndedChanged?: (isEnded: boolean) => void
  onLooped?: () => void
  onReachedFirstStep?: () => void
  onReachedLastStep?: () => void
}>>`

const demoStyles = `
.${publicClassName} {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.${publicClassName}__child {
  transition: opacity 400ms;
}

.${publicClassName}__child--off.${publicClassName}__child--is-first {
  opacity: 0;
}

.${publicClassName}__child--off.${publicClassName}__child--not-first {
  opacity: .3;
}

.${publicClassName}__child--on {
  opacity: 1;
  font-weight: 800;
}`

const childStyle = {
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center',
  width: '60px',
  height: '60px',
  margin: '4px',
  background: 'coral'
}

// Sixteen children, one step each, plus a `stepMap` so the demo shows the two numbers
// being different: the first three positions play steps 4, 9 and 2 before the sequence
// carries on at position 3. The last child declares `data-steps`, so it lights up twice.
const demoProps: SequencerProps = {
  play: true,
  loop: true,
  tempo: 120,
  stepMap: [4, 9, 2],
  children: [
    <div style={childStyle}>1</div>,
    <div style={childStyle}>2</div>,
    <div style={childStyle}>3</div>,
    <div style={childStyle}>4</div>,
    <div style={childStyle}>5</div>,
    <div style={childStyle}>6</div>,
    <div style={childStyle}>7</div>,
    <div style={childStyle}>8</div>,
    <div style={childStyle}>9</div>,
    <div style={childStyle}>10</div>,
    <div style={childStyle}>11</div>,
    <div style={childStyle}>12</div>,
    <div style={childStyle}>13</div>,
    <div style={childStyle}>14</div>,
    <div style={childStyle}>15</div>,
    <div
      style={childStyle}
      data-steps='0, 15'>16</div>
  ]
}

export const SequencerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    <Sequencer {...demoProps} />
  </CompDisplayer>
}
