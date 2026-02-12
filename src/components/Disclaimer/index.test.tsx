import { describe, it, expect, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import type { Screen } from '@testing-library/react'
import { Disclaimer } from './index.js'

// Import the right testing lib depending on the context (react vs. preact)
const { render, fireEvent, screen, cleanup } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

describe('Disclaimer', () => {
  afterEach(() => cleanup())

  it('renders children and content', () => {
    render(
      <Disclaimer content="message" togglerContent="dismiss">
        <span>child</span>
      </Disclaimer>
    )
    expect(screen.getByText('message')).toBeDefined()
    expect(screen.getByText('dismiss')).toBeDefined()
    expect(screen.getByText('child')).toBeDefined()
  })

  it('applies className and modifier classes based on visibility', () => {
    const { container } = render(<Disclaimer className="my-class" />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div).toHaveClass('my-class')
    expect(div.className).toMatch(/on|off/)
  })

  it('toggles visibility when dismiss button is clicked in uncontrolled mode', () => {
    const onDismissed = vi.fn()
    render(<Disclaimer togglerContent="dismiss" onDismissed={onDismissed} />)
    const btn = screen.getByText('dismiss')
    fireEvent.click(btn)
    expect(onDismissed).toHaveBeenCalledTimes(1)
  })

  it('respects controlled mode via isOn prop', () => {
    const { container, rerender } = render(
      <Disclaimer togglerContent="dismiss" isOn={false} />
    )
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div?.className).toMatch(/off/)
    rerender(<Disclaimer togglerContent="dismiss" isOn={true} />)
    expect(div.className).toMatch(/on/)
  })

  it('does not render button if togglerContent is falsy', () => {
    render(<Disclaimer />)
    const btn = (screen as Screen).queryByRole<HTMLButtonElement>('button')
    expect(btn).toBeNull()
  })
})
