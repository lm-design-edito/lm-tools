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
 * @param {{ push: (...urls: string[]) => void, flush: () => void }} hooks - Hooks for dynamically enqueuing or clearing URLs.
 * @returns {any} The result of processing (ignored by the crawler).
 */
export type Processor<T> = (
  url: string,
  content: T,
  hooks: {
    push: (...urls: string[]) => void,
    flush: () => void
  }
) => any

/**
 * Optional logging function called during crawling.
 *
 * @param {number} ops - Number of processed URLs so far.
 * @param {string} url - The URL currently being processed.
 * @param {string[]} waitlist - The current waitlist of URLs.
 * @param {Set<string>} processed - Set of URLs already processed.
 */
export type Logger = (
  ops: number,
  url: string,
  waitlist: string[],
  processed: Set<string>
) => void

/**
 * Configuration options for the crawler.
 *
 * @template T - The type of content returned by the fetcher.
 * @property {number} limit - Maximum number of URLs to process.
 * @property {number | (() => number)} [delayMs] - Optional delay between processing URLs, in milliseconds, or a function returning the delay.
 * @property {Fetcher<T>} fetcher - Function that fetches content for each URL.
 * @property {Processor<T>} processor - Function that processes fetched content.
 * @property {Logger} [logger] - Optional function for logging crawl progress.
 */
export type Options<T extends any> = {
  limit: number
  delayMs?: number | (() => number)
  fetcher: Fetcher<T>
  processor: Processor<T>
  logger?: Logger
}

/**
 * Creates a sequential crawler with optional logging and delay.
 *
 * @template T - The type of content returned by the fetcher.
 * @param {Options<T>} options - Crawler configuration options.
 * @returns {{
 *   crawl: (startUrl: string) => Promise<void>,
 *   push: (...urls: string[]) => void,
 *   flush: () => void
 * }} An object with methods to start crawling, enqueue URLs, and flush the waitlist.
 */
export function create<T extends any> (options: Options<T>): {
  crawl: (startUrl: string) => Promise<void>
  push: (...urls: string[]) => void
  flush: () => void
} {
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
      if (options.logger !== undefined) options.logger(ops, currentUrl, waitlist, processed)
      if (!processed.has(currentUrl)) {
        const content = await options.fetcher(currentUrl)
        await options.processor(currentUrl, content, { push, flush })
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
  return { crawl, push, flush }
}
