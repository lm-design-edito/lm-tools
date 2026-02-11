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
      <Disclaimer content="message" buttonContent="dismiss">
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
    render(<Disclaimer buttonContent="dismiss" onDismissed={onDismissed} />)
    const btn = screen.getByText('dismiss')
    fireEvent.click(btn)
    expect(onDismissed).toHaveBeenCalledTimes(1)
  })

  it('calls onDismissClick when dismiss button is clicked', () => {
    const onDismissClick = vi.fn()
    render(<Disclaimer buttonContent="dismiss" onDismissClick={onDismissClick} />)
    const btn = screen.getByText('dismiss')
    fireEvent.click(btn)
    expect(onDismissClick).toHaveBeenCalledTimes(1)
  })

  it('respects controlled mode via isOn prop', () => {
    const { container, rerender } = render(
      <Disclaimer buttonContent="dismiss" isOn={false} />
    )
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div?.className).toMatch(/off/)
    rerender(<Disclaimer buttonContent="dismiss" isOn={true} />)
    expect(div.className).toMatch(/on/)
  })

  it('does not render button if buttonContent is falsy', () => {
    render(<Disclaimer />)
    const btn = (screen as Screen).queryByRole<HTMLButtonElement>('button')
    expect(btn).toBeNull()
  })
})
