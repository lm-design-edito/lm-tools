import type { RefObject } from 'react'
import { parseDuration } from '../../agnostic/time/duration/parse-duration/index.js'
import type { CommandActions } from '../utils/commands/types.js'
import {
  VIDEO_ACTION_VERB_ARGUMENTS,
  type VideoActionVerb
} from './types.js'
import { forceJumpTo } from './utils.js'

/**
 * What the action table needs from the component: where the element is, the setters of
 * the values it owns, and which of those values arrived as a prop.
 *
 * A value the caller drives is **not** written here: a controlling prop is the source of
 * truth, and a command cannot contradict it.
 */
export type VideoCommandsContext = {
  videoRef: RefObject<HTMLVideoElement | null>
  setInternalPlay: (play: boolean) => void
  setInternalMute: (mute: boolean) => void
  setInternalVolume: (volume: number) => void
  setInternalPlaybackRate: (rate: number) => void
  isPlayControlled: boolean
  isMuteControlled: boolean
  isVolumeControlled: boolean
  isPlaybackRateControlled: boolean
  isTimeControlled: boolean
}

const warnBadArgument = (verb: VideoActionVerb, arg: string | undefined): void => {
  // eslint-disable-next-line no-console
  console.warn(`"${verb}" was sent an argument it cannot read: "${arg ?? ''}"`)
}

/**
 * Reads the first argument of a verb that takes one, or `null` when it is missing or
 * malformed — in which case the caller is warned and the verb does nothing.
 *
 * Only the first argument is read: the grammar carries a list, and no video verb takes
 * more than one value.
 */
const readArgument = (verb: keyof typeof VIDEO_ACTION_VERB_ARGUMENTS, args: string[]): string | null => {
  const arg = args[0]
  if (arg === undefined || !VIDEO_ACTION_VERB_ARGUMENTS[verb](arg)) {
    warnBadArgument(verb, arg)
    return null
  }
  return arg
}

/**
 * The commands a video answers to, built over the component's own state.
 *
 * @param context - See {@link VideoCommandsContext}.
 * @returns The table {@link useCommands} subscribes with.
 */
export function makeVideoCommands (context: VideoCommandsContext): CommandActions {
  const {
    videoRef,
    setInternalPlay,
    setInternalMute,
    setInternalVolume,
    setInternalPlaybackRate,
    isPlayControlled,
    isMuteControlled,
    isVolumeControlled,
    isPlaybackRateControlled,
    isTimeControlled
  } = context

  const jumpTo = (targetMs: number): void => {
    if (isTimeControlled) return
    forceJumpTo(videoRef.current, targetMs)
  }

  return {
    play: () => { if (!isPlayControlled) setInternalPlay(true) },
    pause: () => { if (!isPlayControlled) setInternalPlay(false) },
    loud: () => { if (!isMuteControlled) setInternalMute(false) },
    mute: () => { if (!isMuteControlled) setInternalMute(true) },
    volume: args => {
      const arg = readArgument('volume', args)
      if (arg === null || isVolumeControlled) return
      setInternalVolume(Number(arg))
    },
    rate: args => {
      const arg = readArgument('rate', args)
      if (arg === null || isPlaybackRateControlled) return
      setInternalPlaybackRate(Number(arg))
    },
    'jump-to': args => {
      const arg = readArgument('jump-to', args)
      if (arg === null) return
      const targetMs = parseDuration(arg)
      if (targetMs === null) return
      jumpTo(targetMs)
    },
    'jump-start': () => jumpTo(0),
    'jump-end': () => jumpTo(-1)
  }
}
