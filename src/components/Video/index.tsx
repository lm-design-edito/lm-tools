import {
  type FunctionComponent,
  type PropsWithChildren,
  type VideoHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import {
  Disclaimer,
  type Props as DisclaimerProps
} from '../Disclaimer/index.js'
import { IntersectionObserverComponent } from '../IntersectionObserver/index.js'
import {
  Subtitles,
  type Props as SubsProps
} from '../Subtitles/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { video as publicClassName } from '../public-classnames.js'
import {
  formatTime,
  secondsToMs,
  muteAttributeWorkaround,
  forcePlay,
  forcePause,
  forceLoud,
  forceMute,
  forceFullScreen,
  forceExitFullScreen,
  forceVolume,
  forceCurrentTime,
  getTimelineClickProgress,
  forcePlaybackRate
} from './utils.js'
import cssModule from './styles.module.css'

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

type ActionHandlersProps = {
  playButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    isPlaying: boolean,
    video: HTMLVideoElement | null
  ) => void
  pauseButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    isPlaying: boolean,
    video: HTMLVideoElement | null
  ) => void
  loudButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    isLoud: boolean,
    video: HTMLVideoElement | null
  ) => void
  muteButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    isLoud: boolean,
    video: HTMLVideoElement | null
  ) => void
  volumeRangeChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    targetRangeVolume: number,
    volume: number,
    video: HTMLVideoElement | null
  ) => void
  fullscreenButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    isFullscreen: boolean,
    video: HTMLVideoElement | null
  ) => void
  rateRangeChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    targetRangeRate: number,
    rate: number,
    video: HTMLVideoElement | null
  ) => void
  timelineClick?: (
    e: React.MouseEvent<HTMLDivElement>,
    targetTimeSec: number,
    timeSec: number,
    video: HTMLVideoElement | null
  ) => void
}

type StateHandlersProps = {
  isPlaying?: (isPlaying: boolean) => void
  isFullScreen?: (isFullScreen: boolean) => void
  isLoud?: (isLoud: boolean) => void
  volume?: (volume: number) => void
  currentTime?: (currentTime: number) => void
  playbackRate?: (rate: number) => void
}

/**
 * Props for the {@link Video} component.
 *
 * Extends all native `VideoHTMLAttributes<HTMLVideoElement>`, so any standard
 * video attribute (`autoPlay`, `muted`, `loop`, `poster`, etc.) can be passed
 * and will be forwarded to the underlying `<video>` element.
 *
 * @property sources - One or more video sources. Accepts:
 * - a single URL string,
 * - an array of URL strings,
 * - an array of {@link SourceData} objects for fine-grained `type` control.
 * @property tracks - One or more text tracks. Accepts:
 * - a single URL string,
 * - an array of URL strings,
 * - an array of {@link TrackData} objects.
 * @property playBtnContent - Custom content for the play button.
 * @property pauseBtnContent - Custom content for the pause button.
 * @property loudBtnContent - Custom content for the unmute button.
 * @property muteBtnContent - Custom content for the mute button.
 * @property fullScreenBtnContent - Custom content for the fullScreen button.
 * @property subtitles - Props forwarded to the internal {@link Subtitles} component.
 * `timecodeMs` is injected automatically from the current playback position.
 * @property disclaimer - Props forwarded to the internal {@link Disclaimer} component.
 * While the disclaimer is active, `autoPlay` and `muted` are suppressed on the
 * underlying `<video>` element.
 * @property autoPlayWhenVisible - When `true`, triggers playback the first time the
 * component intersects the viewport, provided no disclaimer is active.
 * @property autoPauseWhenHidden - When `true`, pauses playback whenever the component
 * leaves the viewport.
 * @property autoLoudWhenVisible - When `true`, unmutes the video the first time the
 * component intersects the viewport, provided no disclaimer is active.
 * @property autoMuteWhenHidden - When `true`, mutes the video whenever the component
 * leaves the viewport.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the `<video>` element itself
 * (e.g. fallback content).
 */
export type Props = PropsWithChildren<WithClassName<{
  sources?: string | string[] | SourceData[]
  tracks?: string | string[] | TrackData[]
  playBtnContent?: React.ReactNode
  pauseBtnContent?: React.ReactNode
  loudBtnContent?: React.ReactNode
  muteBtnContent?: React.ReactNode
  fullScreenBtnContent?: React.ReactNode
  subtitles?: SubsProps
  disclaimer?: DisclaimerProps
  autoPlayWhenVisible?: boolean
  autoPauseWhenHidden?: boolean
  autoLoudWhenVisible?: boolean
  autoMuteWhenHidden?: boolean
  actionHandlers: ActionHandlersProps
  stateHandlers: StateHandlersProps
}> & VideoHTMLAttributes<HTMLVideoElement>>

/**
 * Full-featured video player component. Wraps a native `<video>` element with
 * playback controls, volume, playback rate, a timeline, optional subtitles,
 * an optional disclaimer gate, and viewport-driven auto-play/mute behaviours.
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
 * - `data-fullscreen-on` — present (empty string) when in fullScreen.
 * - `data-fullscreen-off` — present (empty string) when not in fullScreen.
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
 * subtitles, and an optional disclaimer overlay.
 */
export const Video: FunctionComponent<Props> = ({
  sources,
  tracks,
  playBtnContent,
  pauseBtnContent,
  loudBtnContent,
  muteBtnContent,
  fullScreenBtnContent,
  subtitles,
  disclaimer,
  autoPlayWhenVisible,
  autoPauseWhenHidden,
  autoLoudWhenVisible,
  autoMuteWhenHidden,
  actionHandlers,
  stateHandlers,
  children,
  className,
  ...intrinsicVideoAttributes
}) => {
  // State & refs
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isLoud, setIsLoud] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [volume, setVolume] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(0)
  const [hasBeenAutoPlayed, setHasBeenAutoPlayed] = useState(false)
  const [isDisclaimerOn, setIsDisclaimerOn] = useState(
    disclaimer?.isOn === true
    || disclaimer?.defaultIsOn === true
    || (disclaimer !== undefined && disclaimer.defaultIsOn === undefined)
  )
  let shouldDisclaimerBeOn = isDisclaimerOn
  if (disclaimer?.isOn === true) { shouldDisclaimerBeOn = true }
  if (disclaimer?.isOn === false) { shouldDisclaimerBeOn = false }
  const currentTimeMs = secondsToMs(currentTime)
  const totalTimeMs = useMemo(() => secondsToMs(totalTime), [totalTime])
  const volumePercent = useMemo(() => volume * 100, [volume])
  const videoRef = useRef<HTMLVideoElement>(null)
  const $root = useRef<HTMLElement>(null)

  // Intrinsic event handlers
  const handleMetadataLoadEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (videoRef.current === null) return
    const video = videoRef.current
    muteAttributeWorkaround(
      video,
      intrinsicVideoAttributes.muted ?? false,
      setIsLoud
    )
    setTotalTime(video.duration)
    setPlaybackRate(video.playbackRate)
    setVolume(video.volume)
    setIsLoud(!video.muted)
    intrinsicVideoAttributes.onLoadedMetadata?.(e)
  }, [intrinsicVideoAttributes.onLoadedMetadata, intrinsicVideoAttributes.muted])

  const handleVolumeChangeEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const volume = e.currentTarget.volume
    setVolume(volume)
    intrinsicVideoAttributes.onVolumeChange?.(e)
  }, [intrinsicVideoAttributes.onVolumeChange])

  const handlePlayEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    setIsPlaying(true)
    setHasBeenAutoPlayed(true)
    intrinsicVideoAttributes.onPlay?.(e)
  }, [intrinsicVideoAttributes.onPlay])

  const handlePauseEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    setIsPlaying(false)
    intrinsicVideoAttributes.onPause?.(e)
  }, [intrinsicVideoAttributes.onPause])

  const handleRateChangeEvent = useCallback((e: React.ChangeEvent<HTMLVideoElement>) => {
    const currentRate = e.currentTarget.playbackRate
    setPlaybackRate(currentRate)
    intrinsicVideoAttributes.onRateChange?.(e)
  }, [intrinsicVideoAttributes.onRateChange])

  const handleTimeUpdateEvent = useCallback((e: React.ChangeEvent<HTMLVideoElement>) => {
    const currentTime = e.currentTarget.currentTime
    setCurrentTime(currentTime)
    intrinsicVideoAttributes?.onTimeUpdate?.(e)
  }, [totalTime, intrinsicVideoAttributes.onTimeUpdate])

  // User action handlers
  const handleVolumeRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVolume = Number(e.currentTarget.value)
    actionHandlers?.volumeRangeChange?.(e, targetVolume, volume, videoRef.current)
    forceVolume(videoRef.current, targetVolume, setVolume)
  }, [actionHandlers?.volumeRangeChange, volume])

  const handleLoudButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    actionHandlers?.loudButtonClick?.(e, isLoud, videoRef.current)
    forceLoud(videoRef.current, setIsLoud)
  }, [actionHandlers?.loudButtonClick, isLoud])

  const handleMuteButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    actionHandlers?.muteButtonClick?.(e, isLoud, videoRef.current)
    forceMute(videoRef.current, setIsLoud)
  }, [actionHandlers?.muteButtonClick, isLoud])

  const handlePlayButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    actionHandlers?.playButtonClick?.(e, isPlaying, videoRef.current)
    void forcePlay(videoRef.current, shouldDisclaimerBeOn, setIsPlaying)
  }, [actionHandlers?.playButtonClick, isPlaying, shouldDisclaimerBeOn])

  const handlePauseButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    actionHandlers?.pauseButtonClick?.(e, isPlaying, videoRef.current)
    forcePause(videoRef.current, setIsPlaying)
  }, [actionHandlers?.pauseButtonClick, isPlaying])

  const handleFullScreenButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    actionHandlers?.fullscreenButtonClick?.(e, isFullScreen, videoRef.current)
    if (isFullScreen) void forceExitFullScreen(videoRef.current, setIsFullScreen)
    else void forceFullScreen(videoRef.current, shouldDisclaimerBeOn, setIsFullScreen)
  }, [isFullScreen, shouldDisclaimerBeOn])

  const handleRateRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = Number(e.currentTarget.value)
    actionHandlers?.rateRangeChange?.(e, rate, playbackRate, videoRef.current)
    forcePlaybackRate(videoRef.current, rate, setPlaybackRate)
  }, [actionHandlers?.rateRangeChange, playbackRate])

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const progress = getTimelineClickProgress(e, e.currentTarget, videoRef.current)
    const time = progress * totalTime
    actionHandlers?.timelineClick?.(e, time, currentTime, videoRef.current)
    forceCurrentTime(videoRef.current, time, setCurrentTime)
  }, [actionHandlers?.timelineClick, totalTime, currentTime])

  // Disclaimer handlers
  const handleDisclaimerDismiss = useCallback(() => {
    setIsDisclaimerOn(false)
    if (intrinsicVideoAttributes.autoPlay === true
      && !hasBeenAutoPlayed) void forcePlay(videoRef.current, shouldDisclaimerBeOn, setIsPlaying)
  }, [disclaimer, intrinsicVideoAttributes.autoPlay, shouldDisclaimerBeOn])

  useEffect(() => {
    if (isDisclaimerOn !== shouldDisclaimerBeOn) setIsDisclaimerOn(shouldDisclaimerBeOn)
    if (shouldDisclaimerBeOn) {
      forceMute(videoRef.current, setIsLoud)
      forcePause(videoRef.current, setIsPlaying)
      void forceExitFullScreen(videoRef.current, setIsFullScreen)
    } else if (intrinsicVideoAttributes.autoPlay === true) {
      if (videoRef.current === null) return
      if (hasBeenAutoPlayed) return
      if (videoRef.current.paused) void forcePlay(videoRef.current, shouldDisclaimerBeOn, setIsPlaying)
    }
  }, [
    shouldDisclaimerBeOn,
    intrinsicVideoAttributes,
    hasBeenAutoPlayed
  ])

  useEffect(() => {
    if (stateHandlers?.isPlaying) stateHandlers.isPlaying(isPlaying)
  }, [isPlaying])

  useEffect(() => {
    if (stateHandlers?.isFullScreen) stateHandlers.isFullScreen(isFullScreen)
  }, [isFullScreen])

  useEffect(() => {
    if (stateHandlers?.isLoud) stateHandlers.isLoud(isLoud)
  }, [isLoud])

  useEffect(() => {
    if (stateHandlers?.volume) stateHandlers.volume(volume)
  }, [volume])

  useEffect(() => {
    if (stateHandlers?.playbackRate) stateHandlers.playbackRate(playbackRate)
  }, [playbackRate])

  useEffect(() => {
    if (stateHandlers?.currentTime) stateHandlers.currentTime(currentTime)
  }, [currentTime])

  // Parsing sources & tracks props
  const parsedSources = useMemo(() => {
    if (sources === undefined) return []
    if (typeof sources === 'string') return [{ src: sources }]
    if (Array.isArray(sources)) {
      if (sources.length === 0) return []
      if (typeof sources[0] === 'string') return (sources as string[]).map(src => ({ src }))
      return sources as SourceData[]
    }
    return []
  }, [sources])

  const parsedTracks = useMemo(() => {
    if (tracks === undefined) return []
    if (typeof tracks === 'string') return [{ src: tracks }]
    if (Array.isArray(tracks)) {
      if (tracks.length === 0) return []
      if (typeof tracks[0] === 'string') return (tracks as string[]).map(src => ({ src }))
      return tracks as TrackData[]
    }
    return []
  }, [tracks])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    'play-on': isPlaying,
    'play-off': !isPlaying,
    'fullscreen-on': isFullScreen,
    'fullscreen-off': !isFullScreen,
    'loud': isLoud,
    'muted': !isLoud
  }), className)
  const rootAttributes = {
    'data-play-on': isPlaying ? '' : undefined,
    'data-play-off': !isPlaying ? '' : undefined,
    'data-fullscreen-on': isFullScreen ? '' : undefined,
    'data-fullscreen-off': !isFullScreen ? '' : undefined,
    'data-loud': isLoud ? '' : undefined,
    'data-muted': !isLoud ? '' : undefined,
    'data-volume': volume,
    'data-volume-percent': volumePercent,
    'data-playback-rate': playbackRate,
    'data-current-time-ms': currentTimeMs.toFixed(2),
    'data-current-time-ratio': (currentTime / totalTime).toFixed(8),
    'data-total-time-ms': totalTimeMs
  }
  const rootStyles: Record<string, string> = {
    [`--${publicClassName}-elapsed-time-ratio`]: (currentTime / totalTime).toFixed(8)
  }

  const videoClss = c('video')
  const videoControlsClss = c('video-controls')
  const playBtnClss = c('play-btn')
  const pauseBtnClss = c('pause-btn')
  const loudBtnClss = c('loud-btn')
  const muteBtnClss = c('mute-btn')
  const volumePcntClss = c('volume-percent')
  const fullScreenBtnClss = c('fullscreen-btn')
  const volumeRangeClss = c('volume-range')
  const playbackRateRangeClss = c('playback-rate-range')
  const playbackRateClss = c('playback-rate')
  const timeControlsClss = c('time-controls')
  const currentTimeClss = c('current-time')
  const totalTimeClss = c('total-time')
  const timelineClss = c('timeline')

  const sensitiveContent = <>
    {/* Vidéo */}
    <video
      ref={videoRef}
      className={videoClss}
      onVolumeChange={handleVolumeChangeEvent}
      onLoadedMetadata={handleMetadataLoadEvent}
      onPlay={handlePlayEvent}
      onPause={handlePauseEvent}
      onTimeUpdate={handleTimeUpdateEvent}
      onRateChange={handleRateChangeEvent}
      {...intrinsicVideoAttributes}
      autoPlay={shouldDisclaimerBeOn ? false : intrinsicVideoAttributes.autoPlay}
      muted={shouldDisclaimerBeOn ? true : intrinsicVideoAttributes.muted}>
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
      <button className={playBtnClss} onClick={handlePlayButtonClick}>{playBtnContent}</button>
      <button className={pauseBtnClss} onClick={handlePauseButtonClick}>{pauseBtnContent}</button>
      {/* Loud / mute */}
      <button className={loudBtnClss} onClick={handleLoudButtonClick}>{loudBtnContent}</button>
      <button className={muteBtnClss} onClick={handleMuteButtonClick}>{muteBtnContent}</button>
      {/* Volume */}
      <input
        type="range"
        className={volumeRangeClss}
        value={volumePercent}
        onChange={handleVolumeRangeChange}
        min={0}
        max={100}
        step={1} />
      <span className={volumePcntClss}>{volumePercent}</span>
      {/* FullScreen */}
      <button className={fullScreenBtnClss} onClick={handleFullScreenButtonClick}>{fullScreenBtnContent}</button>
      {/* Playback rate */}
      <input
        type="range"
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
        {formatTime(currentTimeMs, 'mm:ss:ms')}
      </span>
      {/* Total time */}
      <span className={totalTimeClss}>
        {formatTime(totalTimeMs, 'mm:ss:ms')}
      </span>
      {/* Timeline */}
      <div className={timelineClss} onClick={handleTimelineClick} />
    </div>

    {/* Subtitles */}
    {subtitles !== undefined && <Subtitles
      {...subtitles}
      timecodeMs={currentTimeMs} />}
  </>

  const disclaimedContent = disclaimer !== undefined
    ? <Disclaimer
      {...disclaimer}
      isOn={shouldDisclaimerBeOn}
      actionHandlers={{
        dismissClick: handleDisclaimerDismiss
      }}>
      {sensitiveContent}
    </Disclaimer>
    : sensitiveContent

  const observedContent = autoLoudWhenVisible === true
    || autoMuteWhenHidden === true
    || autoPlayWhenVisible === true
    || autoPauseWhenHidden === true
    ? <IntersectionObserverComponent onIntersected={({ ioEntry }) => {
      const { isIntersecting = false } = ioEntry ?? {}
      if (autoMuteWhenHidden === true && !isIntersecting) forceMute(videoRef.current, setIsLoud)
      if (autoPauseWhenHidden === true && !isIntersecting) forcePause(videoRef.current, setIsPlaying)
      if (autoPlayWhenVisible === true
        && !hasBeenAutoPlayed
        && !shouldDisclaimerBeOn
        && isIntersecting) void forcePlay(videoRef.current, shouldDisclaimerBeOn, setIsPlaying)
      if (autoLoudWhenVisible === true
        && !hasBeenAutoPlayed
        && !shouldDisclaimerBeOn
        && isIntersecting) forceLoud(videoRef.current, setIsLoud)
    }}>
      {disclaimedContent}
    </IntersectionObserverComponent>
    : disclaimedContent

  return <figure
    className={rootClss}
    {...rootAttributes}
    ref={$root}
    style={rootStyles}>
    {observedContent}
  </figure>
}
