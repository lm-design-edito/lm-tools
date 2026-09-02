import {
  type FunctionComponent,
  type PropsWithChildren,
  type VideoHTMLAttributes,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { formatDuration } from '../../agnostic/time/format-duration/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import cssModule from './styles.module.css'
import { video as publicClassName } from '../public-classnames.js'
import {
  Subtitles,
  type Props as SubsProps
} from '../Subtitles/index.js'
import {
  forceExitFullscreen,
  forceFullscreen,
  forceLoud,
  forceMute,
  forcePause,
  forcePlay,
  forcePlaybackRate,
  forceVolume,
  getTimelineClickProgress,
  msToSeconds,
  secondsToMs
} from './utils.js'

/**
 * Describes a single video source.
 *
 * @property src - URL of the video file.
 * @property type - MIME type of the source (e.g. `'video/mp4'`).
 */
type SourceData = {
  src?: string
  type?: string
}

/**
 * Describes a single text track (subtitles, captions, chapters, etc.).
 *
 * @property src - URL of the track file.
 * @property kind - Track type, maps directly to the `<track>` `kind` attribute.
 * @property srclang - Language of the track content (e.g. `'fr'`, `'en'`).
 * @property label - Human-readable label shown in the browser's track selector.
 * @property default - When `true`, marks this track as the default selection.
 */
type TrackData = {
  src?: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srclang?: string
  label?: string
  default?: boolean
}


/**
 * Props for the ControlledVideo component.
 *
 * @property sources - List of video sources (string, array of strings, or SourceData objects).
 * @property tracks - List of tracks (subtitles, captions, etc.), string, array of strings, or TrackData objects.
 * @property subtitles - Props for the Subtitles component.
 * @property playBtnContent - React content for the play button.
 * @property pauseBtnContent - React content for the pause button.
 * @property loudBtnContent - React content for the "loud" (unmute) button.
 * @property muteBtnContent - React content for the mute button.
 * @property fullscreenBtnContent - React content for the fullscreen button.
 * @property play - External control of play state (true = play, false = pause).
 * @property fullscreen - External control of fullscreen mode.
 * @property volume - External control of volume (0 to 1).
 * @property mute - External control of mute (true = muted).
 * @property playbackRate - External control of playback speed.
 * @property currentTimeMs - External control of current time (in ms). Providing
 * it hands ownership of the time to the parent: the value is displayed as given,
 * the element is seeked to it on every change, and user interactions that would
 * otherwise move the time (timeline click) no longer do — the parent is expected
 * to update the prop instead. Because a playing element advances the time by
 * itself, a controlled time also implies a stopped video: `play` and `autoPlay`
 * are ignored for as long as this prop is provided.
 * @property onPlayButtonClicked - Called when the play button is clicked, before
 * the component reacts, with the playback state as it was.
 * @property onPauseButtonClicked - Called when the pause button is clicked, before
 * the component reacts, with the playback state as it was.
 * @property onLoudButtonClicked - Called when the unmute button is clicked, before
 * the component reacts, with the mute state as it was (`true` = unmuted).
 * @property onMuteButtonClicked - Called when the mute button is clicked, before
 * the component reacts, with the mute state as it was (`true` = unmuted).
 * @property onVolumeRangeChanged - Called when the volume slider moves, before the
 * component reacts, with the target and current volumes (both `0` to `1`).
 * @property onRateRangeChanged - Called when the playback rate slider moves, before
 * the component reacts, with the target and current rates.
 * @property onFullscreenButtonClicked - Called when the fullscreen button is
 * clicked, before the component reacts, with the fullscreen state as it was.
 * @property onTimelineClicked - Called when the timeline is clicked, before the
 * component reacts, with the target and current times (in seconds). The component
 * seeks to the target right after, unless the time is controlled.
 * @property onIsPlayingChanged - Called once the playback state has changed.
 * @property onIsFullscreenChanged - Called once the fullscreen state has changed.
 * @property onIsLoudChanged - Called once the mute state has changed (`true` = unmuted).
 * @property onVolumeChanged - Called once the volume has changed (`0` to `1`).
 * @property onPlaybackRateChanged - Called once the playback rate has changed.
 * @property onCurrentTimeMsChanged - Called once the current time has changed, in
 * milliseconds, to match the `currentTimeMs` prop.
 * @property onFullscreenChange - Called when the *browser* enters or leaves
 * fullscreen on its own — pressing Escape, typically — with the new state. This is
 * the signal a parent needs to update its `fullscreen` prop, and it is distinct
 * from `onIsFullscreenChanged`, which merely echoes that prop back once changed.
 * @property className - Additional CSS class for the root element.
 * @property children - React content inserted into the <video> tag (fallback, etc).
 *
 * Also inherits all standard HTML props for a <video> element.
 */
export type Props = PropsWithChildren<WithClassName<{
  sources?: string | string[] | SourceData[]
  tracks?: string | string[] | TrackData[]
  subtitles?: SubsProps
  playBtnContent?: React.ReactNode
  pauseBtnContent?: React.ReactNode
  loudBtnContent?: React.ReactNode
  muteBtnContent?: React.ReactNode
  fullscreenBtnContent?: React.ReactNode
  play?: boolean
  fullscreen?: boolean
  volume?: number
  mute?: boolean
  playbackRate?: number
  currentTimeMs?: number
  onPlayButtonClicked?: (e: React.MouseEvent<HTMLButtonElement>, isPlaying: boolean, video: HTMLVideoElement | null) => void
  onPauseButtonClicked?: (e: React.MouseEvent<HTMLButtonElement>, isPlaying: boolean, video: HTMLVideoElement | null) => void
  onLoudButtonClicked?: (e: React.MouseEvent<HTMLButtonElement>, isLoud: boolean, video: HTMLVideoElement | null) => void
  onMuteButtonClicked?: (e: React.MouseEvent<HTMLButtonElement>, isLoud: boolean, video: HTMLVideoElement | null) => void
  onVolumeRangeChanged?: (e: React.ChangeEvent<HTMLInputElement>, targetVolume: number, currentVolume: number, video: HTMLVideoElement | null) => void
  onRateRangeChanged?: (e: React.ChangeEvent<HTMLInputElement>, targetRate: number, currentRate: number, video: HTMLVideoElement | null) => void
  onFullscreenButtonClicked?: (e: React.MouseEvent<HTMLButtonElement>, isFullscreen: boolean, video: HTMLVideoElement | null) => void
  onTimelineClicked?: (e: React.MouseEvent<HTMLDivElement>, targetTime: number, currentTime: number, video: HTMLVideoElement | null) => void
  onIsPlayingChanged?: (isPlaying: boolean) => void
  onIsFullscreenChanged?: (isFullscreen: boolean) => void
  onIsLoudChanged?: (isLoud: boolean) => void
  onVolumeChanged?: (volume: number) => void
  onPlaybackRateChanged?: (playbackRate: number) => void
  onCurrentTimeMsChanged?: (currentTimeMs: number) => void
  onFullscreenChange?: (isFullscreen: boolean) => void
}> & VideoHTMLAttributes<HTMLVideoElement>>

/**
 * Full-featured video player component. Wraps a native `<video>` element with
 * playback controls, volume, playback rate, a timeline, optional subtitles
 * and viewport-driven auto-play/mute behaviours.
 *
 * ### Root element modifiers
 * The root `<figure>` receives the public class name defined by `video` and
 * the following BEM-style modifier classes:
 * - `--play-on` / `--play-off` — reflects current playback state.
 * - `--fullscreen-on` / `--fullscreen-off` — reflects fullscreen state.
 * - `--loud` / `--muted` — reflects mute state.
 *
 * ### Data attributes on the root element
 * - `data-play-on` — present (empty string) when playing.
 * - `data-play-off` — present (empty string) when paused.
 * - `data-fullscreen-on` — present (empty string) when in fullscreen.
 * - `data-fullscreen-off` — present (empty string) when not in fullscreen.
 * - `data-loud` — present (empty string) when unmuted.
 * - `data-muted` — present (empty string) when muted.
 * - `data-volume` — current volume as a `0–1` float.
 * - `data-volume-percent` — current volume as a `0–100` float.
 * - `data-playback-rate` — current playback rate (e.g. `1`, `1.5`).
 * - `data-current-time-ms` — current time in milliseconds, fixed to 2 decimals.
 * - `data-current-time-ratio` — current / total ratio, fixed to 8 decimals.
 * - `data-total-time-ms` — total duration in milliseconds.
 *
 * ### CSS custom properties on the root element
 * - `--video-current-time-ratio` — current / total ratio, fixed to 8 decimals.
 * Useful for driving progress-bar animations purely in CSS.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A `<figure>` element containing the video, its controls, optional
 * subtitles.
 */
export const ControlledVideo: FunctionComponent<Props> = ({
  sources,
  tracks,
  subtitles,
  playBtnContent,
  pauseBtnContent,
  loudBtnContent,
  muteBtnContent,
  fullscreenBtnContent,
  play,
  fullscreen,
  mute,
  muted,
  volume = 1,
  playbackRate = 1,
  currentTimeMs: givenCurrentTimeMs,
  onPlayButtonClicked,
  onPauseButtonClicked,
  onLoudButtonClicked,
  onMuteButtonClicked,
  onVolumeRangeChanged,
  onRateRangeChanged,
  onFullscreenButtonClicked,
  onTimelineClicked,
  onIsPlayingChanged,
  onIsFullscreenChanged,
  onIsLoudChanged,
  onVolumeChanged,
  onPlaybackRateChanged,
  onCurrentTimeMsChanged,
  onFullscreenChange,
  children,
  className,
  ...intrinsicVideoAttributes
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [totalTime, setTotalTime] = useState(0)
  const totalTimeMs = useMemo(() => secondsToMs(totalTime), [totalTime])

  const [internalCurrentTimeMs, setInternalCurrentTimeMs] = useState(0)

  const isTimeControlled = givenCurrentTimeMs !== undefined

  // The parent owns the time as soon as it provides one, so that is what gets
  // displayed — not what the element reported one render later.
  const currentTimeMs = givenCurrentTimeMs ?? internalCurrentTimeMs
  const currentTime = useMemo(() => msToSeconds(currentTimeMs), [currentTimeMs])

  const volumePercent = useMemo(() => volume * 100, [volume])

  // Every state item this component displays is read from its props, never from
  // the element: it is the parent's job to keep them in sync.
  const isPlaying = play ?? false
  const isLoud = !(mute ?? false)
  const isFullscreen = fullscreen ?? false

  // Intrinsic event handler
  const handleMetadataLoadEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (videoRef.current === null) return
    const video = videoRef.current
    setTotalTime(video.duration)
    // A seek asked for before the metadata landed was silently dropped by the
    // element — replay it now that it can be honoured.
    if (givenCurrentTimeMs !== undefined) video.currentTime = msToSeconds(givenCurrentTimeMs)
    intrinsicVideoAttributes.onLoadedMetadata?.(e)
  }, [intrinsicVideoAttributes.onLoadedMetadata, givenCurrentTimeMs])

  const handleOnTimeUpdateEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const newTimeMs = secondsToMs(video.currentTime)
    setInternalCurrentTimeMs(newTimeMs)
    if (intrinsicVideoAttributes.onTimeUpdate !== undefined) intrinsicVideoAttributes.onTimeUpdate(e)
  }, [intrinsicVideoAttributes.onTimeUpdate])

  // Custom action handlers
  const handlePlayButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const wasPlaying = videoRef.current?.paused === false
    onPlayButtonClicked?.(e, wasPlaying, videoRef.current)
  }, [onPlayButtonClicked])

  const handlePauseButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const wasPlaying = videoRef.current?.paused === false
    onPauseButtonClicked?.(e, wasPlaying, videoRef.current)
  }, [onPauseButtonClicked])

  const handleLoudButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onLoudButtonClicked?.(e, isLoud, videoRef.current)
  }, [onLoudButtonClicked, isLoud])

  const handleMuteButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onMuteButtonClicked?.(e, isLoud, videoRef.current)
  }, [onMuteButtonClicked, isLoud])

  const handleFullscreenButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onFullscreenButtonClicked?.(e, isFullscreen, videoRef.current)
  }, [onFullscreenButtonClicked, isFullscreen])

  const handleVolumeRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVolume = Number(e.currentTarget.value) / 100
    onVolumeRangeChanged?.(e, targetVolume, volume, videoRef.current)
  }, [onVolumeRangeChanged, volume])

  const handleRateRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onRateRangeChanged?.(e, Number(e.currentTarget.value), playbackRate, videoRef.current)
  }, [onRateRangeChanged, playbackRate])

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current === null) return
    const progress = getTimelineClickProgress(e)
    const targetTime = progress * totalTime
    onTimelineClicked?.(e, targetTime, currentTime, videoRef.current)
    // A controlled time is the parent's to move: it is expected to update the
    // prop in response to this very handler.
    if (!isTimeControlled) {
      videoRef.current.currentTime = targetTime
    }
  }, [onTimelineClicked, totalTime, currentTime, isTimeControlled])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    'play-on': isPlaying,
    'play-off': !isPlaying,
    'fullscreen-on': isFullscreen,
    'fullscreen-off': !isFullscreen,
    'loud': isLoud,
    'muted': !isLoud
  }), className)

  // Guarded: the duration is unknown until the metadata lands, and an unguarded
  // division would expose the string 'NaN' on every render until then.
  const currentTimeRatio = totalTime > 0 ? currentTime / totalTime : 0
  const rootAttributes = {
    'data-play-on': isPlaying ? '' : undefined,
    'data-play-off': !isPlaying ? '' : undefined,
    'data-fullscreen-on': isFullscreen ? '' : undefined,
    'data-fullscreen-off': !isFullscreen ? '' : undefined,
    'data-loud': isLoud ? '' : undefined,
    'data-muted': !isLoud ? '' : undefined,
    'data-volume': volume.toFixed(8),
    'data-volume-percent': volumePercent,
    'data-playback-rate': playbackRate,
    'data-current-time-ms': currentTimeMs.toFixed(2),
    'data-current-time-ratio': currentTimeRatio.toFixed(8),
    'data-total-time-ms': totalTimeMs
  }

  const rootStyles: Record<string, string> = {
    [`--${publicClassName}-current-time-ratio`]: currentTimeRatio.toFixed(8)
  }

  const parsedSources = useMemo(() => {
    if (sources === undefined) return []
    if (typeof sources === 'string') return [{ src: sources }]
    if (Array.isArray(sources)) {
      if (sources.length === 0) return []
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element sampled just above; array is expected to be homogeneous
      if (typeof sources[0] === 'string') return (sources as string[]).map(src => ({ src }))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element was checked not to be a string just above; array is expected to be homogeneous
      return sources as SourceData[]
    }
    return []
  }, [sources])

  const parsedTracks = useMemo(() => {
    if (tracks === undefined) return []
    if (typeof tracks === 'string') return [{ src: tracks }]
    if (Array.isArray(tracks)) {
      if (tracks.length === 0) return []
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element sampled just above; array is expected to be homogeneous
      if (typeof tracks[0] === 'string') return (tracks as string[]).map(src => ({ src }))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element was checked not to be a string just above; array is expected to be homogeneous
      return tracks as TrackData[]
    }
    return []
  }, [tracks])

  const videoClss = c('video')
  const videoControlsClss = c('video-controls')
  const playBtnClss = c('play-btn')
  const pauseBtnClss = c('pause-btn')
  const loudBtnClss = c('loud-btn')
  const muteBtnClss = c('mute-btn')
  const volumePcntClss = c('volume-percent')
  const fullscreenBtnClss = c('fullscreen-btn')
  const volumeRangeClss = c('volume-range')
  const playbackRateRangeClss = c('playback-rate-range')
  const playbackRateClss = c('playback-rate')
  const timeControlsClss = c('time-controls')
  const currentTimeClss = c('current-time')
  const totalTimeClss = c('total-time')
  const timelineClss = c('timeline')

  useEffect(() => {
    forcePlaybackRate(videoRef.current, playbackRate)
  }, [playbackRate])

  useEffect(() => {
    if (fullscreen === true) {
      void forceFullscreen(videoRef.current)
    }
    return () => {
      void forceExitFullscreen(videoRef.current)
    }
  }, [fullscreen])

  useEffect(() => {
    // A controlled time belongs to the parent, and a playing element advances
    // the time on its own — so the two cannot coexist. Applied once, on entering
    // the mode, rather than fought on every tick.
    if (isTimeControlled) {
      void forcePause(videoRef.current)
      return
    }
    if (play === true) {
      void forcePlay(videoRef.current)
    } else {
      void forcePause(videoRef.current)
    }
  }, [play, isTimeControlled])

  useEffect(() => {
    forceVolume(videoRef.current, volume)
  }, [volume])

  useEffect(() => {
    if (givenCurrentTimeMs === undefined || videoRef.current === null) return
    videoRef.current.currentTime = msToSeconds(givenCurrentTimeMs)
  }, [givenCurrentTimeMs])

  useEffect(() => {
    if (mute === true) {
      forceMute(videoRef.current)
    } else {
      forceLoud(videoRef.current)
    }
  }, [mute])

  // The browser can leave fullscreen without going through our button — Escape,
  // or the platform's own exit gesture. Nothing in React reports it, so the real
  // event is the only way for a parent to keep its `fullscreen` prop truthful.
  useEffect(() => {
    if (onFullscreenChange === undefined) return
    const onDocumentFullscreenChange = (): void => {
      onFullscreenChange(document.fullscreenElement !== null)
    }
    document.addEventListener('fullscreenchange', onDocumentFullscreenChange)
    return () => { document.removeEventListener('fullscreenchange', onDocumentFullscreenChange) }
  }, [onFullscreenChange])

  // State handlers
  useChangeDispatch(currentTimeMs, onCurrentTimeMsChanged)
  useChangeDispatch(isPlaying, onIsPlayingChanged)
  useChangeDispatch(isFullscreen, onIsFullscreenChanged)
  useChangeDispatch(isLoud, onIsLoudChanged)
  useChangeDispatch(volume, onVolumeChanged)
  useChangeDispatch(playbackRate, onPlaybackRateChanged)

  return <figure
    className={rootClss}
    style={rootStyles}
    {...rootAttributes}>
    {/* Video */}
    <video
      ref={videoRef}
      className={videoClss}
      {...intrinsicVideoAttributes}
      autoPlay={isTimeControlled ? false : intrinsicVideoAttributes.autoPlay}
      onLoadedMetadata={handleMetadataLoadEvent}
      onTimeUpdate={handleOnTimeUpdateEvent}>
      {/* Sources */}
      {parsedSources.map((source, index) => typeof source === 'string'
        ? <source
          key={index}
          src={source} />
        : <source
          key={index}
          src={source.src}
          type={source.type} />
      )}
      {/* Tracks */}
      {parsedTracks.map((track, index) => typeof track === 'string'
        ? <track
          key={index}
          src={track} />
        : <track
          key={index}
          src={track.src}
          kind={track.kind}
          srcLang={track.srclang}
          label={track.label}
          default={track.default} />
      )}
      {/* Children */}
      { children }
    </video>

    {/* Video Controls */}
    <div className={videoControlsClss}>
      {/* Play / pause */}
      <button
        className={playBtnClss}
        onClick={handlePlayButtonClick}>{playBtnContent}</button>
      <button
        className={pauseBtnClss}
        onClick={handlePauseButtonClick}>{pauseBtnContent}</button>
      {/* Loud / mute */}
      <button
        className={loudBtnClss}
        onClick={handleLoudButtonClick}>{loudBtnContent}</button>
      <button
        className={muteBtnClss}
        onClick={handleMuteButtonClick}>{muteBtnContent}</button>
      {/* Volume */}
      <input
        type='range'
        className={volumeRangeClss}
        value={volumePercent}
        onChange={handleVolumeRangeChange}
        min={0}
        max={100}
        step={1} />
      <span className={volumePcntClss}>{Math.round(volumePercent)}</span>
      {/* Fullscreen */}
      <button
        className={fullscreenBtnClss}
        onClick={handleFullscreenButtonClick}>{fullscreenBtnContent}</button>
      {/* Playback rate */}
      <input
        type='range'
        className={playbackRateRangeClss}
        value={playbackRate}
        onChange={handleRateRangeChange}
        min={0.25}
        max={4}
        step={0.25} />
      <span className={playbackRateClss}>{playbackRate}</span>
    </div>

    {/* Time controls */}
    <div className={timeControlsClss}>
      {/* Current time */}
      <span className={currentTimeClss}>
        {formatDuration(currentTimeMs, 'mm:ss:ms')}
      </span>
      {/* Total time */}
      <span className={totalTimeClss}>
        {formatDuration(totalTimeMs, 'mm:ss:ms')}
      </span>
      {/* Timeline */}
      <div
        className={timelineClss}
        onClick={handleTimelineClick} />
    </div>

    {/* Subtitles */}
    {subtitles !== undefined && <Subtitles
      {...subtitles}
      timecodeMs={currentTimeMs} />}
  </figure>
}
