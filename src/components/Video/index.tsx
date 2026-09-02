import {
  type FunctionComponent,
  type ReactEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { IntersectionObserverComponent, type Props as IntersectionObserverComponentProps } from '../IntersectionObserver/index.js'
import { mergeClassNames } from '../utils/index.js'
import { videoWrapper as publicClassName } from '../public-classnames.js'
import {
  muteAttributeWorkaround
} from './utils.js'
import cssModule from './styles.module.css'
import {
  ControlledVideo,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Props for the {@link Video} component.
 *
 * Extends all ControlledVideo props except play, mute, fullscreen, volume, playbackRate, and their associated event handlers
 * @property autoPlayWhenVisible - When `true`, triggers playback the first time the
 * component intersects the viewport.
 * @property autoPauseWhenHidden - When `true`, pauses playback whenever the component
 * leaves the viewport.
 * @property autoLoudWhenVisible - When `true`, unmutes the video the first time the
 * component intersects the viewport.
 * @property autoMuteWhenHidden - When `true`, mutes the video whenever the component
 * leaves the viewport.
 * @property currentTimeMs - When provided, hands ownership of the current time
 * (in milliseconds) to the parent, which is then responsible for updating it —
 * typically to scrub the video from scroll position. A controlled time implies a
 * stopped video, since a playing element would advance a value it does not own:
 * `autoPlay`, `autoPlayWhenVisible` and the play button have no effect for as
 * long as this prop is provided.
 * @property wrapperClassName - Optional additional class name(s) applied to the root wrapper element.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the `<video>` element itself
 * (e.g. fallback content).
 */
export type Props = Omit<ControlledProps, 'play' | 'fullscreen' | 'volume' | 'mute' | 'playbackRate'> & {
  autoPlayWhenVisible?: boolean
  autoPauseWhenHidden?: boolean
  autoLoudWhenVisible?: boolean
  autoMuteWhenHidden?: boolean
  wrapperClassName?: string
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
 */

export const Video: FunctionComponent<Props> = ({
  loop,
  autoPlayWhenVisible,
  autoPauseWhenHidden,
  autoMuteWhenHidden,
  autoLoudWhenVisible,
  wrapperClassName,
  onPlayButtonClicked,
  onPauseButtonClicked,
  onLoudButtonClicked,
  onMuteButtonClicked,
  onVolumeRangeChanged,
  onRateRangeChanged,
  onFullscreenButtonClicked,
  ...controlledProps
}) => {
  // State & refs
  const [play, setPlay] = useState(false)
  const [volume, setVolume] = useState(1)
  const [mute, setMute] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  const hasBeenAutoPlayed = useRef(false)

  // Several paths below ask for playback — the play button, autoPlayWhenVisible,
  // autoPlay itself. None of them may win over a parent-owned time, so the
  // invariant is applied where the state is forwarded rather than guarded at each
  // of those call sites.
  const isTimeControlled = controlledProps.currentTimeMs !== undefined

  const needsObserve = useMemo(() => autoLoudWhenVisible === true
    || autoMuteWhenHidden === true
    || autoPlayWhenVisible === true
    || autoPauseWhenHidden === true, [
    autoLoudWhenVisible,
    autoMuteWhenHidden,
    autoPlayWhenVisible,
    autoPauseWhenHidden
  ])

  // Intrisic event handlers
  const handleOnPlayEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    controlledProps.onPlay?.(e)
    setPlay(true)
    hasBeenAutoPlayed.current = true
  }, [controlledProps.onPlay])

  const handleOnPauseEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setPlay(false)
    controlledProps.onPause?.(e)
  }, [controlledProps.onPause])

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
  }, [])

  const handleOnLoadedMetadataEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    muteAttributeWorkaround(e.currentTarget, controlledProps.muted ?? false)
    controlledProps.onLoadedMetadata?.(e)
  }, [controlledProps.onLoadedMetadata, controlledProps.muted])

  // User actions
  const handlePlayButtonClick = useCallback<NonNullable<Props['onPlayButtonClicked']>>((e, isPlaying, video) => {
    onPlayButtonClicked?.(e, isPlaying, video)
    setPlay(true)
  }, [onPlayButtonClicked])

  const handlePauseButtonClick = useCallback<NonNullable<Props['onPauseButtonClicked']>>((e, isPlaying, video) => {
    onPauseButtonClicked?.(e, isPlaying, video)
    setPlay(false)
  }, [onPauseButtonClicked])

  const handleLoudButtonClick = useCallback<NonNullable<Props['onLoudButtonClicked']>>((e, isLoud, video) => {
    onLoudButtonClicked?.(e, isLoud, video)
    setMute(false)
  }, [onLoudButtonClicked])

  const handleMuteButtonClick = useCallback<NonNullable<Props['onMuteButtonClicked']>>((e, isLoud, video) => {
    onMuteButtonClicked?.(e, isLoud, video)
    setMute(true)
  }, [onMuteButtonClicked])

  const handleRateRangeChange = useCallback<NonNullable<Props['onRateRangeChanged']>>((e, targetRate, currentRate, video) => {
    onRateRangeChanged?.(e, targetRate, currentRate, video)
    setPlaybackRate(targetRate)
  }, [onRateRangeChanged])

  const handleVolumeRangeChange = useCallback<NonNullable<Props['onVolumeRangeChanged']>>((e, targetVolume, currentVolume, video) => {
    onVolumeRangeChanged?.(e, targetVolume, currentVolume, video)
    setVolume(targetVolume)
  }, [onVolumeRangeChanged])

  const handleFullscreenButtonClick = useCallback<NonNullable<Props['onFullscreenButtonClicked']>>((e, isFullscreen, video) => {
    onFullscreenButtonClicked?.(e, isFullscreen, video)
    setFullscreen(!isFullscreen)
  }, [onFullscreenButtonClicked])

  // Intersection Observer

  const onIntersected = useCallback<NonNullable<IntersectionObserverComponentProps['onIntersected']>>(({ ioEntry }) => {
    if (ioEntry === undefined) return
    const { isIntersecting } = ioEntry
    if (autoPauseWhenHidden === true && !isIntersecting) setPlay(false)
    if (autoLoudWhenVisible === true && isIntersecting) setMute(false)
    if (autoPlayWhenVisible === true
      && !hasBeenAutoPlayed.current
      && isIntersecting) setPlay(true)
    if (autoMuteWhenHidden === true
      && !hasBeenAutoPlayed.current
      && !isIntersecting) setMute(true)
  }, [
    autoPlayWhenVisible,
    autoPauseWhenHidden,
    autoMuteWhenHidden,
    autoLoudWhenVisible
  ])

  // `autoPlay` is forwarded to the element, but the play state is owned here, so
  // it has to be seeded once on mount for the controls to agree with the element.
  useEffect(() => {
    if (controlledProps.autoPlay === true && !hasBeenAutoPlayed.current) setPlay(true)
  }, [])

  // Render
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), wrapperClassName)

  const videoContent = <ControlledVideo
    {...controlledProps}
    play={play && !isTimeControlled}
    volume={volume}
    mute={mute}
    playbackRate={playbackRate}
    fullscreen={fullscreen}
    onPlay={handleOnPlayEvent}
    onPause={handleOnPauseEvent}
    onVolumeChange={handleOnVolumeChangeEvent}
    onRateChange={handleOnRateChangeEvent}
    onLoadedMetadata={handleOnLoadedMetadataEvent}
    onFullscreenChange={handleFullscreenChange}
    onPlayButtonClicked={handlePlayButtonClick}
    onPauseButtonClicked={handlePauseButtonClick}
    onLoudButtonClicked={handleLoudButtonClick}
    onMuteButtonClicked={handleMuteButtonClick}
    onVolumeRangeChanged={handleVolumeRangeChange}
    onRateRangeChanged={handleRateRangeChange}
    onFullscreenButtonClicked={handleFullscreenButtonClick} />

  return <div className={rootClss}>
    {needsObserve
      ? <IntersectionObserverComponent onIntersected={onIntersected}>
        {videoContent}
      </IntersectionObserverComponent>
      : videoContent}
  </div>
}
