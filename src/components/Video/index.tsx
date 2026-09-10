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
import type { WithViewportObservation } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { videoWrapper as publicClassName } from '../public-classnames.js'
import {
  muteAttributeWorkaround,
  shouldRunAutoBehaviour
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
 * @property autoPlayWhenVisible - When `true`, starts playback every time the
 * component enters the viewport.
 * @property autoPlayOnceVisible - Same, but only the first time it does.
 * @property autoPauseWhenHidden - When `true`, pauses playback every time the
 * component leaves the viewport.
 * @property autoPauseOnceHidden - Same, but only the first time it does.
 * @property autoLoudWhenVisible - When `true`, unmutes every time the component
 * enters the viewport.
 * @property autoLoudOnceVisible - Same, but only the first time it does.
 * @property autoMuteWhenHidden - When `true`, mutes every time the component leaves
 * the viewport.
 * @property autoMuteOnceHidden - Same, but only the first time it does.
 * @property threshold - How much of the component has to be in view before it
 * counts as visible, forwarded to the internal {@link IntersectionObserver}. `0.3`
 * to start on a third of it; omitted, a single pixel is enough.
 * @property root - The observer's root. Defaults to the viewport.
 * @property rootMargin - Grows or shrinks that root before measuring.
 * @property onVisibilityChanged - Called on every crossing with the new value,
 * whether or not an `auto…` behaviour is bound to it. Never on mount.
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
export type Props = WithViewportObservation<Omit<ControlledProps, 'play' | 'fullscreen' | 'volume' | 'mute' | 'playbackRate'>> & {
  autoPlayWhenVisible?: boolean
  autoPlayOnceVisible?: boolean
  autoPauseWhenHidden?: boolean
  autoPauseOnceHidden?: boolean
  autoLoudWhenVisible?: boolean
  autoLoudOnceVisible?: boolean
  autoMuteWhenHidden?: boolean
  autoMuteOnceHidden?: boolean
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
 * Each viewport-driven behaviour comes in two flavours: `…When…` fires on every
 * crossing, `…Once…` only on the first one. A `…Once…` flag is armed by its own
 * automatic trigger and by nothing else — pressing play does not spend the one
 * automatic play the component still owed. Setting both flavours of the same
 * behaviour is the same as setting the `…When…` one alone.
 *
 * Browsers refuse an unmuted `play()` outside a user gesture, so pairing an
 * `autoLoud…` with an `autoPlay…` will usually have the playback rejected. The
 * refusal is caught rather than ignored — the element is read back once the attempt
 * settles, and the play state follows what it says — so the controls stay truthful.
 * The media still won't play, though: autoplay muted, and leave unmuting to the
 * reader.
 */

export const Video: FunctionComponent<Props> = ({
  loop,
  autoPlayWhenVisible,
  autoPlayOnceVisible,
  autoPauseWhenHidden,
  autoPauseOnceHidden,
  autoMuteWhenHidden,
  autoMuteOnceHidden,
  autoLoudWhenVisible,
  autoLoudOnceVisible,
  threshold,
  root,
  rootMargin,
  onVisibilityChanged,
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

  // One flag per `…Once…` behaviour, and each is armed by that behaviour's own
  // automatic trigger. A single shared flag conflated four questions, and being set
  // on any `play` event — a user click included — meant the first press cancelled
  // behaviours that had nothing to do with playback.
  const hasAutoPlayedOnce = useRef(false)
  const hasAutoPausedOnce = useRef(false)
  const hasAutoLoudedOnce = useRef(false)
  const hasAutoMutedOnce = useRef(false)

  // Several paths below ask for playback — the play button, autoPlayWhenVisible,
  // autoPlay itself. None of them may win over a parent-owned time, so the
  // invariant is applied where the state is forwarded rather than guarded at each
  // of those call sites.
  const isTimeControlled = controlledProps.currentTimeMs !== undefined

  const needsObserve = useMemo(() => onVisibilityChanged !== undefined
    || autoLoudWhenVisible === true
    || autoLoudOnceVisible === true
    || autoMuteWhenHidden === true
    || autoMuteOnceHidden === true
    || autoPlayWhenVisible === true
    || autoPlayOnceVisible === true
    || autoPauseWhenHidden === true
    || autoPauseOnceHidden === true, [
    autoLoudWhenVisible,
    autoLoudOnceVisible,
    autoMuteWhenHidden,
    autoMuteOnceHidden,
    autoPlayWhenVisible,
    autoPlayOnceVisible,
    autoPauseWhenHidden,
    autoPauseOnceHidden,
    onVisibilityChanged
  ])

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
    onVisibilityChanged?.(isIntersecting)
    if (isIntersecting) {
      if (shouldRunAutoBehaviour(autoPlayWhenVisible, autoPlayOnceVisible, hasAutoPlayedOnce.current)) {
        hasAutoPlayedOnce.current = true
        setPlay(true)
      }
      if (shouldRunAutoBehaviour(autoLoudWhenVisible, autoLoudOnceVisible, hasAutoLoudedOnce.current)) {
        hasAutoLoudedOnce.current = true
        setMute(false)
      }
      return
    }
    if (shouldRunAutoBehaviour(autoPauseWhenHidden, autoPauseOnceHidden, hasAutoPausedOnce.current)) {
      hasAutoPausedOnce.current = true
      setPlay(false)
    }
    if (shouldRunAutoBehaviour(autoMuteWhenHidden, autoMuteOnceHidden, hasAutoMutedOnce.current)) {
      hasAutoMutedOnce.current = true
      setMute(true)
    }
  }, [
    autoPlayWhenVisible,
    autoPlayOnceVisible,
    autoPauseWhenHidden,
    autoPauseOnceHidden,
    autoMuteWhenHidden,
    autoMuteOnceHidden,
    autoLoudWhenVisible,
    autoLoudOnceVisible,
    onVisibilityChanged
  ])

  // `autoPlay` is forwarded to the element, but the play state is owned here, so
  // it has to be seeded once on mount for the controls to agree with the element.
  useEffect(() => {
    if (controlledProps.autoPlay === true) setPlay(true)
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
    onIsPlayingChanged={handleIsPlayingChanged}
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
      ? <IntersectionObserverComponent
        threshold={threshold}
        root={root}
        rootMargin={rootMargin}
        onIntersected={onIntersected}>
        {videoContent}
      </IntersectionObserverComponent>
      : videoContent}
  </div>
}
