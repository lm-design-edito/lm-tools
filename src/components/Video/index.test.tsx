import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { Video } from './index.js'

const { render, cleanup } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

describe('Video', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders video element', () => {
    const { container } = render(<Video sources="video.mp4" />)
    const video = container.querySelector('video')
    expect(video).not.toBe(null)
  })

  it('applies className prop', () => {
    const { container } = render(<Video className="my-class" sources="video.mp4" />)
    expect(container.firstChild).toHaveClass('my-class')
  })

  it('renders multiple sources', () => {
    const sources = [
      { src: 'video1.mp4', type: 'video/mp4' },
      { src: 'video2.webm', type: 'video/webm' }
    ]
    const { container } = render(<Video sources={sources} />)
    const sourceEls = container.querySelectorAll('source')
    expect(sourceEls.length).toBe(2)
    expect(sourceEls[0]).toHaveAttribute('src', 'video1.mp4')
    expect(sourceEls[1]).toHaveAttribute('src', 'video2.webm')
  })

  it('renders tracks', () => {
    const tracks = [
      { src: 'subs-fr.vtt', srclang: 'fr', label: 'Français', default: true },
      { src: 'subs-en.vtt', label: 'English' }
    ]
    const { container } = render(<Video sources="video.mp4" tracks={tracks} />)
    const trackEls = container.querySelectorAll('track')
    expect(trackEls.length).toBe(2)
    expect(trackEls[0]).toHaveAttribute('src', 'subs-fr.vtt')
    expect(trackEls[1]).toHaveAttribute('src', 'subs-en.vtt')
  })

  it('calls play and pause handlers', () => {
    const { container } = render(<Video sources="video.mp4" />)
    const video = container.querySelector('video')
    const playBtn = container.querySelector('button[class*="play-btn"]')
    const pauseBtn = container.querySelector('button[class*="pause-btn"]')
    if (video === null || video === undefined || playBtn === undefined || pauseBtn === undefined) throw new Error('Missing elements')
    const playMock = vi.fn()
    const pauseMock = vi.fn()
    Object.defineProperty(video, 'play', { value: playMock, writable: true })
    Object.defineProperty(video, 'pause', { value: pauseMock, writable: true })
    playBtn.click()
    expect(playMock).toHaveBeenCalled()
    pauseBtn.click()
    expect(pauseMock).toHaveBeenCalled()
  })

  it('shows formatted elapsed and total time', () => {
    const { container } = render(<Video sources="video.mp4" />)
    const elapsed = container.querySelector('[class*="elapsed-time"]')
    const total = container.querySelector('[class*="total-time"]')
    expect(elapsed).not.toBe(null)
    expect(total).not.toBe(null)
  })
})
