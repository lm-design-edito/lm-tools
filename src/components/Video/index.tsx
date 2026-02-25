import { type FunctionComponent, type PropsWithChildren, type VideoHTMLAttributes, useCallback, useMemo, useRef, useState } from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../utils/index.js'
import { formatTime, secondsToMs } from './utils.js'
import type { WithClassName } from '../utils/types.js'
import { video as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

type SourceData = {
  src?: string
  type?: string
}
type TrackData = {
  src?: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srclang?: string
  label?: string
  default?: boolean
}
export type Props = PropsWithChildren<WithClassName<{
  sources?: string | string[] | SourceData[]
  tracks?: string | string[] | TrackData[]
  playBtnContent?: React.ReactNode
  pauseBtnContent?: React.ReactNode
  soundOnBtnContent?: React.ReactNode
  soundOffBtnContent?: React.ReactNode
  fullscreenBtnContent?: React.ReactNode
}> & VideoHTMLAttributes<HTMLVideoElement>>

export const Video: FunctionComponent<Props> = ({
  sources,
  tracks,
  playBtnContent,
  pauseBtnContent,
  soundOnBtnContent,
  soundOffBtnContent,
  fullscreenBtnContent,

  children,
  className,
  ...intrinsicVideoAttributes
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(false)

  const [elapsedTime, setElapsedTime] = useState(0)
  const elapsedTimeMs = secondsToMs(elapsedTime)

  const [totalTime, setTotalTime] = useState(0)
  const totalTimeMs = useMemo(() => secondsToMs(totalTime), [totalTime])

  const [soundVolume, setSoundVolume] = useState(0)
  const soundVolumePercent = useMemo(() => soundVolume * 100, [soundVolume])

  const [playbackSpeed, setPlaybackSpeed] = useState(0)

  const $video = useRef<HTMLVideoElement>(null)
  const $root = useRef<HTMLElement>(null)

  const muteAttributeWorkaround = useCallback(() => {
    if ($video.current === null) return
    const video = $video.current
    const currentMuted = video.getAttribute('muted')
    if (currentMuted !== null) return
    video.setAttribute('muted', '')
    video.load()
  }, [])

  const onVideoVolumeChange = useCallback((e: React.FormEvent<HTMLVideoElement>) => {
    const volume = e.currentTarget.volume
    setSoundVolume(volume)
    setIsSoundOn($video.current !== null ? !(!$video.current.muted) : false)
  }, [])

  const onVolumeRangeChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const volumePercent = Number(e.currentTarget.value)
    const volume = volumePercent / 100
    if ($video.current === null) return
    $video.current.volume = volume
  }, [])

  const triggerPlay = useCallback(async () => {
    if ($video.current === null) return
    try {
      await $video.current.play()
    } catch (e) {
      console.error('Error playing video:', e)
    }
  }, [])

  const onPlayBtnClick = useCallback(() => {
    triggerPlay().catch(e => console.error('Error playing video:', e))
  }, [triggerPlay])

  const onPauseBtnClick = useCallback(() => {
    if ($video.current === null) return
    $video.current.pause()
  }, [])

  const onSoundOnBtnClick = useCallback(() => {
    if ($video.current === null) return
    $video.current.muted = false
  }, [])

  const onSoundOffBtnClick = useCallback(() => {
    if ($video.current === null) return
    $video.current.muted = true
  }, [])

  const requestFullscreen = useCallback(async () => {
    if ($video.current === null) return
    const isFullscreen = document.fullscreenElement === $video.current

    if (isFullscreen) {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch (e) {
        console.error('Error exiting fullscreen:', e)
      }
    }

    try {
      setIsFullscreen(true)
      await $video.current.requestFullscreen()
    } catch (e) {
      setIsFullscreen(false)
      console.error('Error entering fullscreen:', e)
    }
  }, [])

  const onFullScreenBtnClick = useCallback(() => {
    requestFullscreen().catch(e => console.error('Error toggling fullscreen:', e))
  }, [requestFullscreen])

  const onPlaybackSpeedRangeChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const speed = Number(e.currentTarget.value)
    if ($video.current === null) return
    $video.current.playbackRate = speed
  }, [])

  const onTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ($video.current === null) return
    const timelineRect = e.currentTarget.getBoundingClientRect()
    const position = e.clientX - timelineRect.left
    const progress = Math.min(1, Math.max(0, position / timelineRect.width))
    $video.current.currentTime = progress * totalTime
  }, [])

  const onVideoRateChange = useCallback((e: React.FormEvent<HTMLVideoElement>) => {
    const speed = e.currentTarget.playbackRate
    setPlaybackSpeed(speed)
  }, [])

  const onVideoPlay = useCallback(() => {
    setIsVideoPlaying(true)
  }, [])

  const onVideoPause = useCallback(() => {
    setIsVideoPlaying(false)
  }, [])

  const onVideoTimeUpdate = useCallback((e: React.FormEvent<HTMLVideoElement>) => {
    const currentTime = e.currentTarget.currentTime
    setElapsedTime(currentTime)

    if ($root.current === null) return

    const progress = (currentTime / totalTime)
    $root.current.style.setProperty('--progress', progress.toFixed(2))
  }, [totalTime])

  const onVideoLoadMetadata = useCallback(() => {
    if ($video.current === null) return
    const video = $video.current
    setTotalTime(video.duration)
    setPlaybackSpeed(video.playbackRate)
    setSoundVolume(video.volume)
    setIsSoundOn(video.volume > 0)
    muteAttributeWorkaround()
  }, [])

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

  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    'play-on': isVideoPlaying,
    'play-off': !isVideoPlaying,
    'fullscreen-on': isFullscreen,
    'fullscreen-off': !isFullscreen,
    'sound-on': isSoundOn,
    'sound-off': !isSoundOn
  }), className)
  const rootAttributes = {
    'data-play-on': isVideoPlaying ? '' : undefined,
    'data-play-off': !isVideoPlaying ? '' : undefined,
    'data-fullscreen-on': isFullscreen ? '' : undefined,
    'data-fullscreen-off': !isFullscreen ? '' : undefined,
    'data-sound-on': isSoundOn ? '' : undefined,
    'data-sound-off': !isSoundOn ? '' : undefined,
    'data-sound-volume': soundVolume,
    'data-sound-volume-percent': soundVolumePercent,
    'data-playback-speed': playbackSpeed,
    'data-elapsed-time-ms': elapsedTimeMs,
    'data-elapsed-time-ratio': elapsedTime / totalTime,
    'data-total-time-ms': totalTimeMs
  }

  const videoClss = c('video')
  const videoControlsClss = c('video-controls')

  const playBtnClss = c('play-btn')
  const pauseBtnClss = c('pause-btn')
  const soundOnBtnClss = c('sound-on-btn')
  const soundOffBtnClss = c('sound-off-btn')
  const fullscreenBtnClss = c('fullscreen-btn')

  const elapsedTimeClss = c('elapsed-time')
  const elapsedTimeLabelClss = c('elapsed-time-label')
  const totalTimeClss = c('total-time')
  const totalTimeLabelClss = c('total-time-label')
  const volumeRangeClss = c('volume-range')
  const playbackSpeedRangeClss = c('playback-speed-range')
  const timelineClss = c('timeline')

  return (
    <figure className={rootClss} {...rootAttributes} ref={$root}>
      <video
        ref={$video}
        className={videoClss}
        onVolumeChange={onVideoVolumeChange}
        onLoadedMetadata={onVideoLoadMetadata}
        onPlay={onVideoPlay}
        onPause={onVideoPause}
        onTimeUpdate={onVideoTimeUpdate}
        onRateChange={onVideoRateChange}
        {...intrinsicVideoAttributes}
      >
        {parsedSources.map((source, index) => {
          if (typeof source === 'string') {
            return <source key={index} src={source} />
          } else {
            const { src, type } = source
            return <source key={index} src={src} type={type} />
          }
        })}

        {parsedTracks.map((track, index) => {
          if (typeof track === 'string') {
            return <track key={index} src={track} />
          } else {
            const { src, kind, srclang, label, default: isDefault } = track
            return <track key={index} src={src} kind={kind} srcLang={srclang} label={label} default={isDefault} />
          }
        })}
        { children }
      </video>
      <div className={videoControlsClss}>
        <button className={playBtnClss} onClick={onPlayBtnClick}>{playBtnContent ?? 'play'}</button>
        <button className={pauseBtnClss} onClick={onPauseBtnClick}>{pauseBtnContent ?? 'pause'}</button>

        <span className={elapsedTimeClss}>
          <span className={elapsedTimeLabelClss}>Temps écoulé:</span>
          {formatTime(elapsedTimeMs, 'mm:ss:ms')}
        </span>
        <span className={totalTimeClss}>
          <span className={totalTimeLabelClss}>Temps total:</span>
          {formatTime(totalTimeMs, 'mm:ss:ms')}
        </span>

        <div className={timelineClss} onClick={onTimelineClick} />

        <button className={soundOnBtnClss} onClick={onSoundOnBtnClick}>{soundOnBtnContent ?? 'sound on'}</button>
        <button className={soundOffBtnClss} onClick={onSoundOffBtnClick}>{soundOffBtnContent ?? 'sound off'}</button>

        <input type="range" className={volumeRangeClss} value={soundVolumePercent} onChange={onVolumeRangeChange} min={0} max={100} step={1} />

        <span> Volume <span>{soundVolumePercent}</span></span>

        <button className={fullscreenBtnClss} onClick={onFullScreenBtnClick}>{fullscreenBtnContent ?? 'fullscreen'}</button>

        <input type="range" className={playbackSpeedRangeClss} value={playbackSpeed} onChange={onPlaybackSpeedRangeChange} min={0.25} max={4} step={0.25} />
        <span>playback speed <span>{playbackSpeed}</span></span>
      </div>

    </figure>
  )
}
