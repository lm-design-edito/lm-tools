import { wait } from '../../time/wait/index.js'

export namespace Crawler {
  export function create<T extends any> (
    options: {
      limit: number
      delayMs?: number | (() => number)
      fetcher: (url: string) => Promise<T>
      processor: (
        url: string,
        content: T,
        hooks: {
          push: (...urls: string[]) => void,
          flush: () => void
        }
      ) => any
      logger?: (
        ops: number,
        url: string,
        waitlist: string[],
        processed: Set<string>
      ) => void
    }) {
    let ops = 0
    const waitlist: string[] = []
    const push = (url: string) => waitlist.push(url)
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

    return {
      crawl,
      push,
      flush
    }
  }  
}
