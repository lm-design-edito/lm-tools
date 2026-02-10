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

  it('renders children and content', () => {
    render(
      <EventListenerComponent
        content="content">
        <span>child</span>
      </EventListenerComponent>
    )
    expect(screen.getByText('child')).toBeDefined()
    expect(screen.getByText('content')).toBeDefined()
  })

  it('applies className and cssModule classes', () => {
    const { container } = render(<EventListenerComponent className="my-class" />)
    const span = container.querySelector('span')
    if (span === null) expect(span).not.toBe(null)
    else expect(span).toHaveClass('my-class')
    // Optional: you could also test that cssModule class exists
  })

  it('attaches event listeners to root when targetSelector is undefined', () => {
    const onEvent = vi.fn()
    const { container, unmount } = render(
      <EventListenerComponent
        type="click"
        onEvent={onEvent} />
    )
    const span = container.querySelector('span')
    expect(span).not.toBe(null)
    if (span === null) return
    fireEvent.click(span)
    expect(onEvent).toHaveBeenCalledTimes(1)

    // Cleanup should remove listener
    unmount()
    fireEvent.click(span)
    expect(onEvent).toHaveBeenCalledTimes(1)
  })

  it('attaches event listeners to elements matching targetSelector', () => {
    const onEvent = vi.fn()
    render(
      <EventListenerComponent
        type="click"
        onEvent={onEvent}
        targetSelector="button">
        <button>btn</button>
      </EventListenerComponent>
    )
    const button = screen.getByText('btn')
    fireEvent.click(button)
    expect(onEvent).toHaveBeenCalledTimes(1)
  })

  it('handles multiple event types', () => {
    const onEvent = vi.fn()
    const { container } = render(
      <EventListenerComponent
        type={['click', 'mouseover']}
        onEvent={onEvent} />
    )
    const span = container.querySelector('span')
    expect(span).not.toBe(null)
    if (span === null) return
    fireEvent.click(span)
    fireEvent.mouseOver(span)
    expect(onEvent).toHaveBeenCalledTimes(2)
  })

  it('does nothing if type or onEvent is undefined', () => {
    const { container } = render(<EventListenerComponent />)
    const span = container.querySelector('span')
    expect(span).not.toBe(null)
    if (span === null) return
    fireEvent.click(span) // should not throw
  })
})
