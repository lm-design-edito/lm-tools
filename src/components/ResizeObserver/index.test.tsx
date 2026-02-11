import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { ResizeObserverComponent } from './index.js'

// Import the right testing lib depending on the context (react vs. preact)
const { render, screen, cleanup, act } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

// --- Move mocks to outer scope so all tests can access ---
class ResizeObserverEntryMock implements ResizeObserverEntry {
  readonly contentRect: DOMRectReadOnly
  readonly target: Element
  readonly borderBoxSize: ReadonlyArray<ResizeObserverSize> = []
  readonly contentBoxSize: ReadonlyArray<ResizeObserverSize> = []
  readonly devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize> = []

  constructor(target: Element, width: number, height: number) {
    this.target = target
    this.contentRect = new DOMRectReadOnly(0, 0, width, height)
  }
}

describe('ResizeObserverComponent', () => {
  let observerInstance: any = null

  beforeEach(() => {
    class ResizeObserverMock {
      callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        observerInstance = this
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    // @ts-ignore
    global.ResizeObserver = ResizeObserverMock
  })

  afterEach(() => {
    cleanup()
    observerInstance = null
    // @ts-ignore
    delete global.ResizeObserver
  })

  it('renders children', () => {
    render(
      <ResizeObserverComponent>
        <span>child</span>
      </ResizeObserverComponent>
    )
    expect(screen.getByText('child')).toBeDefined()
  })

  it('applies className and cssModule classes', () => {
    const { container } = render(<ResizeObserverComponent className="my-class" />)
    const div = container.querySelector('div')
    expect(div).not.toBeNull()
    expect(div).toHaveClass('my-class')
  })

  it('calls onResize when children change size', () => {
    const onResize = vi.fn()
    render(
      <ResizeObserverComponent onResize={onResize}>
        <div style={{ width: 100, height: 50 }} />
      </ResizeObserverComponent>
    )
    // Trigger manual resize callback
    act(() => {
      observerInstance.callback?.([
        {
          contentRect: {
            width: 120,
            height: 60,
            top: 0,
            left: 0,
            bottom: 60,
            right: 120,
            x: 0,
            y: 0
          }
        } as any
      ])
    })
    expect(onResize).toHaveBeenCalled()
  })

  it('sets data attributes and CSS custom properties', () => {
    const { container } = render(
      <ResizeObserverComponent>
        <div />
      </ResizeObserverComponent>
    )
    const div = container.querySelector('div')
    expect(div).not.toBeNull()

    // Trigger manual resize callback
    act(() => {
      observerInstance.callback?.([
        new ResizeObserverEntryMock(div!, 100, 50) as any
      ])
    })

    // Check presence of data attributes
    expect(div).toHaveAttribute('data-width', '100')
    expect(div).toHaveAttribute('data-height', '50')

    // Check presence of CSS custom properties
    const style = div!.style
    expect(style.getPropertyValue('--resize-observer-width')).toBe('100')
    expect(style.getPropertyValue('--resize-observer-height')).toBe('50')
    expect(style.getPropertyValue('--resize-observer-width-px')).toBe('100px')
    expect(style.getPropertyValue('--resize-observer-height-px')).toBe('50px')
  })
})
