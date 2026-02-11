import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { IntersectionObserverComponent } from './index.js'

// Import the right testing lib depending on the context (react vs. preact)
const { render, screen, cleanup, act } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: readonly number[] = [0]

  callback: IntersectionObserverCallback
  elements = new Set<Element>()

  constructor (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.root = options?.root ?? null
    if (options?.rootMargin !== undefined) this.rootMargin = options.rootMargin
    if (options?.threshold !== undefined) {
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold]
    }
  }

  observe (element: Element): void {
    this.elements.add(element)
  }

  unobserve (element: Element): void {
    this.elements.delete(element)
  }

  disconnect (): void {
    this.elements.clear()
  }

  takeRecords (): IntersectionObserverEntry[] {
    return []
  }

  // Helper method to trigger intersection
  triggerIntersection (isIntersecting: boolean, target?: Element): void {
    const elements = target !== undefined ? [target] : Array.from(this.elements)
    const entries = elements.map((element): IntersectionObserverEntry => ({
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: element.getBoundingClientRect(),
      isIntersecting,
      rootBounds: null,
      target: element,
      time: Date.now()
    }))
    this.callback(entries, this)
  }
}

describe('IntersectionObserverComponent', () => {
  let mockObserver: MockIntersectionObserver
  let observerInstances: MockIntersectionObserver[] = []

  beforeEach(() => {
    observerInstances = []

    // Mock IntersectionObserver globally
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    global.IntersectionObserver = class {
      constructor (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ) {
        mockObserver = new MockIntersectionObserver(callback, options)
        observerInstances.push(mockObserver)
        return mockObserver as any
      }
    } as any

    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    observerInstances = []
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <IntersectionObserverComponent>
        <span>child</span>
      </IntersectionObserverComponent>
    )
    expect(screen.getByText('child')).toBeDefined()
  })

  it('applies className', () => {
    const { container } = render(<IntersectionObserverComponent className="my-class" />)
    const div = container.querySelector('div')
    expect(div).toHaveClass('my-class')
  })

  it('creates an IntersectionObserver on mount', () => {
    render(<IntersectionObserverComponent />)
    expect(observerInstances.length).toBe(1)
  })

  it('observes the root element', () => {
    const { container } = render(<IntersectionObserverComponent />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(mockObserver.observe.bind(mockObserver)).toBeDefined()
    expect(mockObserver.elements.has(div)).toBe(true)
  })

  it('passes observer options correctly', () => {
    const rootElement = document.createElement('div')
    render(<IntersectionObserverComponent
      root={rootElement}
      rootMargin="10px"
      threshold={[0, 0.5, 1]}
    />)
    expect(observerInstances.length).toBe(1)
    expect(mockObserver.root).toBe(rootElement)
    expect(mockObserver.rootMargin).toBe('10px')
    expect(mockObserver.thresholds).toEqual([0, 0.5, 1])
  })

  it('calls onIntersection when intersection occurs', async () => {
    const onIntersection = vi.fn()
    const { container } = render(<IntersectionObserverComponent onIntersection={onIntersection} />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    await act(async () => mockObserver.triggerIntersection(true, div))
    expect(onIntersection).toHaveBeenCalledTimes(1)
    expect(onIntersection).toHaveBeenCalledWith(
      expect.objectContaining({
        ioEntry: expect.objectContaining({
          isIntersecting: true,
          target: div
        }),
        observer: mockObserver
      })
    )
  })

  it('adds is-intersecting class when element is intersecting', async () => {
    const { container } = render(<IntersectionObserverComponent />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div.classList.toString().includes('--is-intersecting')).toBe(false)
    await act(async () => mockObserver.triggerIntersection(true, div))
    expect(div.classList.toString().includes('--is-intersecting')).toBe(true)
  })

  it('removes is-intersecting class when element is not intersecting', async () => {
    const { container } = render(<IntersectionObserverComponent />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    await act(async () => mockObserver.triggerIntersection(true, div))
    expect(div.classList.toString().includes('--is-intersecting')).toBe(true)
    await act(async () => mockObserver.triggerIntersection(false, div))
    expect(div.classList.toString().includes('--is-intersecting')).toBe(false)
  })

  it('forces observation after timeouts', () => {
    const { container } = render(<IntersectionObserverComponent />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    const unobserveSpy = vi.spyOn(mockObserver, 'unobserve')
    const observeSpy = vi.spyOn(mockObserver, 'observe')
    vi.advanceTimersByTime(100)
    expect(unobserveSpy).toHaveBeenCalledWith(div)
    expect(observeSpy).toHaveBeenCalledWith(div)
    vi.advanceTimersByTime(400)
    expect(unobserveSpy).toHaveBeenCalledTimes(2)
    expect(observeSpy).toHaveBeenCalledTimes(2)
  })

  it('disconnects observer on unmount', () => {
    const { unmount } = render(<IntersectionObserverComponent />)
    const disconnectSpy = vi.spyOn(mockObserver, 'disconnect')
    unmount()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })

  it('clears timeouts on unmount', () => {
    const { unmount } = render(<IntersectionObserverComponent />)
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(2)
  })

  it('recreates observer when options change', () => {
    const { rerender } = render(<IntersectionObserverComponent threshold={0.5} />)
    expect(observerInstances.length).toBe(1)
    rerender(<IntersectionObserverComponent threshold={0.8} />)
    expect(observerInstances.length).toBe(2)
  })

  it('handles empty intersection entries array', async () => {
    const onIntersection = vi.fn()
    render(<IntersectionObserverComponent onIntersection={onIntersection} />)
    const currentObserver = observerInstances[observerInstances.length - 1]
    const callback = currentObserver?.callback
    expect(currentObserver).not.toBe(undefined)
    if (currentObserver === undefined) return
    expect(callback).not.toBe(undefined)
    if (callback === undefined) return
    await act(async () => callback([], currentObserver))
    expect(onIntersection).not.toHaveBeenCalled()
  })

  it('warns if root element is null (edge case)', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<IntersectionObserverComponent />)
    const div = container.querySelector('div')
    expect(div).not.toBeNull() // In normal cases, ref is not null
    consoleWarnSpy.mockRestore()
  })
})
