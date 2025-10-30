import { Logger as LoggerClass } from './logger/index.js'
import { makeTextBlock as makeTextBlockFunc } from './make-text-block/index.js'
import { styles as stylesObj } from './styles/index.js'

export namespace Logs {
  export const makeTextBlock = makeTextBlockFunc
  export const styles = stylesObj
  export const Logger = LoggerClass  
}
