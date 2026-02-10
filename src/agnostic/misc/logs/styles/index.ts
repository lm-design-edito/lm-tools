import { makeTextBlock } from '../make-text-block/index.js'

const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  fg: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
    whiteBright: '\x1b[97m'
  },
  bg: {
    red: '\x1b[41m'
  }
}

const wrap = (...ansiCodes: string[]) => (text: string) => `${ansiCodes.join('')}${text}${ansi.reset}`

export const styles = {
  regular: (text: string) => text,
  light: wrap(ansi.fg.gray),
  danger: (text: string) => wrap(ansi.bold, ansi.bg.red, ansi.fg.whiteBright)(makeTextBlock(`/!\\\n\n${text}\n`, 2, 6)),
  important: wrap(ansi.bold),
  title: (text: string) => `# ${wrap(ansi.bold, ansi.underline)(`${text}\n`)}`,
  info: wrap(ansi.fg.blue),
  success: wrap(ansi.fg.green),
  error: wrap(ansi.fg.red),
  warning: wrap(ansi.fg.yellow),
  italic: wrap(ansi.italic)
}