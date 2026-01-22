import { describe, it, expect, vi } from 'vitest'
import {
  create,
  type Fetcher,
  type Processor
} from './index.js'

describe('create', () => {
  it('creates crawler with crawl, push, and flush methods', () => {
    const crawler = create({
      limit: 10,
      fetcher: async () => 'content',
      processor: async () => {}
    })
    expect(crawler).toHaveProperty('crawl')
    expect(crawler).toHaveProperty('push')
    expect(crawler).toHaveProperty('flush')
  })

  it('processes URLs up to the limit', async () => {
    const spyFunc = vi.fn(() => 0)
    const fetcher: Fetcher<string> = async url => {
      spyFunc()
      return 'content'
    }
    const processor: Processor<string> = (_u, _c, { push }) => push('new-url')
    const crawler = create({ limit: 2, fetcher, processor })
    await crawler.crawl('init-url')
    expect(spyFunc).toHaveBeenCalledTimes(2)
  })

  it('allows processor to push new URLs', async () => {
    const fetcher: Fetcher<string> = async (url: string) => `content-${url}`
    const sypFunc = vi.fn(() => 0)
    const processor: Processor<string> = async (url, _c, hooks) => {
      sypFunc()
      if (url === 'url1') hooks.push('url2', 'url3')
    }
    const crawler = create({ limit: 10, fetcher, processor })
    await crawler.crawl('url1')
    expect(sypFunc).toHaveBeenCalledTimes(3)
  })

  it('respects delay when provided', async () => {
    const fetcher = vi.fn(async (url: string) => `content-${url}`)
    const processor = vi.fn(async () => {})
    const startTime = Date.now()
    const crawler = create({ limit: 2, delayMs: 20, fetcher, processor })
    await crawler.crawl('url1')
    const elapsed = Date.now() - startTime
    expect(elapsed).toBeGreaterThanOrEqual(20)
  })

  it('calls logger when provided', async () => {
    const fetcher = vi.fn(async (url: string) => `content-${url}`)
    const processor = vi.fn(async () => {})
    const logger = vi.fn()
    const crawler = create({
      limit: 2,
      fetcher,
      processor,
      logger
    })
    await crawler.crawl('url1')
    expect(logger).toHaveBeenCalled()
  })

  it('allows flushing the waitlist', async () => {
    const fetcher = vi.fn(async (url: string) => `content-${url}`)
    const processor = vi.fn(async (_u: string, _c: string, hooks: any) => {
      hooks.push('url2', 'url3')
      hooks.flush()
    })
    const crawler = create({ limit: 10, fetcher, processor })
    await crawler.crawl('url1')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
