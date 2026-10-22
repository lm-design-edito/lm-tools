/**
 * The attribute a child uses to say which steps it belongs to.
 *
 * **Written on the child rather than gathered in a prop**, and that is the whole
 * difference with the `activateOnStep` this component used to take. A parallel array and
 * a children list derive from one another: inserting a child in the middle means
 * reindexing the array, and nothing signals the one time it is forgotten. Carried by the
 * child, the attachment travels with it.
 *
 * It stays in the DOM once read — it costs nothing, it is worth having while debugging,
 * and a stylesheet can select on it.
 */
export const STEPS_ATTRIBUTE = 'data-steps'

/**
 * The attribute a child uses to say that the sequence ends on it.
 *
 * It answers a shape the positional fallback could not: an article writes the steps in
 * reading order, then — **after** the sequence proper — the children that belong to
 * several steps at once and name them with {@link STEPS_ATTRIBUTE}. Those trailing
 * children would each claim a step of their own in the count, and the sequence would run
 * on into steps where nothing but them is lit.
 *
 * Marking the last step is what separates the two halves, and it is written where the
 * separation is rather than recounted in a prop — the same reason `data-steps` lives on
 * the child. A child after the mark that names no step therefore never lights up, which
 * is the honest reading of « it is not part of the sequence ».
 *
 * Valueless, as an HTML boolean attribute: what matters is that it is there.
 */
export const LAST_STEP_ATTRIBUTE = 'data-last-step'
