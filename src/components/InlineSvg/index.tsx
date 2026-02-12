import {
  useEffect,
  type FunctionComponent,
  type JSX,
  type PropsWithChildren
} from 'react'
import type { WithClassName } from '../utils/types.js'

export type Props = PropsWithChildren<WithClassName<{
  src: string
}>>

export const InlineSvg: FunctionComponent<Props> = ({
  src
}): JSX.Element => {
  useEffect(() => {

  }, [src]);
  return <></>
}