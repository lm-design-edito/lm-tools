import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { ResizeObserverComponent } from './index.js'

// Import the right testing lib depending on the context (react vs. preact)
const { render, screen, cleanup, act } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

class ResizeObserverEntryMock implements ResizeObserverEntry {
  readonly contentRect: DOMRectReadOnly
  readonly target: Element
  readonly borderBoxSize: readonly ResizeObserverSize[] = []
  readonly contentBoxSize: readonly ResizeObserverSize[] = []
  readonly devicePixelContentBoxSize: readonly ResizeObserverSize[] = []

  constructor (target: Element, width: number, height: number) {
    this.target = target
    this.contentRect = new DOMRectReadOnly(0, 0, width, height)
  }
}

let observerInstance: ResizeObserverMock | null = null

class ResizeObserverMock {
  callback: ResizeObserverCallback
  constructor (callback: ResizeObserverCallback) {
    this.callback = callback
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    observerInstance = this
  }

  observe (): void {}

  unobserve (): void {}

  disconnect (): void {}
}

describe('ResizeObserverComponent', () => {
  beforeEach(() => { global.ResizeObserver = ResizeObserverMock })

  afterEach((): void => {
    cleanup()
    observerInstance = null

    // @ts-expect-error The operand of a 'delete' operator must be optional.
    delete global.ResizeObserver
  })

  it('renders children', () => {
    render(<ResizeObserverComponent>
      <span>child</span>
    </ResizeObserverComponent>)
    expect(screen.getByText('child')).toBeDefined()
  })

  it('applies className and cssModule classes', () => {
    const { container } = render(<ResizeObserverComponent className="my-class" />)
    const div = container.querySelector('div')
    expect(div).not.toBeNull()
    expect(div).toHaveClass('my-class')
  })

  it('calls onResize when children change size', async () => {
    const onResize = vi.fn()
    render(<ResizeObserverComponent
      onResize={onResize}>
      <div style={{ width: 100, height: 50 }} />
    </ResizeObserverComponent>)
    // Trigger manual resize callback
    await act(() => {
      const entry: any = {
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
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      observerInstance?.callback?.([entry], observerInstance)
    })
    expect(onResize).toHaveBeenCalled()
  })

  it('sets data attributes and CSS custom properties', async () => {
    const { container } = render(<ResizeObserverComponent>
      <div />
    </ResizeObserverComponent>)
    const div = container.querySelector('div')
    expect(div).not.toBeNull()

    // Trigger manual resize callback
    await act(() => {
      if (div === null) return
      observerInstance?.callback?.([
        new ResizeObserverEntryMock(div, 100, 50)
      ], observerInstance)
    })

    // Check presence of data attributes
    expect(div).toHaveAttribute('data-width', '100')
    expect(div).toHaveAttribute('data-height', '50')

    // Check presence of CSS custom properties
    const style = div?.style
    expect(style?.getPropertyValue('--dsed-resize-observer-width')).toBe('100')
    expect(style?.getPropertyValue('--dsed-resize-observer-height')).toBe('50')
    expect(style?.getPropertyValue('--dsed-resize-observer-width-px')).toBe('100px')
    expect(style?.getPropertyValue('--dsed-resize-observer-height-px')).toBe('50px')
  })
})
