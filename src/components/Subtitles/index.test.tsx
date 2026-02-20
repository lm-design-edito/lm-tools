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

  it('fetches and parses subtitles when subsSrc is provided', async () => {
    const mockSubs = `1
00:00:00,000 --> 00:00:02,000
First subtitle

2
00:00:02,000 --> 00:00:04,000
Second subtitle`

    const onSubsLoad = vi.fn()
    ;(global.fetch as any).mockResolvedValueOnce({
      text: async () => await Promise.resolve(mockSubs)
    })

    render(<Subtitles
      subsSrc='/path/to/subs.srt'
      onSubsLoad={onSubsLoad}
      timecodeInMs={1000} />)

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
      subsSrc='/path/to/subs.srt'
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
      subsSrc='/path/to/subs.srt'
      timecodeInMs={1000} />)

    await waitFor(() => {
      expect(screen.getByText(/First subtitle/)).toBeDefined()
    })

    rerender(<Subtitles
      subsSrc='/path/to/subs.srt'
      timecodeInMs={3000} />)

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
      subsSrc='/path/to/subs.srt'
      subsGroups={[2]}
      timecodeInMs={1000} />)

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const groups = container.querySelectorAll('div > div')
      expect(groups.length).toBeGreaterThan(0)
    })
  })

  it('marks subtitles as pronounced when they have been read', async () => {
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
      subsSrc='/path/to/subs.srt'
      timecodeInMs={5000} />)

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const pronouncedSubs = container.querySelectorAll('[class*="pronounced"]')
      expect(pronouncedSubs.length).toBeGreaterThan(0)
    })
  })

  it('marks active subtitle based on timecode', async () => {
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
      subsSrc='/path/to/subs.srt'
      timecodeInMs={1000} />)

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const activeSub = container.querySelector('[class*="active"]')
      expect(activeSub).not.toBe(null)
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
      subsSrc='/path/to/subs.srt'
      subsGroups={[1]}
      timecodeInMs={1000}
      isEnded={true} />)

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const activeGroup = container.querySelector('[class*="active"]')
      expect(activeGroup).not.toBe(null)
    })
  })

  it('does not fetch when subsSrc is undefined', () => {
    render(<Subtitles timecodeInMs={1000} />)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('re-fetches when subsSrc changes', async () => {
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
      subsSrc='/path/to/subs1.srt'
      timecodeInMs={1000} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/path/to/subs1.srt')
    })

    rerender(<Subtitles
      subsSrc='/path/to/subs2.srt'
      timecodeInMs={1000} />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/path/to/subs2.srt')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
