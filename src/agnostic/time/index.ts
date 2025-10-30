import { Dates as DatesNamespace } from './dates/index.js'
import { Duration as DurationNamespace } from './duration/index.js'
import { timeout as timeoutFunc } from './timeout/index.js'
import { Transitions as TransitionsNamespace } from './transitions/index.js'
import { wait as waitFunc } from './wait/index.js'

export namespace Time {
  export import Dates = DatesNamespace
  export import Duration = DurationNamespace
  export const timeout = timeoutFunc
  export import Transitions = TransitionsNamespace
  export const wait = waitFunc
}
