import {
  createContext,
  useContext,
  useMemo,
  type FunctionComponent,
  type PropsWithChildren
} from 'react'
import type { DisclosureState } from './types.js'

// Disclosed by default: content with no disclaimer above it is withheld from nobody, and
// a component should not have to opt in to be reachable.
const DisclosureContext = createContext<DisclosureState>({ isDisclosed: true })

/** Reads the disclosure of the subtree the calling component sits in. */
export const useDisclosure = (): DisclosureState => useContext(DisclosureContext)

/**
 * Declares whether everything below has been disclosed to the reader.
 *
 * A context is the only thing that reaches: a withheld component sits an unknown number
 * of layers under the disclaimer withholding it, with components in between that forward
 * none of its props. **Nesting only ever withholds more** — a dismissed disclaimer inside
 * a standing one stays undisclosed, so an outer decision cannot be undone from the
 * inside.
 *
 * @param props - `isDisclosed`, and the subtree it speaks for.
 * @returns The subtree, under a disclosure every component in it can read.
 */
export const DisclosureProvider: FunctionComponent<PropsWithChildren<{ isDisclosed: boolean }>> = ({
  isDisclosed,
  children
}) => {
  const inherited = useDisclosure()
  const value = useMemo<DisclosureState>(
    () => ({ isDisclosed: inherited.isDisclosed && isDisclosed }),
    [inherited.isDisclosed, isDisclosed]
  )
  return <DisclosureContext.Provider value={value}>{children}</DisclosureContext.Provider>
}
