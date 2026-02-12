import { describe, it, expect, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import type { Screen } from '@testing-library/react'
import { Drawer } from './index.js'

// Mock ResizeObserverComponent
vi.mock('../ResizeObserver/index.js', () => ({
  ResizeObserverComponent: ({ children }: any) => {
    return <>{children}</>
  }
}))

// Import the right testing lib depending on the context (react vs. preact)
const { render, fireEvent, screen, cleanup, act } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

describe('Drawer', () => {
  afterEach(() => cleanup())

  it('renders children, opener and closer content', () => {
    render(<Drawer
      openerContent='open'
      closerContent='close'>
      <span>child</span>
    </Drawer>)
    expect(screen.getByText('open')).toBeDefined()
    expect(screen.getByText('close')).toBeDefined()
    expect(screen.getByText('child')).toBeDefined()
  })

  it('applies className and modifier classes based on state', () => {
    const { container } = render(<Drawer className='my-class' />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div).toHaveClass('my-class')
    expect(div.className).toMatch(/opened|closed/)
  })

  it('is closed by default in uncontrolled mode', () => {
    const { container } = render(<Drawer />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div.className).toMatch(/closed/)
  })

  it('respects initialIsOpened in uncontrolled mode', () => {
    const { container } = render(<Drawer initialIsOpened />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div.className).toMatch(/opened/)
  })

  it('opens when opener is clicked in uncontrolled mode', () => {
    const onToggle = vi.fn()
    const { container } = render(<Drawer
      openerContent='open'
      onToggle={onToggle} />)
    const opener = screen.getByText('open')
    fireEvent.click(opener)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div.className).toMatch(/opened/)
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('closes when closer is clicked in uncontrolled mode', () => {
    const onToggle = vi.fn()
    const { container } = render(<Drawer
      initialIsOpened
      closerContent='close'
      onToggle={onToggle} />)
    const closer = screen.getByText('close')
    fireEvent.click(closer)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div.className).toMatch(/closed/)
    expect(onToggle).toHaveBeenCalledWith(false)
  })

  it('respects controlled mode via isOpened prop', () => {
    const { container, rerender } = render(<Drawer
      isOpened={false}
      openerContent='open' />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div.className).toMatch(/closed/)
    rerender(<Drawer
      isOpened={true}
      openerContent='open' />)
    expect(div.className).toMatch(/opened/)
  })

  it('does not toggle internally in controlled mode', () => {
    const onToggle = vi.fn()
    const { container } = render(<Drawer
      isOpened={false}
      openerContent='open'
      onToggle={onToggle} />)
    const opener = screen.getByText('open')
    fireEvent.click(opener)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    // Still closed because controlled
    expect(div.className).toMatch(/closed/)
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('does not render opener or closer if content is falsy', () => {
    render(<Drawer />)
    const opener = (screen as Screen).queryByText('open')
    const closer = (screen as Screen).queryByText('close')
    expect(opener).toBeNull()
    expect(closer).toBeNull()
  })
})
