import { type FunctionComponent } from 'react'
import {
  BeforeAfterControlled,
  type Props as ControlledProps
} from './index.controlled.js'

export type Props = ControlledProps & {}

export const BeforeAfter: FunctionComponent<Props> = ({
  actionHandlers,
  ratio,
  ...controlledProps
}) => {
  const handleDrag = (x: number, y: number) => {
    actionHandlers?.dragged?.(x, y)
    console.log(x, y)
  }
  const handleClick = (x: number, y: number) => {
    actionHandlers?.clicked?.(x, y)
    console.log(x, y)
  }
  return <BeforeAfterControlled
    {...controlledProps}
    ratio={ratio}
    actionHandlers={{
      dragged: handleDrag,
      clicked: handleClick
    }} />
}
