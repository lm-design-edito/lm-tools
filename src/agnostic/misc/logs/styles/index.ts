import chalk from 'chalk' // [WIP] replace chalk and do my own implementation ?
import { makeTextBlock } from '../make-text-block/index.js'

export const styles = {
  regular: (text: string) => text,
  light: (text: string) => chalk.grey(text),
  danger: (text: string) => chalk.bold.bgRed.whiteBright(makeTextBlock(`/!\\\n\n${text}\n`, 2, 6)),
  important: (text: string) => chalk.bold(text),
  title: (text: string) => `# ${chalk.bold.underline(`${text}\n`)}`,
  info: (text: string) => chalk.blueBright(text),
  success: (text: string) => chalk.greenBright(text),
  error: (text: string) => chalk.red(text),
  warning: (text: string) => chalk.yellow(text)
}
