import {
  type FunctionComponent,
  type ReactEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useViewportBehaviours } from '../utils/viewport-behaviours/index.js'
import type {
  ActionTable,
  ViewportBehaviours
} from '../utils/viewport-behaviours/types.js'
import {
  forceJumpTo,
  muteAttributeWorkaround
} from './utils.js'
import type {
  VideoAction,
  VideoDomain,
  VideoVerb
} from './types.js'
import {
  ControlledVideo,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Props for the {@link Video} component.
 *
 * Extends all ControlledVideo props except play, mute, fullscreen, volume, playbackRate, and their associated event handlers
 * @property behavioursSuspended - Holds back the instructions that **start** something,
 * and lets through those that stop it. For a consumer withholding the video behind
 * something — a warning to accept, typically: a video kept back that plays anyway is not
 * withheld, it is merely hard to see. What was held back is replayed the moment this
 * goes false, so lifting the veil on an already-visible video does what was asked, which
 * a crossing-based trigger could never do. `':force'` does not override it: it speaks of
 * consent not yet given, where a surrender speaks of an intention already expressed.
 * @property visibilityThreshold - How much of the video has to be on screen to count as
 * seen. See {@link VisibilityOptions} for this and the four that follow it.
 * @property whenVisible - What to do each time it becomes visible.
 * @property whenHidden - The same, on the way out.
 * @property onVisibilityChanged - Called with the new value once it has settled — the
 * delays included, so this and the instructions are told the same story. Never on mount.
 * @property currentTimeMs - When provided, hands ownership of the current time
 * (in milliseconds) to the parent, which is then responsible for updating it —
 * typically to scrub the video from scroll position. A controlled time implies a
 * stopped video, since a playing element would advance a value it does not own:
 * `autoPlay`, a `'play'` instruction and the play button have no effect for as
 * long as this prop is provided.
 * @property togglePlayOnClick - When `true`, a click on the picture plays or pauses it.
 * A **second** way to reach what the play and pause buttons already do, never the only
 * one: the element takes no focus stop, so the keyboard keeps using the buttons. The
 * controls painted over the picture are not part of the surface.
 * @property defaultSubtitlesOn - Whether the subtitles start shown. `true` by default —
 * an article that supplies cues means them to be read. The reader's button takes it from
 * there, so this is a starting point and not a setting: `default…` and never `initial…`,
 * as everywhere else here.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the `<video>` element itself
 * (e.g. fallback content).
 */
// The two refs are omitted along with the controlled state: this component sets both,
// to observe the `<figure>` it renders and to seek the `<video>` inside it. A consumer
// handing in its own would take the observer's target away.
export type Props = Omit<ControlledProps, 'play' | 'fullscreen' | 'volume' | 'mute' | 'playbackRate' | 'subtitlesOn' | 'rootRef' | 'videoRef'>
  & ViewportBehaviours<VideoAction>
  & {
    defaultSubtitlesOn?: boolean
    behavioursSuspended?: boolean
  }

/**
 * Full-featured video player component. Wraps a native `<video>` element with
 * playback controls, volume, playback rate, a timeline, optional subtitles, and
 * viewport-driven auto-play/mute behaviours.
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
 * `autoPlayWhenVisible` on an audio file therefore needs `muted` and `playsInline`
 * on a `<video>`, which is what this is. The one thing lost is the assistive-tech
 * label: a screen reader announces a video player. Worth a `tag` prop the day that
 * matters more than autoplay — not before.
 *
 * **Viewport-driven behaviour is declared, not named by a prop.** `whenVisible` and
 * `whenHidden` take a verb or a list of them, out of {@link VideoAction} — `'play'`,
 * `'mute'`, `'jump-to:500'` — each optionally suffixed by `':once'` and `':force'`. See
 * `components/utils/viewport-behaviours` for the grammar and its rules, and the
 * `visibility…` props for what « visible » means and how long
 * it has to have been true.
 *
 * **An instruction yields to the reader by default.** Touching a control surrenders its
 * domain for the rest of the mount: playback covers the play and pause buttons, the
 * picture when it toggles, and the timeline, since seeking is saying where one wants to
 * be. Sound covers the two sound buttons and the volume slider. Fullscreen and playback
 * rate surrender nothing, being neither. `':force'` opts out.
 *
 * **`loop` reaches the element untouched**, like every other native media attribute
 * this component does not drive itself. It was once destructured out of the props and
 * never forwarded, which silently dropped it — so if a native attribute ever stops
 * arriving, look at the destructuring here before looking at the caller. One
 * consequence worth knowing: a looping element never fires `ended`, so the `--ended`
 * modifier and the `isEnded` it feeds to `Subtitles` simply never come.
 *
 * Browsers refuse an unmuted `play()` outside a user gesture, so pairing a `'loud'`
 * instruction with a `'play'` one will usually have the playback rejected. The
 * refusal is caught rather than ignored — the element is read back once the attempt
 * settles, and the play state follows what it says — so the controls stay truthful.
 * The media still won't play, though: autoplay muted, and leave unmuting to the
 * reader.
 */

export const Video: FunctionComponent<Props> = ({
  defaultSubtitlesOn = true,
  behavioursSuspended,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
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
  // State & refs
  const [play, setPlay] = useState(false)
  const [volume, setVolume] = useState(1)
  const [mute, setMute] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [subtitlesOn, setSubtitlesOn] = useState(defaultSubtitlesOn)

  // Several paths below ask for playback — the play button, a `'play'` instruction,
  // `autoPlay` itself. None of them may win over a parent-owned time, so the invariant
  // is applied where the state is forwarded rather than guarded at each call site.
  const isTimeControlled = controlledProps.currentTimeMs !== undefined

  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Viewport behaviours

  // What each verb does, and what it competes with. Rebuilt on every render — it closes
  // over the setters — which is why the generic layer reads it through a ref rather than
  // a dependency list.
  //
  // **Seeking belongs to `playback`.** A reader who has dragged the timeline has said
  // where they want to be, and an automatic jump would take it back from them.
  const actions: ActionTable<VideoVerb, VideoDomain> = {
    play: { kind: 'start', domain: 'playback', run: () => setPlay(true) },
    pause: { kind: 'stop', domain: 'playback', run: () => setPlay(false) },
    loud: { kind: 'start', domain: 'sound', run: () => setMute(false) },
    mute: { kind: 'stop', domain: 'sound', run: () => setMute(true) },
    // A seek starts nothing on its own — it moves a playhead, playing or not — so a gate
    // has no reason to hold it back.
    'jump-to': {
      kind: 'stop',
      domain: 'playback',
      run: arg => {
        const targetMs = Number(arg)
        if (!Number.isFinite(targetMs)) return
        forceJumpTo(videoRef.current, targetMs)
      }
    },
    'jump-start': { kind: 'stop', domain: 'playback', run: () => forceJumpTo(videoRef.current, 0) },
    'jump-end': { kind: 'stop', domain: 'playback', run: () => forceJumpTo(videoRef.current, -1) }
  }

  const { surrender: surrenderAnyDomain } = useViewportBehaviours<VideoAction>(
    rootRef,
    {
      visibilityThreshold,
      visibilityRoot,
      visibilityRootMargin,
      visibilityOnAfterMs,
      visibilityOffAfterMs,
      whenVisible,
      whenHidden,
      onVisibilityChanged
    },
    actions,
    behavioursSuspended === true
  )

  // Narrowed back to this component's own domains. The generic layer takes a `string`,
  // having no vocabulary of its own; handing the handlers a typed door means a
  // misspelled domain fails to compile instead of quietly never surrendering anything.
  const surrender = useCallback((domain: VideoDomain) => {
    surrenderAnyDomain(domain)
  }, [surrenderAnyDomain])

  // Intrisic event handlers
  const handleOnPlayEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    controlledProps.onPlay?.(e)
    setPlay(true)
  }, [controlledProps.onPlay])

  const handleOnPauseEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setPlay(false)
    controlledProps.onPause?.(e)
  }, [controlledProps.onPause])

  // The element's own account of whether it is playing. It covers what the `play`
  // and `pause` events do, plus the one case they can't: a play the browser refused,
  // which fires nothing at all. Without it the controls would stay on `--play-on`
  // over a media that never started.
  const handleIsPlayingChanged = useCallback((isPlaying: boolean) => {
    setPlay(isPlaying)
    controlledProps.onIsPlayingChanged?.(isPlaying)
  }, [controlledProps.onIsPlayingChanged])

  const handleOnVolumeChangeEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setMute(e.currentTarget.muted)
    setVolume(e.currentTarget.volume)
    controlledProps.onVolumeChange?.(e)
  }, [controlledProps.onVolumeChange])

  const handleOnRateChangeEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setPlaybackRate(e.currentTarget.playbackRate)
    controlledProps.onRateChange?.(e)
  }, [controlledProps.onRateChange])

  const handleFullscreenChange = useCallback((isFullscreen: boolean) => {
    if (!isFullscreen) setFullscreen(false)
    controlledProps.onFullscreenChange?.(isFullscreen)
  }, [controlledProps.onFullscreenChange])

  const handleOnLoadedMetadataEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    muteAttributeWorkaround(e.currentTarget, controlledProps.muted ?? false)
    controlledProps.onLoadedMetadata?.(e)
  }, [controlledProps.onLoadedMetadata, controlledProps.muted])

  // User actions
  const handlePlayButtonClick = useCallback<NonNullable<Props['onPlayButtonClicked']>>((e, isPlaying, video) => {
    onPlayButtonClicked?.(e, isPlaying, video)
    surrender('playback')
    setPlay(true)
  }, [onPlayButtonClicked, surrender])

  const handlePauseButtonClick = useCallback<NonNullable<Props['onPauseButtonClicked']>>((e, isPlaying, video) => {
    onPauseButtonClicked?.(e, isPlaying, video)
    surrender('playback')
    setPlay(false)
  }, [onPauseButtonClicked, surrender])

  // The picture toggles, where the two buttons each say one thing. It is the same gesture
  // as pressing one of them — a consumer tracking whether the reader has taken over
  // playback has to count this one too, since it is the same decision made elsewhere.
  const handleVideoClick = useCallback<NonNullable<Props['onVideoClicked']>>((e, isPlaying, video) => {
    onVideoClicked?.(e, isPlaying, video)
    surrender('playback')
    setPlay(!isPlaying)
  }, [onVideoClicked, surrender])

  const handleLoudButtonClick = useCallback<NonNullable<Props['onLoudButtonClicked']>>((e, isLoud, video) => {
    onLoudButtonClicked?.(e, isLoud, video)
    surrender('sound')
    setMute(false)
  }, [onLoudButtonClicked, surrender])

  const handleMuteButtonClick = useCallback<NonNullable<Props['onMuteButtonClicked']>>((e, isLoud, video) => {
    onMuteButtonClicked?.(e, isLoud, video)
    surrender('sound')
    setMute(true)
  }, [onMuteButtonClicked, surrender])

  const handleRateRangeChange = useCallback<NonNullable<Props['onRateRangeChanged']>>((e, targetRate, currentRate, video) => {
    onRateRangeChanged?.(e, targetRate, currentRate, video)
    setPlaybackRate(targetRate)
  }, [onRateRangeChanged])

  const handleVolumeRangeChange = useCallback<NonNullable<Props['onVolumeRangeChanged']>>((e, targetVolume, currentVolume, video) => {
    onVolumeRangeChanged?.(e, targetVolume, currentVolume, video)
    surrender('sound')
    setVolume(targetVolume)
  }, [onVolumeRangeChanged, surrender])

  const handleFullscreenButtonClick = useCallback<NonNullable<Props['onFullscreenButtonClicked']>>((e, isFullscreen, video) => {
    onFullscreenButtonClicked?.(e, isFullscreen, video)
    setFullscreen(!isFullscreen)
  }, [onFullscreenButtonClicked])

  // Un seul bouton pour les deux sens, contrairement à lecture/pause et son/muet qui en
  // ont un chacun : ceux-là existent en paire dans le DOM et la feuille en montre un,
  // parce qu'ils portent deux glyphes opposés. Les sous-titres n'en portent qu'un, dont
  // seul l'habillage change — inutile d'en rendre deux pour n'en montrer jamais qu'un.
  const handleSubtitlesButtonClick = useCallback<NonNullable<Props['onSubtitlesButtonClicked']>>((e, isSubtitlesOn, video) => {
    onSubtitlesButtonClicked?.(e, isSubtitlesOn, video)
    setSubtitlesOn(!isSubtitlesOn)
  }, [onSubtitlesButtonClicked])

  // `autoPlay` is forwarded to the element, but the play state is owned here, so
  // it has to be seeded once on mount for the controls to agree with the element.
  useEffect(() => {
    if (controlledProps.autoPlay === true) setPlay(true)
  }, [])

  // Render
  //
  // **The `<figure>` is the root, and there is nothing above it.** The observer runs on
  // that element rather than on a box built to hold it: a wrapper would take the outer
  // position — the one a consumer lays out — and leave `className` naming an inner
  // element, which is the wrong way round. So no wrapper, and no second class-name prop
  // to reach past it.
  return <ControlledVideo
    {...controlledProps}
    rootRef={rootRef}
    videoRef={videoRef}
    play={play && !isTimeControlled}
    volume={volume}
    mute={mute}
    playbackRate={playbackRate}
    fullscreen={fullscreen}
    subtitlesOn={subtitlesOn}
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
    onSubtitlesButtonClicked={handleSubtitlesButtonClick} />
}
