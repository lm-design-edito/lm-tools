import { Assert as AssertNamespace } from './assert'
import { Cast as CastNamespace } from './cast'
import { Crawler as CrawlerNamespace } from './crawler'
import { Crossenv as CrossenvNamespace } from './crossenv'
import * as DataSizeNamespace from './data-size'
import { getCurrentDownlink as getCurrentDownlinkFunc } from './get-current-downlink'
import {
  ConstructorFunction as ConstructorFunctionType,
  isConstructorFunction as isConstructorFunctionFunc
} from './is-constructor-function'
import {
  nullishValues as nullishValuesConst,
  isNullish as isNullishFunc,
  isNotNullish as isNotNullishFunc,
  Nullish as NullishType
} from './is-nullish'
import { Logs as LogsNamespace } from './logs'
import { LoremIpsum as LoremIpsumNamespace } from './lorem-ipsum'
import { Outcome as OutcomeNamespace } from './outcome'

export namespace Misc {
  // Assert
  export import Assert = AssertNamespace
  // Cast
  export import Cast = CastNamespace
  // Crossenv
  export import Crossenv = CrossenvNamespace
  // Get current downlink
  export const getCurrentDownlink = getCurrentDownlinkFunc
  // Is constructor function
  export type ConstructorFunction = ConstructorFunctionType
  export const isConstructorFunction = isConstructorFunctionFunc
  // Is nullish
  export const nullishValues = nullishValuesConst
  export type Nullish = NullishType
  export const isNullish = isNullishFunc
  export const isNotNullish = isNotNullishFunc
  // Logs
  export import Logs = LogsNamespace
  // Crawler
  export import Crawler = CrawlerNamespace
  // DataSize
  export import DataSize = DataSizeNamespace
  // Outcome
  export import Outcome = OutcomeNamespace
}

