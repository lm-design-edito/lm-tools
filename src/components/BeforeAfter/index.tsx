import {
  type FunctionComponent,
  useState,
  useCallback,
  useEffect
} from 'react'
import { BeforeAfterControlled, type Props as ControlledProps } from './index.controlled.js'

export type Props = ControlledProps & {
  defaultRatio?: number
  direction?: 'horizontal' | 'vertical'
  stateHandlers?: {
    ratio?: (ratio: number) => void
  }
}

export const BeforeAfter: FunctionComponent<Props> = ({
  direction,
  defaultRatio,
  stateHandlers,
  ...controlledProps
}) => {
  const { actionHandlers, ratio } = controlledProps
  const [internalRatio, setInternalRatio] = useState(ratio ?? defaultRatio ?? 0)

  const handlePointer = useCallback((e: PointerEvent, targetHRatio: number, targetVRatio: number, ratio: number | null, element: HTMLDivElement) => {
    if (direction === 'vertical') setInternalRatio(targetVRatio)
    else setInternalRatio(targetHRatio)
    actionHandlers?.pointer?.(e, targetHRatio, targetVRatio, ratio, element)
  }, [direction, actionHandlers?.pointer])

  useEffect(() => {
    stateHandlers?.ratio?.(internalRatio)
  }, [internalRatio, stateHandlers?.ratio])

  return <BeforeAfterControlled
    {...controlledProps}
    _modifiers={{
      horizontal: direction !== 'vertical',
      vertical: direction === 'vertical'
    }}
    ratio={ratio ?? internalRatio}
    actionHandlers={{ pointer: handlePointer }} />
}
