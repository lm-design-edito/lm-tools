import { useState } from 'react'
import { randomHash } from '../../../agnostic/random/uuid/index.js'

export const COMP_ID_ATTRIBUTE = 'lm-tools-comp-id'

export function useCompId (compId?: string): string {
  const [generated] = useState(() => randomHash(8))
  return compId ?? generated
}

export function compIdAttribute (compId: string): Record<typeof COMP_ID_ATTRIBUTE, string> {
  return {
    [COMP_ID_ATTRIBUTE]: compId
  }
}
