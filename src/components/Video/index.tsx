import {
  type FunctionComponent,
  type ReactEventHandler,
  useCallback,
  useEffect,
  useState
} from 'react'
import { muteAttributeWorkaround } from './utils.js'
import {
  ControlledVideo,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Props for the {@link Video} component.
 *
 * Extends all ControlledVideo props except play, mute, fullscreen, volume, playbackRate, and their associated event handlers
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
export type Props = Omit<ControlledProps, 'play' | 'fullscreen' | 'volume' | 'mute' | 'playbackRate' | 'subtitlesOn'>
  & { defaultSubtitlesOn?: boolean }

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
 * Browsers refuse an unmuted `play()` outside a user gesture, so asking for playback
 * without muting will usually have it rejected. The
 * refusal is caught rather than ignored — the element is read back once the attempt
 * settles, and the play state follows what it says — so the controls stay truthful.
 * The media still won't play, though: autoplay muted, and leave unmuting to the
 * reader.
 */

export const Video: FunctionComponent<Props> = ({
  defaultSubtitlesOn = true,
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

  // Several paths below ask for playback — the play button, `autoPlay` itself. None of
  // them may win over a parent-owned time, so the invariant is applied where the state
  // is forwarded rather than guarded at each call site.
  const isTimeControlled = controlledProps.currentTimeMs !== undefined

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
  const handlePlayButtonClick = useCallback<NonNullable<Props['onPlayButtonClicked']>>(payload => {
    onPlayButtonClicked?.(payload)
    setPlay(true)
  }, [onPlayButtonClicked])

  const handlePauseButtonClick = useCallback<NonNullable<Props['onPauseButtonClicked']>>(payload => {
    onPauseButtonClicked?.(payload)
    setPlay(false)
  }, [onPauseButtonClicked])

  // The picture toggles, where the two buttons each say one thing. It is the same gesture
  // as pressing one of them, and a consumer tracking playback has to count this one too.
  const handleVideoClick = useCallback<NonNullable<Props['onVideoClicked']>>(payload => {
    onVideoClicked?.(payload)
    setPlay(!payload.isPlaying)
  }, [onVideoClicked])

  const handleLoudButtonClick = useCallback<NonNullable<Props['onLoudButtonClicked']>>(payload => {
    onLoudButtonClicked?.(payload)
    setMute(false)
  }, [onLoudButtonClicked])

  const handleMuteButtonClick = useCallback<NonNullable<Props['onMuteButtonClicked']>>(payload => {
    onMuteButtonClicked?.(payload)
    setMute(true)
  }, [onMuteButtonClicked])

  const handleRateRangeChange = useCallback<NonNullable<Props['onRateRangeChanged']>>(payload => {
    onRateRangeChanged?.(payload)
    setPlaybackRate(payload.targetRate)
  }, [onRateRangeChanged])

  const handleVolumeRangeChange = useCallback<NonNullable<Props['onVolumeRangeChanged']>>(payload => {
    onVolumeRangeChanged?.(payload)
    setVolume(payload.targetVolume)
  }, [onVolumeRangeChanged])

  const handleFullscreenButtonClick = useCallback<NonNullable<Props['onFullscreenButtonClicked']>>(payload => {
    onFullscreenButtonClicked?.(payload)
    setFullscreen(!payload.isFullscreen)
  }, [onFullscreenButtonClicked])

  // One button for both directions, where play/pause and loud/mute get one each: those
  // carry two opposed glyphs, so both are rendered and the stylesheet shows one. The
  // subtitles button carries a single glyph whose styling alone changes.
  const handleSubtitlesButtonClick = useCallback<NonNullable<Props['onSubtitlesButtonClicked']>>(payload => {
    onSubtitlesButtonClicked?.(payload)
    setSubtitlesOn(!payload.isSubtitlesOn)
  }, [onSubtitlesButtonClicked])

  // `autoPlay` is forwarded to the element, but the play state is owned here, so
  // it has to be seeded once on mount for the controls to agree with the element.
  useEffect(() => {
    if (controlledProps.autoPlay === true) setPlay(true)
  }, [])

  // Render
  //
  // **The `<figure>` is the root, and there is nothing above it.** A wrapper would take
  // the outer position — the one a consumer lays out — and leave `className` naming an
  // inner element, which is the wrong way round. So no wrapper, and no second class-name
  // prop to reach past it.
  return <ControlledVideo
    {...controlledProps}
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
