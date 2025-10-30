import { Assert as AssertNamespace } from './assert/index.js'
import { Cast as CastNamespace } from './cast/index.js'
import { Crawler as CrawlerNamespace } from './crawler/index.js'
import { Crossenv as CrossenvNamespace } from './crossenv/index.js'
import * as DataSize from './data-size/index.js'
import { getCurrentDownlink as getCurrentDownlinkFunc } from './get-current-downlink/index.js'
import {
  ConstructorFunction as ConstructorFunctionType,
  isConstructorFunction as isConstructorFunctionFunc
} from './is-constructor-function/index.js'
import {
  nullishValues as nullishValuesConst,
  isNullish as isNullishFunc,
  isNotNullish as isNotNullishFunc,
} from './is-nullish/index.js'
import { Logs as LogsNamespace } from './logs/index.js'
import { LoremIpsum as LoremIpsumNamespace } from './lorem-ipsum/index.js'
import { Outcome as OutcomeNamespace } from './outcome/index.js'

// Assert
export import Assert = AssertNamespace
// Cast
export import Cast = CastNamespace
// Crawler
export import Crawler = CrawlerNamespace
// Crossenv
export import Crossenv = CrossenvNamespace
// DataSize
export { DataSize }
// Get current downlink
export const getCurrentDownlink = getCurrentDownlinkFunc
// Is constructor function
export type ConstructorFunction = ConstructorFunctionType
export const isConstructorFunction = isConstructorFunctionFunc
// Is nullish
export const nullishValues = nullishValuesConst
export const isNullish = isNullishFunc
export const isNotNullish = isNotNullishFunc
// Logs
export import Logs = LogsNamespace
// LoremIpsum
export import LoremIpsum = LoremIpsumNamespace
// Outcome
export import Outcome = OutcomeNamespace

