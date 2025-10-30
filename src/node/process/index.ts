import {
  forceExitEvents as forceExitEventsConst,
  beforeForcedExit as beforeForcedExitFunc,
  beforeExit as beforeExitFunc,
  onExit as onExitFunc,
  onAllExits as onAllExitsFunc
} from './on-exit/index.js'

// On exit
export const forceExitEvents = forceExitEventsConst
export const beforeForcedExit = beforeForcedExitFunc
export const beforeExit = beforeExitFunc
export const onExit = onExitFunc
export const onAllExits = onAllExitsFunc
