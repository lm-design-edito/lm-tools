/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach } from 'vitest'
import { watchSelection } from './index.js'

const kills: Array<() => void> = []

afterEach(() => {
  kills.splice(0).forEach(kill => kill())
  document.body.innerHTML = ''
})

const watchTracked = async (
  selector: string,
  options?: Parameters<typeof watchSelection>[1]
): Promise<{ kill: () => void }> => {
  const handle = await watchSelection(selector, options)
  kills.push(handle.kill)
  return handle
}

describe('watchSelection', () => {
  describe('the initial selection', () => {
    it('watches every element matching at setup time', async () => {
      makeElement('div', { class: 'needle', id: 'one' }, document.body)
      makeElement('div', { class: 'needle', id: 'two' }, document.body)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch })
      expect(seen.watchedIds()).toEqual(['one', 'two'])
    })

    it('watches nothing when nothing matches', async () => {
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch })
      expect(seen.watchedIds()).toEqual([])
    })
  })

  describe('elements coming and going', () => {
    it('watches an element added after setup', async () => {
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, selectIntervalMs: 10 })
      makeElement('div', { class: 'needle', id: 'late' }, document.body)
      await until(() => seen.watchedIds().includes('late'))
      expect(seen.watchedIds()).toEqual(['late'])
    })

    it('unwatches an element that left the document', async () => {
      const going = makeElement('div', { class: 'needle', id: 'going' }, document.body)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, selectIntervalMs: 10 })
      going.remove()
      await until(() => seen.unwatchedIds().includes('going'))
      expect(seen.unwatchedIds()).toEqual(['going'])
    })

    it('unwatches an element that stopped matching the selector', async () => {
      const turning = makeElement('div', { class: 'needle', id: 'turning' }, document.body)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, selectIntervalMs: 10 })
      turning.className = 'hay'
      await until(() => seen.unwatchedIds().includes('turning'))
      expect(seen.unwatchedIds()).toEqual(['turning'])
    })

    it('watches an element added inside an open shadow root', async () => {
      const { shadow } = makeHost(document.body)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, selectIntervalMs: 10 })
      makeElement('span', { class: 'needle', id: 'in-shadow' }, shadow)
      await until(() => seen.watchedIds().includes('in-shadow'))
      expect(seen.watchedIds()).toEqual(['in-shadow'])
    })
  })

  describe('a scoped root', () => {
    it('watches only what matches inside the given root', async () => {
      const kept = makeElement('div', { id: 'kept' }, document.body)
      makeElement('span', { class: 'needle', id: 'inside' }, kept)
      makeElement('span', { class: 'needle', id: 'outside' }, document.body)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, root: kept })
      expect(seen.watchedIds()).toEqual(['inside'])
    })

    it('never sees an element added outside its root', async () => {
      const kept = makeElement('div', { id: 'kept' }, document.body)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, root: kept, selectIntervalMs: 5 })
      makeElement('span', { class: 'needle', id: 'outside' }, document.body)
      await wait(80)
      expect(seen.watchedIds()).toEqual([])
    })
  })

  describe('elements that stay', () => {
    it('watches an element once, however many polls go by', async () => {
      makeElement('div', { class: 'needle', id: 'staying' }, document.body)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, selectIntervalMs: 5 })
      await wait(120)
      expect(seen.watchCount('staying')).toBe(1)
      expect(seen.unwatchedIds()).toEqual([])
    })
  })

  describe('kill', () => {
    it('stops polling', async () => {
      const seen = makeLedger()
      const { kill } = await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, selectIntervalMs: 5 })
      kill()
      makeElement('div', { class: 'needle', id: 'after-kill' }, document.body)
      await wait(80)
      expect(seen.watchedIds()).toEqual([])
    })

    it('unwatches everything still watched', async () => {
      makeElement('div', { class: 'needle', id: 'one' }, document.body)
      makeElement('div', { class: 'needle', id: 'two' }, document.body)
      const seen = makeLedger()
      const { kill } = await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch })
      kill()
      expect(seen.unwatchedIds()).toEqual(['one', 'two'])
    })
  })

  describe('a deep and wide tree', () => {
    it('watches every needle planted across nested shadow roots', async () => {
      const planted = buildStressTree(document.body, STRESS)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, selectIntervalMs: 10 })
      expect(seen.watchedIds()).toHaveLength(planted)
    })

    it('watches each element once when the walk outlasts the interval', async () => {
      buildStressTree(document.body, STRESS)
      const seen = makeLedger()
      await watchTracked('.needle', { watch: seen.watch, unwatch: seen.unwatch, selectIntervalMs: 1 })
      await wait(300)
      expect(seen.watchedMoreThanOnce()).toEqual([])
      expect(seen.unwatchedIds()).toEqual([])
    })
  })
})

/** Shape of the tree the stress cases walk: 155 hosts, ~4800 elements, 155 needles. */
const STRESS = { depth: 3, breadth: 5, leavesPerHost: 30 }

type StressSpec = { depth: number, breadth: number, leavesPerHost: number }

type Ledger = {
  watch: (elt: Element) => void
  unwatch: (elt: Element) => void
  watchedIds: () => string[]
  unwatchedIds: () => string[]
  watchCount: (id: string) => number
  watchedMoreThanOnce: () => string[]
}

const makeLedger = (): Ledger => {
  const watched: Element[] = []
  const unwatched: Element[] = []
  const countIn = (list: Element[], elt: Element): number => list.filter(one => one === elt).length
  return {
    watch: elt => { watched.push(elt) },
    unwatch: elt => { unwatched.push(elt) },
    watchedIds: () => watched.map(elt => elt.id),
    unwatchedIds: () => unwatched.map(elt => elt.id),
    watchCount: id => watched.filter(elt => elt.id === id).length,
    watchedMoreThanOnce: () => [...new Set(watched.filter(elt => countIn(watched, elt) > 1))].map(elt => elt.id)
  }
}

const wait = async (ms: number): Promise<void> => {
  await new Promise(resolve => { setTimeout(resolve, ms) })
}

const until = async (predicate: () => boolean, timeoutMs = 2000): Promise<void> => {
  const deadline = Date.now() + timeoutMs
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('condition never became true')
    await wait(5)
  }
}

const makeElement = (
  tagName: string,
  attributes: Record<string, string>,
  parent: ParentNode
): HTMLElement => {
  const elt = document.createElement(tagName)
  Object.entries(attributes).forEach(([name, value]) => elt.setAttribute(name, value))
  parent.appendChild(elt)
  return elt
}

/** Returns both halves, since a test needs the host as often as the root it carries. */
const makeHost = (
  parent: ParentNode,
  attributes: Record<string, string> = {}
): { host: HTMLElement, shadow: ShadowRoot } => {
  const host = makeElement('div', attributes, parent)
  return { host, shadow: host.attachShadow({ mode: 'open' }) }
}

/** Plants `breadth ** depth` shadow roots, each holding `leavesPerHost` leaves and one needle. */
const buildStressTree = (parent: ParentNode, spec: StressSpec): number => {
  if (spec.depth === 0) return 0
  let planted = 0
  for (let index = 0; index < spec.breadth; index += 1) {
    const { shadow } = makeHost(parent)
    for (let leaf = 0; leaf < spec.leavesPerHost; leaf += 1) {
      makeElement('div', { class: leaf === 0 ? 'needle' : 'hay', id: `needle-${String(index)}-${String(leaf)}-${String(spec.depth)}` }, shadow)
    }
    planted = planted + 1
    planted = planted + buildStressTree(shadow, { ...spec, depth: spec.depth - 1 })
  }
  return planted
}
