import {
  MODIFIERS,
  type Instruction,
  type Modifier,
  type ParsedInstruction
} from './types.js'

const isModifier = (segment: string): segment is Modifier =>
  (MODIFIERS as readonly string[]).includes(segment)

/**
 * Takes an instruction apart: its verb, its argument if it has one, its modifiers.
 *
 * **Trailing segments are read as modifiers until one isn't**, and everything left is
 * the verb — whatever its own internal shape. That single rule is what lets a verb
 * carry an argument without the grammar having two levels: `'jump-to:500:once'` gives
 * back `jump-to`, `'500'` and `once`, and the parser never needs to know that `jump-to`
 * is the kind of verb that takes a number.
 *
 * @param instruction - What the consumer wrote.
 * @returns Its parts. `verb` is empty when the instruction was nothing but modifiers.
 */
export function parseInstruction (instruction: string): ParsedInstruction {
  const segments = instruction.trim().split(':')
  const modifiers = new Set<Modifier>()
  // Walked from the end: the modifiers are a set, so their order carries nothing and
  // only the boundary with the verb matters.
  while (segments.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- length checked by the loop
    const last = segments[segments.length - 1]!
    if (!isModifier(last)) break
    modifiers.add(last)
    segments.pop()
  }
  const [verb, ...rest] = segments
  return {
    verb: verb ?? '',
    // Rejoined rather than taken as one segment: an argument holding a colon of its
    // own stays whole, and nothing in the grammar has to forbid it.
    ...(rest.length > 0 ? { arg: rest.join(':') } : {}),
    once: modifiers.has('once'),
    force: modifiers.has('force')
  }
}

/**
 * The one-or-many shape of a list prop, reduced to the many.
 *
 * A single instruction is written bare — `whenVisible='play'` — because that is what an
 * article writes nine times out of ten, and a one-item array in hyper-json is four
 * lines to say one word.
 *
 * @template A - The component's vocabulary.
 * @param given - What the consumer wrote.
 * @returns The instructions in the order they were given, which is the order they run.
 */
export function toInstructionList <A extends string> (
  given: Instruction<A> | Array<Instruction<A>> | undefined
): Array<Instruction<A>> {
  if (given === undefined) return []
  if (Array.isArray(given)) return given
  return [given]
}
