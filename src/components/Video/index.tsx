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
  forceExitFullScreen
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
 * @property playBtnContent - Custom content for the play button. Defaults to `'play'`.
 * @property pauseBtnContent - Custom content for the pause button. Defaults to `'pause'`.
 * @property soundOnBtnContent - Custom content for the unmute button. Defaults to `'sound on'`.
 * @property soundOffBtnContent - Custom content for the mute button. Defaults to `'sound off'`.
 * @property fullscreenBtnContent - Custom content for the fullscreen button. Defaults to `'fullscreen'`.
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
  soundOnBtnContent?: React.ReactNode
  soundOffBtnContent?: React.ReactNode
  fullscreenBtnContent?: React.ReactNode
  subtitles?: SubsProps
  disclaimer?: DisclaimerProps
  autoPlayWhenVisible?: boolean
  autoPauseWhenHidden?: boolean
  autoLoudWhenVisible?: boolean
  autoMuteWhenHidden?: boolean
}> & VideoHTMLAttributes<HTMLVideoElement>>

/**
 * Full-featured video player component. Wraps a native `<video>` element with
 * playback controls, volume, playback speed, a timeline, optional subtitles,
 * an optional disclaimer gate, and viewport-driven auto-play/mute behaviours.
 *
 * ### Root element modifiers
 * The root `<figure>` receives the public class name defined by `video` and
 * the following BEM-style modifier classes:
 * - `--play-on` / `--play-off` — reflects current playback state.
 * - `--fullscreen-on` / `--fullscreen-off` — reflects fullscreen state.
 * - `--sound-on` / `--sound-off` — reflects mute state.
 *
 * ### Data attributes on the root element
 * - `data-play-on` — present (empty string) when playing.
 * - `data-play-off` — present (empty string) when paused.
 * - `data-fullscreen-on` — present (empty string) when in fullscreen.
 * - `data-fullscreen-off` — present (empty string) when not in fullscreen.
 * - `data-sound-on` — present (empty string) when unmuted.
 * - `data-sound-off` — present (empty string) when muted.
 * - `data-sound-volume` — current volume as a `0–1` float.
 * - `data-sound-volume-percent` — current volume as a `0–100` float.
 * - `data-playback-speed` — current playback rate (e.g. `1`, `1.5`).
 * - `data-elapsed-time-ms` — elapsed time in milliseconds, fixed to 2 decimals.
 * - `data-elapsed-time-ratio` — elapsed / total ratio, fixed to 8 decimals.
 * - `data-total-time-ms` — total duration in milliseconds.
 *
 * ### CSS custom properties on the root element
 * - `--video-elapsed-time-ratio` — elapsed / total ratio, fixed to 8 decimals.
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
  soundOnBtnContent,
  soundOffBtnContent,
  fullscreenBtnContent,
  subtitles,
  disclaimer,
  autoPlayWhenVisible,
  autoPauseWhenHidden,
  autoLoudWhenVisible,
  autoMuteWhenHidden,
  children,
  className,
  ...intrinsicVideoAttributes
}) => {
  // State & refs
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [soundVolume, setSoundVolume] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(0)
  const [hasBeenAutoPlayed, setHasBeenAutoPlayed] = useState(false)
  const [isDisclaimerOn, setIsDisclaimerOn] = useState(
    disclaimer?.isOn === true
    || disclaimer?.defaultIsOn === true
    || (disclaimer !== undefined && disclaimer.defaultIsOn === undefined)
  )
  let shouldDisclaimerBeOn = isDisclaimerOn
  if (disclaimer?.isOn === true) { shouldDisclaimerBeOn = true }
  if (disclaimer?.isOn === false) { shouldDisclaimerBeOn = false }
  const elapsedTimeMs = secondsToMs(elapsedTime)
  const totalTimeMs = useMemo(() => secondsToMs(totalTime), [totalTime])
  const soundVolumePercent = useMemo(() => soundVolume * 100, [soundVolume])
  const $video = useRef<HTMLVideoElement>(null)
  const $root = useRef<HTMLElement>(null)

  // Intrinsic event handlers
  const handleMetadataLoadEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if ($video.current === null) return
    const video = $video.current
    muteAttributeWorkaround(
      video,
      intrinsicVideoAttributes.muted ?? false,
      setIsSoundOn
    )
    setTotalTime(video.duration)
    setPlaybackSpeed(video.playbackRate)
    setSoundVolume(video.volume)
    setIsSoundOn(!video.muted)
    intrinsicVideoAttributes.onLoadedMetadata?.(e)
  }, [])

  const handleVolumeChangeEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { volume } = e.currentTarget
    setSoundVolume(volume)
    intrinsicVideoAttributes.onVolumeChange?.(e)
  }, [])

  const handlePlayEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    setIsPlaying(true)
    setHasBeenAutoPlayed(true)
    intrinsicVideoAttributes.onPlay?.(e)
  }, [])

  const handlePauseEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    setIsPlaying(false)
    intrinsicVideoAttributes.onPause?.(e)
  }, [])

  const handleRateChangeEvent = useCallback((e: React.ChangeEvent<HTMLVideoElement>) => {
    const speed = e.currentTarget.playbackRate
    setPlaybackSpeed(speed)
    intrinsicVideoAttributes.onRateChange?.(e)
  }, [])

  const handleTimeUpdateEvent = useCallback((e: React.ChangeEvent<HTMLVideoElement>) => {
    const currentTime = e.currentTarget.currentTime
    setElapsedTime(currentTime)
    intrinsicVideoAttributes?.onTimeUpdate?.(e)
  }, [totalTime])

  // User action handlers
  const handleVolumeRangeChange = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
    // [WIP] faire un forceVolume dans utils.ts
    const volumePercent = Number(e.currentTarget.value)
    const volume = volumePercent / 100
    if ($video.current === null) return
    $video.current.volume = volume
  }, [])

  const handleSoundOnButtonClick = useCallback(() => {
    forceLoud($video.current, setIsSoundOn)
  }, [forceLoud])

  const handleSoundOffButtonClick = useCallback(() => {
    forceMute($video.current, setIsSoundOn)
  }, [])

  const handlePlayButtonClick = useCallback(() => {
    forcePlay($video.current, shouldDisclaimerBeOn, setIsPlaying)
  }, [forcePlay, shouldDisclaimerBeOn])

  const handlePauseButtonClick = useCallback(() => {
    forcePause($video.current, setIsPlaying)
  }, [])

  const handleFullScreenButtonClick = useCallback(() => {
    if (isFullscreen) void forceExitFullScreen($video.current, setIsFullscreen)
    else void forceFullScreen($video.current, shouldDisclaimerBeOn, setIsFullscreen)
  }, [isFullscreen, shouldDisclaimerBeOn])

  const handleRateRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // [WIP] faire un forcePlaybackRate dans utils.ts
    // Penser à mettre à jour le tableau de deps
    const speed = Number(e.currentTarget.value)
    if ($video.current === null) return
    $video.current.playbackRate = speed
  }, [])

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // [WIP] faire un forceCurrentTime dans utils.ts
    // Penser à mettre à jour le tableau de deps
    if ($video.current === null) return
    const timelineRect = e.currentTarget.getBoundingClientRect()
    const position = e.clientX - timelineRect.left
    const progress = Math.min(1, Math.max(0, position / timelineRect.width))
    $video.current.currentTime = progress * totalTime
  }, [])

  // Disclaimer handlers
  const handleDisclaimerDismiss = useCallback(() => {
    setIsDisclaimerOn(false)
    if (intrinsicVideoAttributes.autoPlay === true
      && !hasBeenAutoPlayed) void forcePlay($video.current, shouldDisclaimerBeOn, setIsPlaying)
  }, [disclaimer, intrinsicVideoAttributes.autoPlay, shouldDisclaimerBeOn])

  useEffect(() => {
    if (isDisclaimerOn !== shouldDisclaimerBeOn) setIsDisclaimerOn(shouldDisclaimerBeOn)
    if (shouldDisclaimerBeOn) {
      forceMute($video.current, setIsSoundOn)
      forcePause($video.current, setIsPlaying)
      void forceExitFullScreen($video.current, setIsFullscreen)
    } else if (intrinsicVideoAttributes.autoPlay === true) {
      if ($video.current === null) return
      if (hasBeenAutoPlayed) return
      if ($video.current.paused) void forcePlay($video.current, shouldDisclaimerBeOn, setIsPlaying)
    }
  }, [
    shouldDisclaimerBeOn,
    intrinsicVideoAttributes,
    hasBeenAutoPlayed
  ])

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
    'fullscreen-on': isFullscreen,
    'fullscreen-off': !isFullscreen,
    'sound-on': isSoundOn,
    'sound-off': !isSoundOn
  }), className)
  const rootAttributes = {
    'data-play-on': isPlaying ? '' : undefined,
    'data-play-off': !isPlaying ? '' : undefined,
    'data-fullscreen-on': isFullscreen ? '' : undefined,
    'data-fullscreen-off': !isFullscreen ? '' : undefined,
    'data-sound-on': isSoundOn ? '' : undefined,
    'data-sound-off': !isSoundOn ? '' : undefined,
    'data-sound-volume': soundVolume,
    'data-sound-volume-percent': soundVolumePercent,
    'data-playback-speed': playbackSpeed,
    'data-elapsed-time-ms': elapsedTimeMs.toFixed(2),
    'data-elapsed-time-ratio': (elapsedTime / totalTime).toFixed(8),
    'data-total-time-ms': totalTimeMs
  }
  const rootStyles: Record<string, string> = {
    [`--${publicClassName}-elapsed-time-ratio`]: (elapsedTime / totalTime).toFixed(8)
  }

  const videoClss = c('video')
  const videoControlsClss = c('video-controls')
  const playBtnClss = c('play-btn')
  const pauseBtnClss = c('pause-btn')
  const soundOnBtnClss = c('sound-on-btn')
  const soundOffBtnClss = c('sound-off-btn')
  const soundVolumePcntClss = c('sound-percent')
  const fullscreenBtnClss = c('fullscreen-btn')
  const volumeRangeClss = c('volume-range')
  const playbackSpeedRangeClss = c('playback-speed-range')
  const playbackSpeedClss = c('playback-speed')
  const timeControlsClss = c('time-controls')
  const elapsedTimeClss = c('elapsed-time')
  const totalTimeClss = c('total-time')
  const timelineClss = c('timeline')

  const sensitiveContent = <>
    {/* Vidéo */}
    <video
      ref={$video}
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
      <button className={playBtnClss} onClick={handlePlayButtonClick}>{playBtnContent ?? 'play'}</button>
      <button className={pauseBtnClss} onClick={handlePauseButtonClick}>{pauseBtnContent ?? 'pause'}</button>
      {/* Sound controls */}
      <button className={soundOnBtnClss} onClick={handleSoundOnButtonClick}>{soundOnBtnContent ?? 'sound on'}</button>
      <button className={soundOffBtnClss} onClick={handleSoundOffButtonClick}>{soundOffBtnContent ?? 'sound off'}</button>
      <input
        type="range"
        className={volumeRangeClss}
        value={soundVolumePercent}
        onChange={handleVolumeRangeChange}
        min={0}
        max={100}
        step={1} />
      {/* Volume label */}
      <span className={soundVolumePcntClss}>{soundVolumePercent}</span>
      {/* Fullscreen */}
      <button className={fullscreenBtnClss} onClick={handleFullScreenButtonClick}>{fullscreenBtnContent ?? 'fullscreen'}</button>
      {/* Playback speed */}
      <input
        type="range"
        className={playbackSpeedRangeClss}
        value={playbackSpeed}
        onChange={handleRateRangeChange}
        min={0.25}
        max={4}
        step={0.25} />
      <span className={playbackSpeedClss}>{playbackSpeed}</span>
    </div>

    {/* Time controls */}
    <div className={timeControlsClss}>
      {/* Elapsed time */}
      <span className={elapsedTimeClss}>
        {formatTime(elapsedTimeMs, 'mm:ss:ms')}
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
      timecodeMs={elapsedTimeMs} />}
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
      if (autoMuteWhenHidden === true && !isIntersecting) forceMute($video.current, setIsSoundOn)
      if (autoPauseWhenHidden === true && !isIntersecting) forcePause($video.current, setIsPlaying)
      if (autoPlayWhenVisible === true
        && !hasBeenAutoPlayed
        && !shouldDisclaimerBeOn
        && isIntersecting) void forcePlay($video.current, shouldDisclaimerBeOn, setIsPlaying)
      if (autoLoudWhenVisible === true
        && !hasBeenAutoPlayed
        && !shouldDisclaimerBeOn
        && isIntersecting) forceLoud($video.current, setIsSoundOn)
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
