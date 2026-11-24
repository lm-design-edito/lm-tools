import { watchSelection } from '../../agnostic/html/watch-selection/index.js'
import { splitTrim } from '../../agnostic/strings/split-trim/index.js'

/**
 * Watches the document for elements that declare class changes keyed on their own
 * visibility, and applies them as they enter or leave the viewport.
 *
 * Each attribute takes a comma-separated list of class names. `when-*` applies on every
 * crossing, `once-*` only on the first one:
 *
 * - `data-add-when-visible`, `data-remove-when-visible`, `data-toggle-when-visible`
 * - `data-add-when-hidden`, `data-remove-when-hidden`, `data-toggle-when-hidden`
 * - `data-add-once-visible`, `data-remove-once-visible`, `data-toggle-once-visible`
 * - `data-add-once-hidden`, `data-remove-once-hidden`, `data-toggle-once-hidden`
 *
 * `data-animate-on-visibility` and `data-animate-on-visibility-once` are shorthands for
 * the `do-*` effect classes of `styles/index.scss`: the effect class is added with
 * `do--play` when the element is visible, and with `do--init` when it is hidden.
 *
 * Elements are discovered by polling, so one appended later is picked up without any
 * registration. Calling this twice does nothing the second time.
 *
 * Requires a browser environment with `window` and `document`.
 *
 * @see {@link deactivateVisibilityTriggers} to stop watching.
 */
export const activateVisibilityTriggers = async (): Promise<void> => {
  if (activation !== null) return
  const seenVisible: Element[] = []
  const seenHidden: Element[] = []
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const elt = entry.target
      if (entry.isIntersecting) {
        if (!seenVisible.includes(elt)) {
          applyClassChanges(elt, 'once-visible')
          seenVisible.push(elt)
        }
        applyClassChanges(elt, 'when-visible')
      } else {
        if (!seenHidden.includes(elt)) {
          applyClassChanges(elt, 'once-hidden')
          seenHidden.push(elt)
        }
        applyClassChanges(elt, 'when-hidden')
      }
    }
  }, {
    root: null,
    threshold: 0
  })
  const started: Activation = { kill: null, observer }
  activation = started
  const { kill } = await watchSelection(watchedSelector, {
    watch: elt => observer.observe(elt),
    unwatch: elt => observer.unobserve(elt),
    selectIntervalMs: 100
  })
  // Deactivated while the first selection was still running: nothing to hand the handle to.
  if (activation !== started) { kill(); observer.disconnect(); return }
  started.kill = kill
}

/**
 * Stops what {@link activateVisibilityTriggers} started: the polling ends and every
 * element is unobserved. Classes already applied are left in place.
 */
export const deactivateVisibilityTriggers = (): void => {
  if (activation === null) return
  activation.kill?.()
  activation.observer.disconnect()
  activation = null
}

type Moment = 'when-visible' | 'when-hidden' | 'once-visible' | 'once-hidden'

type Activation = {
  kill: (() => void) | null
  observer: IntersectionObserver
}

let activation: Activation | null = null

const watchedSelector = [
  '[data-animate-on-visibility]',
  '[data-animate-on-visibility-once]',
  '[data-add-when-visible]',
  '[data-add-when-hidden]',
  '[data-remove-when-visible]',
  '[data-remove-when-hidden]',
  '[data-toggle-when-visible]',
  '[data-toggle-when-hidden]',
  '[data-add-once-visible]',
  '[data-add-once-hidden]',
  '[data-remove-once-visible]',
  '[data-remove-once-hidden]',
  '[data-toggle-once-visible]',
  '[data-toggle-once-hidden]'
].join(',')

function applyClassChanges (elt: Element, moment: Moment): void {
  const toAdd = readClassList(elt, `data-add-${moment}`)
  const toRemove = readClassList(elt, `data-remove-${moment}`)
  const toToggle = readClassList(elt, `data-toggle-${moment}`)
  const isVisible = moment === 'when-visible' || moment === 'once-visible'
  const isOnce = moment === 'once-visible' || moment === 'once-hidden'
  const animateAttribute = isOnce
    ? 'data-animate-on-visibility-once'
    : 'data-animate-on-visibility'
  readClassList(elt, animateAttribute).forEach(effectClass => {
    toAdd.push(effectClass)
    // A first disappearance only arms the effect, so it adds no state modifier at all.
    if (isVisible) { toAdd.push('do--play'); toRemove.push('do--init') }
    else if (!isOnce) { toAdd.push('do--init'); toRemove.push('do--play') }
  })
  toAdd.forEach(className => elt.classList.add(className))
  toRemove.forEach(className => elt.classList.remove(className))
  toToggle.forEach(className => { elt.classList.toggle(className) })
}

function readClassList (elt: Element, attributeName: string): string[] {
  return splitTrim(elt.getAttribute(attributeName) ?? '', ',', true)
}
