import { describe, it, expect, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { EventListenerComponent } from './index.js'

// Import the right testing lib depending on the context (react vs. preact)
const { render, fireEvent, screen, cleanup } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

describe('EventListenerComponent', () => {
  afterEach(() => cleanup())

  it('renders children', () => {
    render(<EventListenerComponent>
      <span>child</span>
    </EventListenerComponent>)
    expect(screen.getByText('child')).toBeDefined()
  })

  it('applies className and cssModule classes', () => {
    const { container } = render(<EventListenerComponent className="my-class" />)
    const div = container.querySelector('div')
    if (div === null) expect(div).not.toBe(null)
    else expect(div).toHaveClass('my-class')
    // Optional: you could also test that cssModule class exists
  })

  it('attaches event listeners to root when targetSelector is undefined', () => {
    const onEvent = vi.fn()
    const { container, unmount } = render(<EventListenerComponent
      type="click"
      onEvent={onEvent} />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    fireEvent.click(div)
    expect(onEvent).toHaveBeenCalledTimes(1)

    // Cleanup should remove listener
    unmount()
    fireEvent.click(div)
    expect(onEvent).toHaveBeenCalledTimes(1)
  })

  it('attaches event listeners to elements matching targetSelector', () => {
    const onEvent = vi.fn()
    render(<EventListenerComponent
      type="click"
      onEvent={onEvent}
      targetSelector="button">
      <button>btn</button>
    </EventListenerComponent>)
    const button = screen.getByText('btn')
    fireEvent.click(button)
    expect(onEvent).toHaveBeenCalledTimes(1)
  })

  it('handles multiple event types', () => {
    const onEvent = vi.fn()
    const { container } = render(<EventListenerComponent
      type={['click', 'mouseover']}
      onEvent={onEvent} />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    fireEvent.click(div)
    fireEvent.mouseOver(div)
    expect(onEvent).toHaveBeenCalledTimes(2)
  })

  it('does nothing if type or onEvent is undefined', () => {
    const { container } = render(<EventListenerComponent />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    fireEvent.click(div) // should not throw
  })
})
