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
import {
  Disclaimer,
  type Props as DisclaimerProps
} from '../Disclaimer/index.js'
import { IntersectionObserverComponent, type Props as IntersectionObserverComponentProps } from '../IntersectionObserver/index.js'
import { mergeClassNames } from '../utils/index.js'
import { videoWrapper as publicClassName } from '../public-classnames.js'
import {
  muteAttributeWorkaround
} from './utils.js'
import cssModule from './styles.module.css'
import {
  ControlledVideo,
  type Props as ControlledProps,
  type ActionHandlersProps as ControlledActionHandlersProps
} from './index.controlled.js'

type ActionHandlersProps = ControlledActionHandlersProps

/**
 * Props for the {@link Video} component.
 *
 * Extends all ControlledVideo props except play, mute, fullscreen, volume, playbackRate, and their associated event handlers
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
 * @property currentTimeMs - When provided, forces the video's current time to the given value (in milliseconds). Giving the currentTimeMs prop puts the component in a controlled state for the current time, meaning that the parent component is responsible for updating the current time. In this mode, user interactions that would normally change the current time (play, pause, timeline click) will not have an effect unless the parent component updates the currentTimeMs prop accordingly.
 * @property wrapperClassName - Optional additional class name(s) applied to the root wrapper element.
 * @property stateHandlers - Optional callbacks invoked whenever the corresponding
 * state changes. Useful for synchronizing external state with the internal video state.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the `<video>` element itself
 * (e.g. fallback content).
 */
export type Props = Omit<ControlledProps, 'play' | 'fullscreen' | 'volume' | 'mute' | 'playbackRate'> & {
  disclaimer?: DisclaimerProps
  autoPlayWhenVisible?: boolean
  autoPauseWhenHidden?: boolean
  autoLoudWhenVisible?: boolean
  autoMuteWhenHidden?: boolean
  wrapperClassName?: string
}

/**
 * Full-featured video player component. Wraps a native `<video>` element with
 * playback controls, volume, playback rate, a timeline, optional subtitles,
 * an optional disclaimer gate, and viewport-driven auto-play/mute behaviours.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A `<figure>` element containing the video, its controls, optional
 * subtitles, and an optional disclaimer overlay.
 */

export const Video: FunctionComponent<Props> = ({
  loop,
  disclaimer,
  autoPlayWhenVisible,
  autoPauseWhenHidden,
  autoMuteWhenHidden,
  autoLoudWhenVisible,
  wrapperClassName,
  ...controlledProps
}) => {
  // State & refs
  const [play, setPlay] = useState(false)
  const [volume, setVolume] = useState(1)
  const [mute, setMute] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [isDisclaimerOn, setIsDisclaimerOn] = useState(
    disclaimer?.isOn === true
    || disclaimer?.defaultIsOn === true
    || (disclaimer !== undefined && disclaimer.defaultIsOn === undefined)
  )

  const hasBeenAutoPlayed = useRef(false)
  const needsDisclaimer = useMemo(() => disclaimer !== undefined, [disclaimer])
  const shouldDisclaimerBeOn = useMemo(() => {
    if (disclaimer?.isOn === false) return false
    if (disclaimer?.isOn === true) return true
    return isDisclaimerOn
  }, [disclaimer, isDisclaimerOn])

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
    if (shouldDisclaimerBeOn) {
      setPlay(false)
      return
    }
    setPlay(true)
    hasBeenAutoPlayed.current = true
  }, [controlledProps?.onPlay, shouldDisclaimerBeOn])

  const handleOnPauseEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setPlay(false)
    controlledProps.onPause?.(e)
  }, [controlledProps?.onPause])

  const handleOnVolumeChangeEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setMute(Boolean(e.currentTarget.muted))
    setVolume(Number(e.currentTarget.volume))
    controlledProps.onVolumeChange?.(e)
  }, [controlledProps?.onVolumeChange])

  const handleOnRateChangeEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    setPlaybackRate(Number(e.currentTarget.playbackRate))
    controlledProps.onRateChange?.(e)
  }, [controlledProps?.onRateChange])

  const handleOnFullscreenChangeEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    if (document.fullscreenElement === null || shouldDisclaimerBeOn) {
      setFullscreen(false)
    }
  }, [shouldDisclaimerBeOn])

  const handleOnLoadedMetadataEvent: ReactEventHandler<HTMLVideoElement> = useCallback((e) => {
    muteAttributeWorkaround(e.currentTarget, controlledProps.muted ?? false)
    controlledProps.onLoadedMetadata?.(e)
  }, [controlledProps?.onLoadedMetadata, controlledProps?.muted])

  // User actions
  const handlePlayButtonClick = useCallback<NonNullable<ActionHandlersProps['playButtonClick']>>((e, isPlaying, video) => {
    controlledProps.actionHandlers?.playButtonClick?.(e, isPlaying, video)
    setPlay(!shouldDisclaimerBeOn)
  }, [controlledProps.actionHandlers, shouldDisclaimerBeOn])

  const handlePauseButtonClick = useCallback<NonNullable<ActionHandlersProps['pauseButtonClick']>>((e, isPlaying, video) => {
    controlledProps.actionHandlers?.pauseButtonClick?.(e, isPlaying, video)
    setPlay(false)
  }, [controlledProps.actionHandlers])

  const handleLoudButtonClick = useCallback<NonNullable<ActionHandlersProps['loudButtonClick']>>((e, isLoud, video) => {
    controlledProps.actionHandlers?.loudButtonClick?.(e, isLoud, video)
    setMute(false)
  }, [controlledProps.actionHandlers])

  const handleMuteButtonClick = useCallback<NonNullable<ActionHandlersProps['muteButtonClick']>>((e, isLoud, video) => {
    controlledProps.actionHandlers?.muteButtonClick?.(e, isLoud, video)
    setMute(true)
  }, [controlledProps.actionHandlers])

  const handleRateRangeChange = useCallback<NonNullable<ActionHandlersProps['rateRangeChange']>>((e, targetRate, currentRate, video) => {
    controlledProps.actionHandlers?.rateRangeChange?.(e, targetRate, currentRate, video)
    setPlaybackRate(targetRate)
  }, [controlledProps.actionHandlers])

  const handleVolumeRangeChange = useCallback<NonNullable<ActionHandlersProps['volumeRangeChange']>>((e, targetVolume, currentVolume, video) => {
    controlledProps.actionHandlers?.volumeRangeChange?.(e, targetVolume, currentVolume, video)
    setVolume(targetVolume)
  }, [controlledProps.actionHandlers])

  const handleFullscreenButtonClick = useCallback<NonNullable< ActionHandlersProps['fullscreenButtonClick']>>((e, isFullscreen, video) => {
    controlledProps.actionHandlers?.fullscreenButtonClick?.(e, isFullscreen, video)
    setFullscreen((prev) => shouldDisclaimerBeOn ? false : !isFullscreen)
  }, [controlledProps.actionHandlers, shouldDisclaimerBeOn])

  // Intersection Observer + Disclaimer

  const onIntersected = useCallback<NonNullable<IntersectionObserverComponentProps['onIntersected']>>(({ ioEntry }) => {
    if (ioEntry === undefined) return
    const { isIntersecting = false } = ioEntry
    if (autoPauseWhenHidden === true && !isIntersecting) {
      setPlay(false)
    }
    if (autoLoudWhenVisible === true && isIntersecting) {
      setMute(false)
    }
    if (autoPlayWhenVisible === true && !shouldDisclaimerBeOn && !hasBeenAutoPlayed.current && isIntersecting) {
      setPlay(true)
    }
    if (autoMuteWhenHidden === true && !shouldDisclaimerBeOn && !hasBeenAutoPlayed.current && !isIntersecting) {
      setMute(true)
    }
  }, [autoPlayWhenVisible, autoPauseWhenHidden, autoMuteWhenHidden, autoLoudWhenVisible, shouldDisclaimerBeOn])

  const handleDiclaimerDismiss = useCallback<NonNullable<NonNullable<DisclaimerProps['actionHandlers']>['dismissClick']>>((prevIsOn) => {
    setIsDisclaimerOn(false)
    if (controlledProps.autoPlay === true && !hasBeenAutoPlayed.current) {
      setPlay(true)
    }
    disclaimer?.actionHandlers?.dismissClick?.(prevIsOn)
  }, [controlledProps.autoPlay, disclaimer?.actionHandlers?.dismissClick])

  useEffect(() => {
    if (isDisclaimerOn !== shouldDisclaimerBeOn) {
      setIsDisclaimerOn(shouldDisclaimerBeOn)
    }
  }, [isDisclaimerOn, shouldDisclaimerBeOn])

  useEffect(() => {
    if (shouldDisclaimerBeOn) {
      setMute(true)
      setPlay(false)
      setFullscreen(false)
    } else if (controlledProps.autoPlay === true && !hasBeenAutoPlayed.current) {
      setPlay(true)
    }
  }, [shouldDisclaimerBeOn])

  // Render
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
  }), wrapperClassName)

  const sensitiveContent = <ControlledVideo
    {...controlledProps}
    play={play}
    volume={volume}
    mute={mute}
    playbackRate={playbackRate}
    fullscreen={fullscreen}
    onPlay={handleOnPlayEvent}
    onPause={handleOnPauseEvent}
    onVolumeChange={handleOnVolumeChangeEvent}
    onRateChange={handleOnRateChangeEvent}
    onLoadedMetadata={handleOnLoadedMetadataEvent}
    onFullscreenChange={handleOnFullscreenChangeEvent}
    actionHandlers={{
      ...controlledProps.actionHandlers,
      playButtonClick: handlePlayButtonClick,
      pauseButtonClick: handlePauseButtonClick,
      loudButtonClick: handleLoudButtonClick,
      muteButtonClick: handleMuteButtonClick,
      volumeRangeChange: handleVolumeRangeChange,
      rateRangeChange: handleRateRangeChange,
      fullscreenButtonClick: handleFullscreenButtonClick
    }}
  />

  const disclaimedContent = needsDisclaimer
    ? <Disclaimer
        {...disclaimer}
        actionHandlers={{
          ...disclaimer?.actionHandlers,
          dismissClick: handleDiclaimerDismiss
        }}
      >
      {sensitiveContent}
    </Disclaimer>
    : sensitiveContent

  return (
    <div className={rootClss}>
      { needsObserve
        ? <IntersectionObserverComponent onIntersected={onIntersected}>
          {disclaimedContent}
        </IntersectionObserverComponent>
        : disclaimedContent
      }
    </div>
  )
}
