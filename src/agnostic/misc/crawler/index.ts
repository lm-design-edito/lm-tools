import { wait } from '../../time/wait/index.js'

/**
 * Function that fetches content from a URL asynchronously.
 *
 * @template T - The type of content returned by the fetcher.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<T>} A promise resolving to the fetched content.
 */
export type Fetcher<T> = (url: string) => Promise<T>

/**
 * Function that processes fetched content for a given URL.
 *
 * @template T - The type of content provided by the fetcher.
 * @param {string} url - The URL of the content being processed.
 * @param {T} content - The content fetched from the URL.
 * @param {object} hooks - Hooks for accessing crawler state and controlling the crawl.
 * @param {(...urls: string[]) => void} hooks.push - Enqueue one or more URLs to be crawled.
 * @param {() => void} hooks.flush - Clear the waitlist of pending URLs.
 * @param {Set<string>} hooks.processed - Read-only snapshot of URLs already processed.
 * @param {string[]} hooks.waitlist - Read-only snapshot of the current waitlist of URLs.
 * @returns {any} The result of processing (ignored by the crawler).
 */
export type Processor<T> = (
  url: string,
  content: T,
  hooks: {
    push: (...urls: string[]) => void
    flush: () => void
    processed: Set<string>
    waitlist: string[]
  }
) => any

/**
 * Configuration options for the crawler.
 *
 * @template T - The type of content returned by the fetcher.
 */
export type Options<T extends any> = {
  /** Maximum number of URLs to process. */
  limit: number
  /** Optional delay between processing URLs, in milliseconds, or a function returning the delay. */
  delayMs?: number | (() => number)
  /** Optional, allows fetching and processing a URL that has already been seen. */
  allowDuplicates?: boolean
  /** Function that fetches content for each URL. */
  fetcher: Fetcher<T>
  /** Function that processes fetched content. */
  processor: Processor<T>
}

/**
 * Crawler instance with methods to start crawling, enqueue URLs, and inspect crawler state.
 */
export type Crawler = {
  /** Start crawling from the given URL. */
  crawl: (startUrl: string) => Promise<void>
  /** Enqueue one or more URLs to be crawled. */
  push: (...urls: string[]) => void
  /** Clear the waitlist of pending URLs. */
  flush: () => void
  /** Set of URLs that have been processed (mutable - use with caution). */
  processed: Set<string>
  /** Array of URLs waiting to be processed (mutable - use with caution). */
  waitlist: string[]
}

/**
 * Creates a sequential crawler with optional delay.
 *
 * @template T - The type of content returned by the fetcher.
 * @param {Options<T>} options - Crawler configuration options.
 * @param {number} options.limit - Maximum number of URLs to process.
 * @param {number | (() => number)} [options.delayMs] - Optional delay between processing URLs, in milliseconds, or a function returning the delay.
 * @param {boolean} [options.allowDuplicates] - Optional, allows fetching and processing a URL that has already been seen.
 * @param {Fetcher<T>} options.fetcher - Function that fetches content for each URL.
 * @param {Processor<T>} options.processor - Function that processes fetched content.
 * @returns {Crawler} An object with methods to start crawling, enqueue URLs, flush the waitlist, and access crawler state.
 * 
 * @example
 * ```typescript
 * const crawler = create({
 *   limit: 100,
 *   delayMs: 1000,
 *   fetcher: async (url) => fetch(url).then(r => r.text()),
 *   processor: (url, content, { push, processed, waitlist }) => {
 *     console.log(`Processed ${url}`);
 *     console.log(`Remaining: ${waitlist.length}, Done: ${processed.size}`);
 *     // Optionally push more URLs
 *   }
 * });
 * 
 * await crawler.crawl('https://example.com');
 * console.log('Total processed:', crawler.processed.size);
 * ```
 */
export function create<T extends any> (options: Options<T>): Crawler {
  let ops = 0
  const waitlist: string[] = []
  const push = (...urls: string[]) => waitlist.push(...urls)
  const flush = () => { waitlist.length = 0 }
  const processed = new Set<string>()
  const crawl = async (startUrl: string) => {
    push(startUrl)
    while (waitlist.length > 0 && ops < options.limit) {
      ops++
      const currentUrl = waitlist[0]!
      if (!processed.has(currentUrl) || options.allowDuplicates === true) {
        const content = await options.fetcher(currentUrl)
        await options.processor(currentUrl, content, {
          push,
          flush,
          processed: new Set(processed),
          waitlist: [...waitlist]
        })
      }
      waitlist.shift()
      processed.add(currentUrl)
      const delayMs = typeof options.delayMs === 'function'
        ? options.delayMs()
        : typeof options.delayMs === 'number'
          ? options.delayMs
          : 0
      if (delayMs !== 0) await wait(delayMs)
    }
  }
  return {
    crawl,
    push,
    flush,
    processed,
    waitlist
  }
}
