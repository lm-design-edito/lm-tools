import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { Subtitles } from './index.js'

// Import the right testing lib depending on the context (react vs. preact)
const { render, screen, cleanup, waitFor } = await (async () => {
  const { RENDERER } = process.env
  if (RENDERER === 'preact') return await import('@testing-library/preact')
  return await import('@testing-library/react')
})()

describe('Subtitles', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders empty div when no timecode is provided', () => {
    const { container } = render(<Subtitles />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    expect(div?.textContent).toBe('')
  })

  it('applies className prop', () => {
    const { container } = render(<Subtitles className='my-class' />)
    const div = container.querySelector('div')
    expect(div).not.toBe(null)
    if (div === null) return
    expect(div).toHaveClass('my-class')
  })

  it('parses subtitles when srtFileContent is provided', () => {
    const mockSubs = '1\n00:00:00,000 --> 00:00:02,000\nFirst subtitle\n\n2\n00:00:02,000 --> 00:00:04,000\nSecond subtitle'
    const { container } = render(<Subtitles srtFileContent={mockSubs} timecodeMs={1000} />)
    const currSub = container.querySelector('[class*="sub--curr"]')
    expect(currSub?.textContent).toContain('First subtitle')
    expect(currSub?.textContent).not.toContain('Second subtitle')
  })

  it('parses and displays correct subtitle from srtFileContent when timecode changes', () => {
    const mockSubs = '1\n00:00:00,000 --> 00:00:02,000\nFirst subtitle\n\n2\n00:00:02,000 --> 00:00:04,000\nSecond subtitle'
    const { rerender, container } = render(<Subtitles srtFileContent={mockSubs} timecodeMs={1000} />)
    let currSub = container.querySelector('[class*="sub--curr"]')
    expect(currSub?.textContent).toContain('First subtitle')
    expect(currSub?.textContent).not.toContain('Second subtitle')
    rerender(<Subtitles srtFileContent={mockSubs} timecodeMs={3000} />)

    currSub = container.querySelector('[class*="sub--curr"]')
    expect(currSub?.textContent).toContain('Second subtitle')
    expect(currSub?.textContent).not.toContain('First subtitle')
  })

  it('fetches and parses subtitles when src is provided', async () => {
    const mockSubs = '1\n00:00:00,000 --> 00:00:02,000\nFirst subtitle\n\n2\n00:00:02,000 --> 00:00:04,000\nSecond subtitle'

    const onSubsLoad = vi.fn()
    ;(global.fetch as any).mockResolvedValueOnce({
      text: async () => await Promise.resolve(mockSubs)
    })

    render(<Subtitles
      src='/path/to/subs.srt'
      onSubsLoad={onSubsLoad}
      timecodeMs={1000} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/path/to/subs.srt')
      expect(onSubsLoad).toHaveBeenCalledWith(mockSubs)
    })
  })

  it('calls onSubsError when fetch fails', async () => {
    const onSubsError = vi.fn()
    const mockError = new Error('Fetch failed')
    ;(global.fetch as any).mockRejectedValueOnce(mockError)

    render(<Subtitles
      src='/path/to/subs.srt'
      onSubsError={onSubsError} />)

    await waitFor(() => {
      expect(onSubsError).toHaveBeenCalled()
    })
  })

  it('displays subtitles based on timecode', async () => {
    const mockSubs = `1
00:00:00,000 --> 00:00:02,000
First subtitle

2
00:00:02,000 --> 00:00:04,000
Second subtitle`

    ;(global.fetch as any).mockResolvedValueOnce({
      text: async () => await Promise.resolve(mockSubs)
    })

    const { rerender } = render(<Subtitles
      src='/path/to/subs.srt'
      timecodeMs={1000} />)

    await waitFor(() => {
      expect(screen.getByText(/First subtitle/)).toBeDefined()
    })

    rerender(<Subtitles
      src='/path/to/subs.srt'
      timecodeMs={3000} />)

    await waitFor(() => {
      expect(screen.getByText(/Second subtitle/)).toBeDefined()
    })
  })

  it('groups subtitles when subsGroups is provided', async () => {
    const mockSubs = `1
00:00:00,000 --> 00:00:02,000
First subtitle

2
00:00:02,000 --> 00:00:04,000
Second subtitle

3
00:00:04,000 --> 00:00:06,000
Third subtitle`

    ;(global.fetch as any).mockResolvedValueOnce({
      text: async () => await Promise.resolve(mockSubs)
    })

    const { container } = render(<Subtitles
      src='/path/to/subs.srt'
      subsGroups={[2]}
      timecodeMs={1000} />)

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const groups = container.querySelectorAll('div > div')
      expect(groups.length).toBeGreaterThan(0)
    })
  })

  it('marks subtitles as prev when they have been read', async () => {
    const mockSubs = `1
00:00:00,000 --> 00:00:02,000
First subtitle

2
00:00:02,000 --> 00:00:04,000
Second subtitle`

    ;(global.fetch as any).mockResolvedValueOnce({
      text: async () => await Promise.resolve(mockSubs)
    })

    const { container } = render(<Subtitles
      src='/path/to/subs.srt'
      timecodeMs={5000} />)

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const prevSubs = container.querySelectorAll('[class*="prev"]')
      expect(prevSubs.length).toBeGreaterThan(0)
    })
  })

  it('marks current subtitle based on timecode', async () => {
    const mockSubs = `1
00:00:00,000 --> 00:00:02,000
First subtitle

2
00:00:02,000 --> 00:00:04,000
Second subtitle`

    ;(global.fetch as any).mockResolvedValueOnce({
      text: async () => await Promise.resolve(mockSubs)
    })

    const { container } = render(<Subtitles
      src='/path/to/subs.srt'
      timecodeMs={1000} />)

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const currSub = container.querySelector('[class*="curr"]')
      expect(currSub).not.toBe(null)
    })
  })

  it('handles isEnded prop correctly', async () => {
    const mockSubs = `1
00:00:00,000 --> 00:00:02,000
First subtitle`

    ;(global.fetch as any).mockResolvedValueOnce({
      text: async () => await Promise.resolve(mockSubs)
    })

    const { container } = render(<Subtitles
      src='/path/to/subs.srt'
      subsGroups={[1]}
      timecodeMs={1000}
      isEnded={true} />)

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const currGroup = container.querySelector('[class*="curr"]')
      expect(currGroup).not.toBe(null)
    })
  })

  it('does not fetch when src is undefined', () => {
    render(<Subtitles timecodeMs={1000} />)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('re-fetches when src changes', async () => {
    const mockSubs1 = `1
00:00:00,000 --> 00:00:02,000
First subtitle`

    const mockSubs2 = `1
00:00:00,000 --> 00:00:02,000
Different subtitle`

    ;(global.fetch as any)
      .mockResolvedValueOnce({ text: async () => await Promise.resolve(mockSubs1) })
      .mockResolvedValueOnce({ text: async () => await Promise.resolve(mockSubs2) })

    const { rerender } = render(<Subtitles
      src='/path/to/subs1.srt'
      timecodeMs={1000} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/path/to/subs1.srt')
    })

    rerender(<Subtitles
      src='/path/to/subs2.srt'
      timecodeMs={1000} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/path/to/subs2.srt')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
