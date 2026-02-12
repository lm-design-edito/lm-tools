import { describe, it, expect, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { ShadowRootComponent } from './index.js'

// Import the right testing lib depending on the context (react vs. preact)
const { render, cleanup } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

describe('ShadowRootComponent', () => {
  afterEach(() => cleanup())

  it('renders host element', () => {
    const { container } = render(<ShadowRootComponent />)
    const host = container.querySelector('div')
    expect(host).not.toBeNull()
  })

  it('applies className to host element', () => {
    const { container } = render(<ShadowRootComponent className="my-class" />)
    const host = container.querySelector('div')
    expect(host).not.toBeNull()
    if (host === null) return
    expect(host).toHaveClass('my-class')
  })

  it('creates an open shadow root by default', () => {
    const { container } = render(<ShadowRootComponent />)
    const host = container.querySelector('div') as HTMLDivElement | null
    expect(host).not.toBeNull()
    if (host === null) return
    expect(host.shadowRoot).not.toBeNull()
  })

  it('renders children inside the shadow root', () => {
    const { container } = render(<ShadowRootComponent>
      <span>inside</span>
    </ShadowRootComponent>)
    const host = container.querySelector('div') as HTMLDivElement | null
    expect(host).not.toBeNull()
    if (host === null || host.shadowRoot === null) return
    const span = host.shadowRoot.querySelector('span')
    expect(span).not.toBeNull()
    expect(span?.textContent).toBe('inside')
  })

  it('calls onMount with the created shadow root', () => {
    const onMount = vi.fn()
    const { container } = render(<ShadowRootComponent onMount={onMount} />)
    const host = container.querySelector('div') as HTMLDivElement | null
    expect(host).not.toBeNull()
    if (host === null) return
    expect(onMount).toHaveBeenCalledTimes(1)
    expect(onMount).toHaveBeenCalledWith(host.shadowRoot)
  })

  it('injects styles when injectedStyles is provided', () => {
    const { container } = render(<ShadowRootComponent
      injectedStyles="span { color: red; }">
      <span>styled</span>
    </ShadowRootComponent>)
    const host = container.querySelector('div') as HTMLDivElement | null
    expect(host).not.toBeNull()
    if (host === null || host.shadowRoot === null) return
    const styleEl = host.shadowRoot.querySelector('style')
    expect(styleEl).not.toBeNull()
    expect(styleEl?.textContent).toContain('color: red')
  })

  it('assigns adoptedStyleSheets when supported', () => {
    const sheet = new CSSStyleSheet()
    const { container } = render(<ShadowRootComponent adoptedStyleSheets={[sheet]} />)
    const host = container.querySelector('div') as HTMLDivElement | null
    expect(host).not.toBeNull()
    if (host === null || host.shadowRoot === null) return
    if ('adoptedStyleSheets' in host.shadowRoot) expect(
      host.shadowRoot.adoptedStyleSheets
    ).toContain(sheet)
  })
})
