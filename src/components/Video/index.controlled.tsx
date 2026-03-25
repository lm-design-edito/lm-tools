import { type FunctionComponent, type PropsWithChildren, type HTMLVideoElement, type VideoHTMLAttributes, type HTMLButtonElement, type HTMLInputElement, useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { clss, type ModsDescriptor } from '../../agnostic/css/clss/index.js'
import { type WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import cssModule from './styles.module.css'
import { video as publicClassName } from '../public-classnames.js'

import {
  Subtitles,
  type Props as SubsProps
} from '../Subtitles/index.js'
import { forceExitFullscreen, forceFullscreen, forceLoud, forceMute, forcePause, forcePlay, forcePlaybackRate, forceVolume, formatTime, getTimelineClickProgress, msToSeconds, secondsToMs } from './utils.js'

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

export type ActionHandlersProps = {
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
  loudButtonClick?: (e: React.MouseEvent<HTMLButtonElement>, isLoud: boolean, video: HTMLVideoElement | null) => void
  muteButtonClick?: (e: React.MouseEvent<HTMLButtonElement>, isLoud: boolean, video: HTMLVideoElement | null) => void
  volumeRangeChange?: (e: React.ChangeEvent<HTMLInputElement>, targetVolumePercent: number, currentVolumePercent: number, video: HTMLVideoElement | null) => void
  fullscreenButtonClick?: (e: React.MouseEvent<HTMLButtonElement>, isFullscreen: boolean, video: HTMLVideoElement | null) => void
  rateRangeChange?: (e: React.ChangeEvent<HTMLInputElement>, rate: number, video: HTMLVideoElement | null) => void
  timelineClick?: (e: React.MouseEvent<HTMLDivElement>, time: number, currentTime: number, video: HTMLVideoElement | null) => void
}

export type StateHandlerProps = {
  currentTime?: (currentTime: number) => void
}

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
  actionHandlers?: ActionHandlersProps
  _modifiers?: ModsDescriptor
}> & VideoHTMLAttributes<HTMLVideoElement>>

export const VideoControlled: FunctionComponent<Props> = ({
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
  volume,
  playbackRate = 1,
  currentTimeMs: givenCurrentTimeMs,
  actionHandlers,
  stateHandlers,
  children,
  className,
  _modifiers,
  ...intrinsicVideoAttributes
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [totalTime, setTotalTime] = useState(0)
  const totalTimeMs = useMemo(() => secondsToMs(totalTime), [totalTime])

  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const currentTime = useMemo(() => msToSeconds(currentTimeMs), [currentTimeMs])

  const isTimeControlled = useMemo(() => givenCurrentTimeMs !== undefined, [givenCurrentTimeMs])

  const volumePercent = useMemo(() => volume * 100, [volume])

  // Intrinsic event handler
  const handleMetadataLoadEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (videoRef.current === null) return
    const video = videoRef.current
    setTotalTime(Number(video.duration))
    intrinsicVideoAttributes.onLoadedMetadata?.(e)
  }, [intrinsicVideoAttributes.onLoadedMetadata])

  const handleOnTimeUpdateEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const newTimeMs = secondsToMs(Number(video.currentTime))
    setCurrentTimeMs(newTimeMs)
    if (intrinsicVideoAttributes?.onTimeUpdate !== undefined) {
      intrinsicVideoAttributes.onTimeUpdate(e)
    }
  }, [intrinsicVideoAttributes.onTimeUpdate])

  const handleOnPlayEvent = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    /* We must never play a video that has controlled time */
    if (isTimeControlled) {
      videoRef.current?.pause()
      return
    }
    intrinsicVideoAttributes.onPlay?.(e)
  }, [isTimeControlled, intrinsicVideoAttributes.onPlay])

  // Custom action handlers
  const handlePlayButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const isPlaying = videoRef.current !== undefined ? Boolean(videoRef.current.paused) : false
    actionHandlers?.playButtonClick?.(e, isPlaying, videoRef.current)
  }, [actionHandlers?.playButtonClick])

  const handlePauseButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const isPlaying = videoRef.current !== undefined ? Boolean(videoRef.current.paused) : false
    actionHandlers?.pauseButtonClick?.(e, isPlaying, videoRef.current)
  }, [actionHandlers?.pauseButtonClick])

  const handleLoudButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const isLoud = mute !== undefined ? !mute : false
    actionHandlers?.loudButtonClick?.(e, isLoud, videoRef.current)
  }, [actionHandlers?.loudButtonClick, mute])

  const handleMuteButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const isLoud = mute !== undefined ? !mute : false
    actionHandlers?.muteButtonClick?.(e, isLoud, videoRef.current)
  }, [actionHandlers?.muteButtonClick, mute])

  const handleFullscreenButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    actionHandlers?.fullscreenButtonClick?.(e, fullscreen, videoRef.current)
  }, [actionHandlers?.fullscreenButtonClick, fullscreen])

  const handleVolumeRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVolume = Number(e.currentTarget.value) / 100
    actionHandlers?.volumeRangeChange?.(e, targetVolume, volume, videoRef.current)
  }, [actionHandlers?.volumeRangeChange, volume])

  const handleRateRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    actionHandlers?.rateRangeChange?.(e, Number(e.currentTarget.value), playbackRate, videoRef.current)
  }, [actionHandlers?.rateRangeChange, playbackRate])

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current === null) return
    const progress = getTimelineClickProgress(e, e.currentTarget, videoRef.current)
    const targetTime = progress * totalTime
    actionHandlers?.timelineClick?.(e, targetTime, currentTime, videoRef.current)

    /* If we are given a currentTimeMs prop, we consider that the current time is controlled by the parent component, and we should not attempt to set it here on timeline click, as it would create conflicts. The parent comp should update the currentTimeMs prop itself */
    if (!isTimeControlled) {
      videoRef.current.currentTime = targetTime
    }
  }, [actionHandlers?.timelineClick, totalTime, currentTime, isTimeControlled])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, _modifiers), className)

  const isPlaying = play ?? false
  const isFullscreen = fullscreen ?? false
  const isLoud = mute ?? false
  const appliedVolume = volume ?? 0
  const rootAttributes = {
    'data-play-on': isPlaying ? '' : undefined,
    'data-play-off': !isPlaying ? '' : undefined,
    'data-fullscreen-on': isFullscreen ? '' : undefined,
    'data-fullscreen-off': !isFullscreen ? '' : undefined,
    'data-loud': isLoud ? '' : undefined,
    'data-muted': !isLoud ? '' : undefined,
    'data-volume': appliedVolume.toFixed(8),
    'data-volume-percent': volumePercent,
    'data-playback-rate': playbackRate,
    'data-current-time-ms': currentTimeMs.toFixed(2),
    'data-current-time-ratio': (currentTime / totalTime).toFixed(8),
    'data-total-time-ms': totalTimeMs
  }

  const rootStyles: Record<string, string> = {
    [`--${publicClassName}-elapsed-time-ratio`]: (currentTime / totalTime).toFixed(8)
  }

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
    if (isTimeControlled) return
    if (play === true) {
      void forcePlay(videoRef.current)
    } else {
      void forcePause(videoRef.current)
    }
  }, [play, isTimeControlled])

  useEffect(() => {
    if (volume !== undefined) {
      forceVolume(videoRef.current, volume)
    }
  }, [volume])

  useEffect(() => {
    if (givenCurrentTimeMs !== undefined && videoRef.current !== null) {
      void forcePause(videoRef.current)
      videoRef.current.currentTime = msToSeconds(givenCurrentTimeMs)
    }
  }, [givenCurrentTimeMs])

  useEffect(() => {
    if (mute === true) {
      forceMute(videoRef.current)
    } else {
      forceLoud(videoRef.current)
    }
  }, [mute])

  useEffect(() => {
    if (stateHandlers?.currentTime !== undefined) {
      stateHandlers.currentTime(msToSeconds(currentTimeMs))
    }
  }, [currentTimeMs, stateHandlers?.currentTime])

  return <figure
    className={rootClss}
    style={rootStyles}
    {...rootAttributes}
  >
     {/* Vidéo */}
      <video
        ref={videoRef}
        className={videoClss}
        {...intrinsicVideoAttributes}
        onLoadedMetadata={handleMetadataLoadEvent}
        onPlay={handleOnPlayEvent}
        onTimeUpdate={handleOnTimeUpdateEvent}
    >
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
        onClick={handlePlayButtonClick}
        >{playBtnContent}</button>
      <button
        className={pauseBtnClss}
        onClick={handlePauseButtonClick}
        >{pauseBtnContent}</button>
      {/* Loud / mute */}
      <button
        className={loudBtnClss}
        onClick={handleLoudButtonClick}
        >{loudBtnContent}</button>
      <button
        className={muteBtnClss}
        onClick={handleMuteButtonClick}
        >{muteBtnContent}</button>
      {/* Volume */}
      <input
        type="range"
        className={volumeRangeClss}
        value={volumePercent}
        onChange={handleVolumeRangeChange}
        min={0}
        max={100}
        step={1} />
      <span className={volumePcntClss}>{Math.round(volumePercent)}</span>
      {/* Fullscreen */}
      <button className={fullscreenBtnClss}
        onClick={handleFullscreenButtonClick}
      >{fullscreenBtnContent}</button>
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
      <div className={timelineClss}
        onClick={handleTimelineClick}
      />
    </div>

    {/* Subtitles */}
    { subtitles !== undefined && <Subtitles
      {...subtitles}
      timecodeMs={currentTimeMs} />
    }
  </figure>
}
