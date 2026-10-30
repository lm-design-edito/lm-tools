import {
  type FunctionComponent,
  type ReactEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { parseDuration } from '../../agnostic/time/duration/parse-duration/index.js'
import {
  useCommandSurrender,
  useCommands
} from '../utils/commands/index.js'
import { useCompId } from '../utils/comp-id/index.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { WithVisibility } from '../utils/visibility/types.js'
import {
  VIDEO_ACTION_VERB_ARGUMENTS,
  VIDEO_ACTION_VERB_DOMAINS,
  type VideoActionDomain
} from './types.js'
import {
  forceJumpTo,
  muteAttributeWorkaround
} from './utils.js'
import {
  ControlledVideo,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Props for the {@link Video} component.
 *
 * Every {@link ControlledVideo} prop, plus the starting points below. Each value the
 * component can hold itself — `play`, `mute`, `volume`, `playbackRate`, `fullscreen`,
 * `subtitlesOn` — may be driven by the caller or left alone, per value. Provided, the
 * prop is the source of truth: the controls still fire their handlers, but no longer
 * change what the element does.
 * @property currentTimeMs - When provided, hands ownership of the current time
 * (in milliseconds) to the parent, which is then responsible for updating it —
 * typically to scrub the video from scroll position. A controlled time implies a
 * stopped video, since a playing element would advance a value it does not own:
 * `autoPlay`, a `'play'` instruction and the play button have no effect for as
 * long as this prop is provided.
 * @property defaultCurrentTimeMs - Where the playhead starts, without handing the time
 * over: how a media opens elsewhere than `0` and still plays. Ignored when
 * `currentTimeMs` is provided.
 * @property togglePlayOnClick - When `true`, a click on the picture plays or pauses it.
 * A **second** way to reach what the play and pause buttons already do, never the only
 * one: the element takes no focus stop, so the keyboard keeps using the buttons. The
 * controls painted over the picture are not part of the surface.
 * @property defaultSubtitlesOn - Whether the subtitles start shown. `true` by default —
 * an article that supplies cues means them to be read. The reader's button takes it from
 * there, so this is a starting point and not a setting: `default…` and never `initial…`,
 * as everywhere else here.
 * @property whenVisible - The command, or commands, sent once the component has
 * settled into view — `'play'`, `'jump-start'`, or `'@someone-else:pause'`. How a verb
 * gets sent without a line of JavaScript.
 * @property whenHidden - The same, once it has settled out of view.
 * @property onVisibilityChanged - Called on every settled change, for a caller that
 * wants the state rather than a command.
 * @property visibilityThreshold - How much of the component has to be in view before
 * it counts as visible.
 * @property visibilityRoot - The observer's root. Defaults to the viewport.
 * @property visibilityRootMargin - Grows or shrinks that root before measuring.
 * @property visibilityOnAfterMs - How long it has to stay in view to count as visible,
 * so a media crossed while scrolling fast never counts as seen.
 * @property visibilityOffAfterMs - The same, out of view.
 * @property defaultVolume - The volume the media starts at, `0` to `1`. `1` by default.
 * @property defaultPlaybackRate - The speed the media starts at, `1` being normal.
 * @property defaultMute - Whether the media starts muted, the reader's button taking it
 * from there. This is how a muted start is asked for: the native `muted` attribute is
 * what the autoplay exemption reads, but the mute state is applied to the element on
 * mount, so a `muted` attribute alone is undone a frame later.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the `<video>` element itself
 * (e.g. fallback content).
 */
// What this layer owns rather than forwards. `isVisible` is measured here, and the two
// refs are how it reaches elements it does not render itself — plumbing between the two
// files, never a way in: a caller holding the `<video>` would act behind the command
// layer's back.
export type Props = WithVisibility<Omit<
  ControlledProps,
  'isVisible' | 'rootRef' | 'videoRef'
>> & {
  defaultSubtitlesOn?: boolean
  defaultVolume?: number
  defaultPlaybackRate?: number
  defaultMute?: boolean
}

/**
 * Full-featured video player component. Wraps a native `<video>` element with
 * playback controls, volume, playback rate, a timeline, optional subtitles, and the
 * visibility triggers that send its commands.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A `<figure>` element containing the video, its controls and optional
 * subtitles.
 *
 * @remarks
 * **Audio-only media belongs here too**, carried by the same `<video>` element.
 * Everything this component drives — play, mute, volume, rate, time, `ended` — is
 * `HTMLMediaElement`, shared with `<audio>`; only fullscreen is video's own. And an
 * `<audio>` tag can't be autoplayed: the muted-autoplay exemption browsers grant is
 * for video, so an `<audio>` waits for a user gesture whatever its muted state.
 * Autoplaying an audio file therefore needs `muted` and `playsInline` on a `<video>`,
 * which is what this is. The one thing lost is the assistive-tech
 * label: a screen reader announces a video player. Worth a `tag` prop the day that
 * matters more than autoplay — not before.
 *
 * **`loop` reaches the element untouched**, like every other native media attribute
 * this component does not drive itself. It was once destructured out of the props and
 * never forwarded, which silently dropped it — so if a native attribute ever stops
 * arriving, look at the destructuring here before looking at the caller. One
 * consequence worth knowing: a looping element never fires `ended`, so the `--ended`
 * modifier and the `isEnded` it feeds to `Subtitles` simply never come.
 *
 * ### Commands
 * - `play` / `pause`, `loud` / `mute` — the four states a reader's buttons also reach.
 * - `volume:<0–1>` and `rate:<n>` — a decimal argument, `rate` strictly positive.
 * - `jump-to:<time>`, `jump-start`, `jump-end` — a time is milliseconds or a suffixed
 *   duration (`jump-to:500`, `jump-to:1.2min`), and a negative value counts back from
 *   the end, `jump-to:-1` being the last reachable timecode.
 *
 * **A command never contradicts a prop**: each verb is ignored while the value it
 * writes arrived as one, the three `jump-*` while `currentTimeMs` did. A malformed
 * argument is warned about and does nothing.
 *
 * `whenVisible` and `whenHidden` are how they get sent without a line of JavaScript:
 * `whenVisible='play'` with `whenHidden='pause'` plays only while in view, and
 * `whenVisible='@legend:show'` addresses another component instead.
 *
 * **A command also yields to the reader.** Using a control hands its domain over for
 * the rest of the mount, and the commands of that domain stop firing: pressing pause
 * silences `play` and `pause`, scrubbing the timeline silences the three `jump-*`,
 * muting or moving the volume slider silences `loud`, `mute` and `volume`. The
 * `:force` modifier opts out — `whenVisible='force:play'` — and is meant to be rare,
 * which is why yielding is the silent form. What has been surrendered is the command
 * layer's own business and shows nowhere in the DOM.
 *
 * Browsers refuse an unmuted `play()` outside a user gesture, so asking for playback
 * without muting will usually have it rejected. The
 * refusal is caught rather than ignored — the element is read back once the attempt
 * settles, and the play state follows what it says — so the controls stay truthful.
 * The media still won't play, though: autoplay muted, and leave unmuting to the
 * reader.
 */

export const Video: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  play,
  volume,
  mute,
  playbackRate,
  fullscreen,
  subtitlesOn,
  defaultSubtitlesOn = true,
  defaultVolume = 1,
  defaultPlaybackRate = 1,
  defaultMute = false,
  onTimelineClicked,
  onVideoClicked,
  onPlayButtonClicked,
  onPauseButtonClicked,
  onLoudButtonClicked,
  onMuteButtonClicked,
  onVolumeRangeChanged,
  onRateRangeChanged,
  onFullscreenButtonClicked,
  onSubtitlesButtonClicked,
  ...controlledProps
}) => {
  // The id is resolved here and handed down, so the two layers share one rather than
  // minting one each. The refs go the same way: this layer observes the root and seeks
  // on the element, both rendered below, so it mints the boxes and hands them down.
  const compId = useCompId(givenCompId)
  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // State & refs
  //
  // Each of these six can also arrive as a prop, which wins where they are forwarded
  // below; the state is written either way, so a caller that stops driving one lands on
  // what the reader last did rather than on a mount-time value.
  const [internalPlay, setInternalPlay] = useState(false)
  const [internalVolume, setInternalVolume] = useState(defaultVolume)
  const [internalMute, setInternalMute] = useState(defaultMute)
  const [internalPlaybackRate, setInternalPlaybackRate] = useState(defaultPlaybackRate)
  const [internalFullscreen, setInternalFullscreen] = useState(false)
  const [internalSubtitlesOn, setInternalSubtitlesOn] = useState(defaultSubtitlesOn)

  // Several paths below ask for playback — the play button, `autoPlay` itself. None of
  // them may win over a parent-owned time, so the invariant is applied where the state
  // is forwarded rather than guarded at each call site.
  const isTimeControlled = controlledProps.currentTimeMs !== undefined

  // The reader's hand. Touching a control hands its domain over for the rest of the
  // mount, because the failure modes are not symmetrical: not restarting on its own is
  // a disappointment, restarting against someone who just pressed pause is a hostility
  // they would meet at every pass. `force` is the written form for the same reason —
  // yielding is the silent one.
  // Annotated with this component's vocabulary: the layer takes any name, so the
  // annotation is what keeps a misspelled domain from compiling.
  const surrender: (domain: VideoActionDomain) => void = useCommandSurrender(
    compId,
    VIDEO_ACTION_VERB_DOMAINS
  )

  // Commands
  //
  // The table is written here rather than in a module of its own: every verb writes
  // this component's state, so a sibling file could only be handed each setter back.
  const jumpTo = (targetMs: number): void => {
    if (isTimeControlled) return
    forceJumpTo(videoRef.current, targetMs)
  }

  // Only the first argument is read: the grammar carries a list, and no verb here takes
  // more than one value. A malformed one is warned about and the verb does nothing.
  const readArgument = (
    verb: keyof typeof VIDEO_ACTION_VERB_ARGUMENTS,
    args: string[]
  ): string | null => {
    const arg = args[0]
    if (arg !== undefined && VIDEO_ACTION_VERB_ARGUMENTS[verb](arg)) return arg
    // eslint-disable-next-line no-console
    console.warn(`"${verb}" was sent an argument it cannot read: "${arg ?? ''}"`)
    return null
  }

  // What is left in each verb is the one refusal the command layer cannot make for it:
  // a value that arrived as a prop belongs to the parent, and not even `force` takes it.
  useCommands(compId, {
    play: () => { if (play === undefined) setInternalPlay(true) },
    pause: () => { if (play === undefined) setInternalPlay(false) },
    loud: () => { if (mute === undefined) setInternalMute(false) },
    mute: () => { if (mute === undefined) setInternalMute(true) },
    volume: ({ args }) => {
      const arg = readArgument('volume', args)
      if (arg === null || volume !== undefined) return
      setInternalVolume(Number(arg))
    },
    rate: ({ args }) => {
      const arg = readArgument('rate', args)
      if (arg === null || playbackRate !== undefined) return
      setInternalPlaybackRate(Number(arg))
    },
    'jump-to': ({ args }) => {
      const arg = readArgument('jump-to', args)
      if (arg === null) return
      const targetMs = parseDuration(arg)
      if (targetMs === null) return
      jumpTo(targetMs)
    },
    'jump-start': () => { jumpTo(0) },
    'jump-end': () => { jumpTo(-1) }
  })

  const isVisible = useVisibilityTriggers(compId, rootRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })

  // Intrisic event handlers
  const handleOnPlayEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    controlledProps.onPlay?.(e)
    setInternalPlay(true)
  }, [controlledProps.onPlay])

  const handleOnPauseEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setInternalPlay(false)
    controlledProps.onPause?.(e)
  }, [controlledProps.onPause])

  // The element's own account of whether it is playing. It covers what the `play`
  // and `pause` events do, plus the one case they can't: a play the browser refused,
  // which fires nothing at all. Without it the controls would stay on `--play-on`
  // over a media that never started.
  const handleIsPlayingChanged = useCallback((isPlaying: boolean) => {
    setInternalPlay(isPlaying)
    controlledProps.onIsPlayingChanged?.(isPlaying)
  }, [controlledProps.onIsPlayingChanged])

  const handleOnVolumeChangeEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setInternalMute(e.currentTarget.muted)
    setInternalVolume(e.currentTarget.volume)
    controlledProps.onVolumeChange?.(e)
  }, [controlledProps.onVolumeChange])

  const handleOnRateChangeEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setInternalPlaybackRate(e.currentTarget.playbackRate)
    controlledProps.onRateChange?.(e)
  }, [controlledProps.onRateChange])

  const handleFullscreenChange = useCallback((isFullscreen: boolean) => {
    if (!isFullscreen) setInternalFullscreen(false)
    controlledProps.onFullscreenChange?.(isFullscreen)
  }, [controlledProps.onFullscreenChange])

  const handleOnLoadedMetadataEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    muteAttributeWorkaround(e.currentTarget, controlledProps.muted ?? false)
    controlledProps.onLoadedMetadata?.(e)
  }, [controlledProps.onLoadedMetadata, controlledProps.muted])

  // User actions
  const handlePlayButtonClick = useCallback<NonNullable<Props['onPlayButtonClicked']>>(payload => {
    onPlayButtonClicked?.(payload)
    surrender('playback')
    setInternalPlay(true)
  }, [onPlayButtonClicked, surrender])

  const handlePauseButtonClick = useCallback<NonNullable<Props['onPauseButtonClicked']>>(payload => {
    onPauseButtonClicked?.(payload)
    surrender('playback')
    setInternalPlay(false)
  }, [onPauseButtonClicked, surrender])

  // The picture toggles, where the two buttons each say one thing. It is the same gesture
  // as pressing one of them, and a consumer tracking playback has to count this one too.
  const handleVideoClick = useCallback<NonNullable<Props['onVideoClicked']>>(payload => {
    onVideoClicked?.(payload)
    surrender('playback')
    setInternalPlay(!payload.isPlaying)
  }, [onVideoClicked, surrender])

  const handleLoudButtonClick = useCallback<NonNullable<Props['onLoudButtonClicked']>>(payload => {
    onLoudButtonClicked?.(payload)
    surrender('sound')
    setInternalMute(false)
  }, [onLoudButtonClicked, surrender])

  const handleMuteButtonClick = useCallback<NonNullable<Props['onMuteButtonClicked']>>(payload => {
    onMuteButtonClicked?.(payload)
    surrender('sound')
    setInternalMute(true)
  }, [onMuteButtonClicked, surrender])

  const handleRateRangeChange = useCallback<NonNullable<Props['onRateRangeChanged']>>(payload => {
    onRateRangeChanged?.(payload)
    surrender('rate')
    setInternalPlaybackRate(payload.targetRate)
  }, [onRateRangeChanged, surrender])

  const handleVolumeRangeChange = useCallback<NonNullable<Props['onVolumeRangeChanged']>>(payload => {
    onVolumeRangeChanged?.(payload)
    surrender('sound')
    setInternalVolume(payload.targetVolume)
  }, [onVolumeRangeChanged, surrender])

  const handleFullscreenButtonClick = useCallback<NonNullable<Props['onFullscreenButtonClicked']>>(payload => {
    onFullscreenButtonClicked?.(payload)
    surrender('fullscreen')
    setInternalFullscreen(!payload.isFullscreen)
  }, [onFullscreenButtonClicked, surrender])

  // One button for both directions, where play/pause and loud/mute get one each: those
  // carry two opposed glyphs, so both are rendered and the stylesheet shows one. The
  // subtitles button carries a single glyph whose styling alone changes.
  const handleSubtitlesButtonClick = useCallback<NonNullable<Props['onSubtitlesButtonClicked']>>(payload => {
    onSubtitlesButtonClicked?.(payload)
    surrender('subtitles')
    setInternalSubtitlesOn(!payload.isSubtitlesOn)
  }, [onSubtitlesButtonClicked, surrender])

  // The one gesture this layer did not see before: the time belongs to the element, so
  // the timeline click used to pass straight through to the controlled layer.
  const handleTimelineClick = useCallback<NonNullable<Props['onTimelineClicked']>>(payload => {
    onTimelineClicked?.(payload)
    surrender('position')
  }, [onTimelineClicked, surrender])

  // `autoPlay` is forwarded to the element, but the play state is owned here, so
  // it has to be seeded once on mount for the controls to agree with the element.
  useEffect(() => {
    if (controlledProps.autoPlay === true) setInternalPlay(true)
  }, [])

  // Render
  //
  // **The `<figure>` is the root, and there is nothing above it.** A wrapper would take
  // the outer position — the one a consumer lays out — and leave `className` naming an
  // inner element, which is the wrong way round. So no wrapper, and no second class-name
  // prop to reach past it.
  return <ControlledVideo
    {...controlledProps}
    compId={compId}
    rootRef={rootRef}
    videoRef={videoRef}
    isVisible={isVisible}
    play={(play ?? internalPlay) && !isTimeControlled}
    volume={volume ?? internalVolume}
    mute={mute ?? internalMute}
    playbackRate={playbackRate ?? internalPlaybackRate}
    fullscreen={fullscreen ?? internalFullscreen}
    subtitlesOn={subtitlesOn ?? internalSubtitlesOn}
    onPlay={handleOnPlayEvent}
    onPause={handleOnPauseEvent}
    onIsPlayingChanged={handleIsPlayingChanged}
    onVolumeChange={handleOnVolumeChangeEvent}
    onRateChange={handleOnRateChangeEvent}
    onLoadedMetadata={handleOnLoadedMetadataEvent}
    onFullscreenChange={handleFullscreenChange}
    onVideoClicked={handleVideoClick}
    onPlayButtonClicked={handlePlayButtonClick}
    onPauseButtonClicked={handlePauseButtonClick}
    onLoudButtonClicked={handleLoudButtonClick}
    onMuteButtonClicked={handleMuteButtonClick}
    onVolumeRangeChanged={handleVolumeRangeChange}
    onRateRangeChanged={handleRateRangeChange}
    onFullscreenButtonClicked={handleFullscreenButtonClick}
    onSubtitlesButtonClicked={handleSubtitlesButtonClick}
    onTimelineClicked={handleTimelineClick} />
}
