/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach } from 'vitest'
import { deepSelect } from './index.js'

afterEach(() => { document.body.innerHTML = '' })

describe('deepSelect', () => {
  describe('light DOM', () => {
    it('finds every match in document order', async () => {
      document.body.innerHTML = `
        <div class="needle" id="one"><span class="needle" id="two"></span></div>
        <p class="needle" id="three"></p>`
      const found = await deepSelect('.needle')
      expect(found.map(elt => elt.id)).toEqual(['one', 'two', 'three'])
    })

    it('returns an empty array when nothing matches', async () => {
      document.body.innerHTML = '<div class="hay"></div>'
      expect(await deepSelect('.needle')).toEqual([])
    })

    it('never returns the traversal root, even when it matches', async () => {
      const root = makeElement('div', { class: 'needle', id: 'root' }, document.body)
      makeElement('span', { class: 'needle', id: 'child' }, root)
      const found = await deepSelect('.needle', { fromElement: root })
      expect(found.map(elt => elt.id)).toEqual(['child'])
    })

    it('scopes the walk to fromElement', async () => {
      const kept = makeElement('div', { id: 'kept' }, document.body)
      makeElement('span', { class: 'needle', id: 'inside' }, kept)
      const other = makeElement('div', { id: 'other' }, document.body)
      makeElement('span', { class: 'needle', id: 'outside' }, other)
      const found = await deepSelect('.needle', { fromElement: kept })
      expect(found.map(elt => elt.id)).toEqual(['inside'])
    })
  })

  describe('shadow roots', () => {
    it('pierces an open shadow root', async () => {
      const { shadow } = makeHost(document.body)
      makeElement('span', { class: 'needle', id: 'in-shadow' }, shadow)
      const found = await deepSelect('.needle')
      expect(found.map(elt => elt.id)).toEqual(['in-shadow'])
    })

    it('descends into shadow roots nested inside shadow roots', async () => {
      const { shadow: first } = makeHost(document.body)
      const { shadow: second } = makeHost(first)
      const { shadow: third } = makeHost(second)
      makeElement('span', { class: 'needle', id: 'depth-three' }, third)
      const found = await deepSelect('.needle')
      expect(found.map(elt => elt.id)).toEqual(['depth-three'])
    })

    it('ignores a closed shadow root', async () => {
      const host = makeElement('div', { id: 'host' }, document.body)
      const closed = host.attachShadow({ mode: 'closed' })
      makeElement('span', { class: 'needle', id: 'unreachable' }, closed)
      expect(await deepSelect('.needle')).toEqual([])
    })

    it('returns a matching host as well as its shadow content', async () => {
      const { shadow } = makeHost(document.body, { class: 'needle', id: 'host' })
      makeElement('span', { class: 'needle', id: 'in-shadow' }, shadow)
      const found = await deepSelect('.needle')
      expect(found.map(elt => elt.id)).toEqual(['host', 'in-shadow'])
    })

    it('returns slotted content once, from the light DOM', async () => {
      const { host, shadow } = makeHost(document.body)
      makeElement('slot', { name: 'here' }, shadow)
      makeElement('span', { class: 'needle', id: 'slotted', slot: 'here' }, host)
      const found = await deepSelect('.needle')
      expect(found.map(elt => elt.id)).toEqual(['slotted'])
    })
  })

  describe('traversal order', () => {
    it('places shadow content at its host, ahead of the host own light children', async () => {
      makeElement('div', { class: 'needle', id: 'before' }, document.body)
      const { host, shadow } = makeHost(document.body)
      makeElement('span', { class: 'needle', id: 'in-shadow' }, shadow)
      makeElement('span', { class: 'needle', id: 'host-child' }, host)
      makeElement('div', { class: 'needle', id: 'after' }, document.body)
      const found = await deepSelect('.needle')
      expect(found.map(elt => elt.id)).toEqual(['before', 'in-shadow', 'host-child', 'after'])
    })
  })

  describe('chunked traversal', () => {
    // Yielding on every node is kept to a small tree on purpose: one setTimeout(0)
    // per element puts a few thousand of them well over any sane test timeout.
    it('yields on every node without losing one', async () => {
      const planted = buildStressTree(document.body, SMALL)
      const found = await deepSelect('.needle', { chunkSize: 1 })
      expect(found).toHaveLength(planted)
    })

    it('returns the same elements whatever the chunk size', async () => {
      buildStressTree(document.body, STRESS)
      const [chunked, whole] = await Promise.all([
        deepSelect('.needle', { chunkSize: 50 }),
        deepSelect('.needle', { chunkSize: 100000 })
      ])
      expect(chunked).toEqual(whole)
    })
  })

  describe('a deep and wide tree', () => {
    it('finds every match across nested shadow roots', async () => {
      const planted = buildStressTree(document.body, STRESS)
      const found = await deepSelect('.needle')
      expect(found).toHaveLength(planted)
    })

    it('finds nothing left behind when scoped to one branch', async () => {
      const branch = makeElement('div', { id: 'branch' }, document.body)
      const planted = buildStressTree(branch, STRESS)
      buildStressTree(document.body, STRESS)
      const found = await deepSelect('.needle', { fromElement: branch })
      expect(found).toHaveLength(planted)
    })
  })
})

/** Shape of the tree the stress cases walk: 155 hosts, ~4800 elements, 155 needles. */
const STRESS = { depth: 3, breadth: 5, leavesPerHost: 30 }

/** Same shape, small enough to be walked one node at a time. */
const SMALL = { depth: 2, breadth: 3, leavesPerHost: 5 }

type StressSpec = { depth: number, breadth: number, leavesPerHost: number }

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
      makeElement('div', { class: leaf === 0 ? 'needle' : 'hay' }, shadow)
    }
    planted = planted + 1
    planted = planted + buildStressTree(shadow, { ...spec, depth: spec.depth - 1 })
  }
  return planted
}
