type ConsoleMethod = 'assert'
| 'count'
| 'countReset'
| 'debug'
| 'dir'
| 'dirxml'
| 'error'
| 'group'
| 'groupCollapsed'
| 'groupEnd'
| 'info'
| 'log'
| 'table'
| 'time'
| 'timeEnd'
| 'trace'
| 'warn'

type ConsoleMethodsParams = {
  assert: Parameters<typeof console.assert>
  count: Parameters<typeof console.count>
  countReset: Parameters<typeof console.countReset>
  debug: Parameters<typeof console.debug>
  dir: Parameters<typeof console.dir>
  dirxml: Parameters<typeof console.dirxml>
  error: Parameters<typeof console.error>
  group: Parameters<typeof console.group>
  groupCollapsed: Parameters<typeof console.groupCollapsed>
  groupEnd: Parameters<typeof console.groupEnd>
  info: Parameters<typeof console.info>
  log: Parameters<typeof console.log>
  table: Parameters<typeof console.table>
  time: Parameters<typeof console.time>
  timeEnd: Parameters<typeof console.timeEnd>
  trace: Parameters<typeof console.trace>
  warn: Parameters<typeof console.warn>
}

// [WIP] not sure about this
const logsTimeOrigin = new Date()

class Log<T extends ConsoleMethod = ConsoleMethod> {
  type: T
  data: ConsoleMethodsParams[T]
  time: Date
  stack: string
  constructor (type: T, data: ConsoleMethodsParams[T]) {
    this.type = type
    this.data = data
    this.time = new Date()
    this.stack = (new Error().stack ?? '')
  }

  get displayTime (): string {
    return this.time.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }) + `:${this.time.getMilliseconds()}`
  }

  get elapsedTimeMs (): number {
    return (this.time.getTime() - logsTimeOrigin.getTime()) / 1000
  }

  get displayStack (): string {
    return this.stack
      .split('\n')
      .map(line => line.trim())
      .slice(4)
      .join('\n')
  }
}

export class Logger {
  _private_threads = new Map<string, Log[]>()
  constructor () {
    this.assert = this.assert.bind(this)
    this.count = this.count.bind(this)
    this.countReset = this.countReset.bind(this)
    this.debug = this.debug.bind(this)
    this.dir = this.dir.bind(this)
    this.dirxml = this.dirxml.bind(this)
    this.error = this.error.bind(this)
    this.group = this.group.bind(this)
    this.groupCollapsed = this.groupCollapsed.bind(this)
    this.groupEnd = this.groupEnd.bind(this)
    this.info = this.info.bind(this)
    this.log = this.log.bind(this)
    this.table = this.table.bind(this)
    this.time = this.time.bind(this)
    this.timeEnd = this.timeEnd.bind(this)
    this.trace = this.trace.bind(this)
    this.warn = this.warn.bind(this)
    this.setLog = this.setLog.bind(this)
    this.print = this.print.bind(this)
    this.printThreads = this.printThreads.bind(this)
  }

  assert (thread: string = '', ...args: ConsoleMethodsParams['assert']): void { this.setLog(thread, 'assert', args) }
  count (thread: string = '', ...args: ConsoleMethodsParams['count']): void { this.setLog(thread, 'count', args) }
  countReset (thread: string = '', ...args: ConsoleMethodsParams['countReset']): void { this.setLog(thread, 'countReset', args) }
  debug (thread: string = '', ...args: ConsoleMethodsParams['debug']): void { this.setLog(thread, 'debug', args) }
  dir (thread: string = '', ...args: ConsoleMethodsParams['dir']): void { this.setLog(thread, 'dir', args) }
  dirxml (thread: string = '', ...args: ConsoleMethodsParams['dirxml']): void { this.setLog(thread, 'dirxml', args) }
  error (thread: string = '', ...args: ConsoleMethodsParams['error']): void { this.setLog(thread, 'error', args) }
  group (thread: string = '', ...args: ConsoleMethodsParams['group']): void { this.setLog(thread, 'group', args) }
  groupCollapsed (thread: string = '', ...args: ConsoleMethodsParams['groupCollapsed']): void { this.setLog(thread, 'groupCollapsed', args) }
  groupEnd (thread: string = '', ...args: ConsoleMethodsParams['groupEnd']): void { this.setLog(thread, 'groupEnd', args) }
  info (thread: string = '', ...args: ConsoleMethodsParams['info']): void { this.setLog(thread, 'info', args) }
  log (thread: string = '', ...args: ConsoleMethodsParams['log']): void { this.setLog(thread, 'log', args) }
  table (thread: string = '', ...args: ConsoleMethodsParams['table']): void { this.setLog(thread, 'table', args) }
  time (thread: string = '', ...args: ConsoleMethodsParams['time']): void { this.setLog(thread, 'time', args) }
  timeEnd (thread: string = '', ...args: ConsoleMethodsParams['timeEnd']): void { this.setLog(thread, 'timeEnd', args) }
  trace (thread: string = '', ...args: ConsoleMethodsParams['trace']): void { this.setLog(thread, 'trace', args) }
  warn (thread: string = '', ...args: ConsoleMethodsParams['warn']): void { this.setLog(thread, 'warn', args) }

  setLog<T extends ConsoleMethod> (
    threadName: string,
    type: T,
    data: ConsoleMethodsParams[T]
  ): this {
    const log = new Log(type, data)
    const thread = this._private_threads.get(threadName) ?? []
    this._private_threads.set(threadName, [...thread, log])
    return this
  }

  print (this: Logger, threadFilter?: string, withStack?: boolean): void {
    const allLogs = Array.from(this._private_threads.entries())
      .map(([threadName, logs]) => logs.map(log => ({ threadName, log })))
      .flat()
      .sort((eltA, eltB) => (eltA.log.time.getTime() - eltB.log.time.getTime()))
      .filter(({ threadName }) => {
        if (threadFilter === undefined) return true
        return threadName === threadFilter
      })
    allLogs.forEach(({ threadName, log }) => {
      console.log(`%c${threadName}`, 'font-weight: 800; color: white; background: black; padding: 4px;', `+${log.elapsedTimeMs}s –`, log.displayTime)
      if (withStack === true) console.log(`%c${log.displayStack}`, 'color: grey; font-size: inherit;')
      ;(console[log.type] as any)(...log.data)
      console.log('')
    })
  }

  printThreads (this: Logger, withStack?: boolean): void {
    Array.from(this._private_threads.entries())
      .forEach(([threadName, logs]) => {
        console.group(`%c${threadName}`, 'font-weight: 800; color: white; background: black; padding: 4px;')
        logs.forEach(log => {
          console.log(`+${log.elapsedTimeMs}s –`, log.displayTime)
          if (withStack === true) console.log(`%c${log.displayStack}`, 'color: grey; font-size: inherit;')
          ;(console[log.type] as any)(...log.data)
          console.log('')
        })
        console.groupEnd()
      })
  }
}
