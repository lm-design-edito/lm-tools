import { useState } from 'react'
import { randomHash } from '../../../agnostic/random/uuid/index.js'

/** The attribute every component publishes its id in. */
export const COMP_ID_ATTRIBUTE = 'lm-tools-comp-id'

/** The id the consumer gave, or a generated one, stable for as long as the component lives. */
export function useCompId (compId?: string): string {
  const [generated] = useState(() => randomHash(8))
  return compId ?? generated
}

/** The id as the attribute a component spreads onto its root element. */
export function compIdAttribute (compId: string): Record<typeof COMP_ID_ATTRIBUTE, string> {
  return { [COMP_ID_ATTRIBUTE]: compId }
}
