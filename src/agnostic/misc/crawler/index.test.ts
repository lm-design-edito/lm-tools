import { describe, it, expect, vi } from 'vitest'
import { create } from './index.js'

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
    const fetcher = vi.fn(async (url: string) => `content-${url}`)
    const processor = vi.fn(async () => {})
    
    const crawler = create({
      limit: 2,
      fetcher,
      processor
    })
    
    await crawler.crawl('url1')
    
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(processor).toHaveBeenCalledTimes(2)
  })

  it('does not process duplicate URLs', async () => {
    const fetcher = vi.fn(async (url: string) => `content-${url}`)
    const processor = vi.fn(async () => {})
    
    const crawler = create({
      limit: 10,
      fetcher,
      processor
    })
    
    await crawler.crawl('url1')
    await crawler.crawl('url1')
    
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(processor).toHaveBeenCalledTimes(1)
  })

  it('allows processor to push new URLs', async () => {
    const fetcher = vi.fn(async (url: string) => `content-${url}`)
    const processor = vi.fn(async (url: string, content: string, hooks: any) => {
      if (url === 'url1') hooks.push('url2', 'url3')
    })
    
    const crawler = create({
      limit: 10,
      fetcher,
      processor
    })
    
    await crawler.crawl('url1')
    
    expect(fetcher).toHaveBeenCalledTimes(3)
  })

  it('respects delay when provided', async () => {
    const fetcher = vi.fn(async (url: string) => `content-${url}`)
    const processor = vi.fn(async () => {})
    const startTime = Date.now()
    
    const crawler = create({
      limit: 2,
      delayMs: 10,
      fetcher,
      processor
    })
    
    await crawler.crawl('url1')
    const elapsed = Date.now() - startTime
    
    expect(elapsed).toBeGreaterThanOrEqual(10)
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
    const processor = vi.fn(async (url: string, content: string, hooks: any) => {
      hooks.push('url2', 'url3')
      hooks.flush()
    })
    
    const crawler = create({
      limit: 10,
      fetcher,
      processor
    })
    
    await crawler.crawl('url1')
    
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
