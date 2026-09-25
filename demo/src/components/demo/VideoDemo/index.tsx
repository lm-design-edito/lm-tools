import {
  type FunctionComponent,
  useState
} from 'react'
import {
  Video,
  type Props as VideoProps
} from '~/components/Video/index.js'
import { demoStyles as subsDemoStyles } from '../SubtitlesDemo/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

import { video as publicClassName } from '~/components/public-classnames.js'
import { ControlledVideo } from '~/components/Video/index.controlled.js'
import { secondsToMs } from '~/components/Video/utils.js'

const name = 'Video'

const description = `
Full-featured video player component. Wraps a native \`<video>\` element with
playback controls, volume, playback speed, a timeline, optional subtitles,
and viewport-driven auto-play/mute behaviours.

### Root element modifiers
The root \`<figure>\` receives the public class name defined by \`video\` and
the following BEM-style modifier classes:
- \`--play-on\` / \`--play-off\` — reflects current playback state.
- \`--fullscreen-on\` / \`--fullscreen-off\` — reflects fullscreen state.
- \`--sound-on\` / \`--sound-off\` — reflects mute state.

### Data attributes on the root element
- \`data-play-on\` — present (empty string) when play.
- \`data-play-off\` — present (empty string) when paused.
- \`data-fullscreen-on\` — present (empty string) when in fullscreen.
- \`data-fullscreen-off\` — present (empty string) when not in fullscreen.
- \`data-sound-on\` — present (empty string) when unmuted.
- \`data-sound-off\` — present (empty string) when muted.
- \`data-sound-volume\` — current volume as a \`0–1\` float.
- \`data-sound-volume-percent\` — current volume as a \`0–100\` float.
- \`data-playback-speed\` — current playback rate (e.g. \`1\`, \`1.5\`).
- \`data-elapsed-time-ms\` — elapsed time in milliseconds, fixed to 2 decimals.
- \`data-elapsed-time-ratio\` — elapsed / total ratio, fixed to 8 decimals.
- \`data-total-time-ms\` — total duration in milliseconds.

### CSS custom properties on the root element
- \`--video-current-time-ratio\` — elapsed / total ratio, fixed to 8 decimals.
Useful for driving progress-bar animations purely in CSS.

@param props - Component properties.
@see {@link Props}
@returns A \`<figure>\` element containing the video, its controls, optional
subtitles.`

const tsxDetails = `
/**
 * Describes a single video source.
 *
 * @property src - URL of the video file.
 * @property type - MIME type of the source (e.g. \`'video/mp4'\`).
 */
type SourceData = {
  src?: string
  type?: string
}

/**
 * Describes a single text track (subtitles, captions, chapters, etc.).
 *
 * @property src - URL of the track file.
 * @property kind - Track type, maps directly to the \`<track>\` \`kind\` attribute.
 * @property srclang - Language of the track content (e.g. \`'fr'\`, \`'en'\`).
 * @property label - Human-readable label shown in the browser's track selector.
 * @property default - When \`true\`, marks this track as the default selection.
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
 * Extends all native \`VideoHTMLAttributes<HTMLVideoElement>\`, so any standard
 * video attribute (\`autoPlay\`, \`muted\`, \`loop\`, \`poster\`, etc.) can be passed
 * and will be forwarded to the underlying \`<video>\` element.
 *
 * @property sources - One or more video sources. Accepts:
 * - a single URL string,
 * - an array of URL strings,
 * - an array of {@link SourceData} objects for fine-grained \`type\` control.
 * @property tracks - One or more text tracks. Accepts:
 * - a single URL string,
 * - an array of URL strings,
 * - an array of {@link TrackData} objects.
 * @property playBtnContent - Custom content for the play button. Defaults to \`'play'\`.
 * @property pauseBtnContent - Custom content for the pause button. Defaults to \`'pause'\`.
 * @property soundOnBtnContent - Custom content for the unmute button. Defaults to \`'sound on'\`.
 * @property soundOffBtnContent - Custom content for the mute button. Defaults to \`'sound off'\`.
 * @property fullscreenBtnContent - Custom content for the fullscreen button. Defaults to \`'fullscreen'\`.
 * @property subtitles - Props forwarded to the internal {@link Subtitles} component.
 * \`timecodeMs\` is injected automatically from the current playback position.
 * @property autoPlayWhenVisible - When \`true\`, triggers playback the first time the
 * component intersects the viewport.
 * @property autoPauseWhenHidden - When \`true\`, pauses playback whenever the component
 * leaves the viewport.
 * @property autoLoudWhenVisible - When \`true\`, unmutes the video the first time the
 * component intersects the viewport.
 * @property autoMuteWhenHidden - When \`true\`, mutes the video whenever the component
 * leaves the viewport.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the \`<video>\` element itself
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
  autoPlayWhenVisible?: boolean
  autoPauseWhenHidden?: boolean
  autoLoudWhenVisible?: boolean
  autoMuteWhenHidden?: boolean
  onPlayButtonClicked?: (payload: { event: MouseEvent<HTMLButtonElement>, isPlaying: boolean, videoElement: HTMLVideoElement | null }) => void
  onPauseButtonClicked?: (payload: { event: MouseEvent<HTMLButtonElement>, isPlaying: boolean, videoElement: HTMLVideoElement | null }) => void
  onLoudButtonClicked?: (payload: { event: MouseEvent<HTMLButtonElement>, isLoud: boolean, videoElement: HTMLVideoElement | null }) => void
  onMuteButtonClicked?: (payload: { event: MouseEvent<HTMLButtonElement>, isLoud: boolean, videoElement: HTMLVideoElement | null }) => void
  onFullscreenButtonClicked?: (payload: { event: MouseEvent<HTMLButtonElement>, isFullscreen: boolean, videoElement: HTMLVideoElement | null }) => void
  onVolumeRangeChanged?: (payload: { event: React.ChangeEvent<HTMLInputElement>, targetVolume: number, currentVolume: number, videoElement: HTMLVideoElement | null }) => void
  onRateRangeChanged?: (payload: { event: React.ChangeEvent<HTMLInputElement>, targetRate: number, currentRate: number, videoElement: HTMLVideoElement | null }) => void
  onTimelineClicked?: (payload: { event: React.MouseEvent<HTMLDivElement>, targetTime: number, currentTime: number, videoElement: HTMLVideoElement | null }) => void
  onIsPlayingChanged?: (isPlaying: boolean) => void
  onIsLoudChanged?: (isLoud: boolean) => void
  onIsFullscreenChanged?: (isFullscreen: boolean) => void
  onVolumeChanged?: (volume: number) => void
  onPlaybackRateChanged?: (playbackRate: number) => void
  onCurrentTimeMsChanged?: (currentTimeMs: number) => void
  onFullscreenChange?: (isFullscreen: boolean) => void
}>>
}> & VideoHTMLAttributes<HTMLVideoElement>>`


/* Demo CSS */
const demoStyles = `
.${publicClassName}__timeline {
  position: relative;
  width: 100%;
  height: 10px;
  background-color: lightgray;
  cursor: pointer;
}

.${publicClassName}__timeline:before {
  content: '';
  position: absolute;
  left: 0;
  width: calc(
    var(--${publicClassName}-current-time-ratio)
    * 100%
  );
  height: 100%;
  background-color: red;
}

.${publicClassName}__video {
  max-width: 100%;
}
  
.${publicClassName} {
  ${subsDemoStyles.split('\n').join('\n  ')}
}
`


const add = (x: number, amountPercent: number, max: number) => Math.min(max, (x * 100 + amountPercent) / 100)

const sub = (x: number, amountPercent: number, min: number) => Math.max(min, (x * 100 - amountPercent) / 100)


const VideoControlledDemo: FunctionComponent = ({
  whenVisible,
  whenHidden,
  ...demoProps
}: VideoProps) => {
  const [play, setPlay] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentTimeMs, setCurrentTimeMs] = useState<undefined | number>(undefined)
  const [totalTimeMs, setTotalTimeMs] = useState<undefined | number>(undefined)
  const [mute, setMute] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const controlledCurrentTime = currentTimeMs !== undefined

  const uiProps = [
    { 
      name: 'play',
      actions: [
        <button onClick={() => setPlay(prev => !prev)}>Toggle play</button>
      ],
      value: play ? 'true' : 'false'
    },
    {
      name: 'volume',
      actions: [
        <button onClick={() => setVolume((vol) => add(vol, 10, 1))}>+ 0.1</button>,
        <button onClick={() => setVolume((vol) => sub(vol, 10, 0))}>- 0.1</button>
      ],
      value: volume
    },
    {
      name: 'mute',
      actions: [
        <button onClick={() => setMute(prev => !prev)}>Toggle mute</button>
      ],
      value: mute ? 'true' : 'false'
    },
    {
      name: 'fullscreen',
      actions: [
        <button onClick={() => setFullscreen(prev => !prev)}>Toggle fullscreen</button>
      ],
      value: fullscreen ? 'true' : 'false'
    },
    {
      name: 'playbackRate',
      actions: [
        <button onClick={() => setPlaybackRate((rate) => add(rate, 25, 4))}>+ 0.25</button>,
        <button onClick={() => setPlaybackRate((rate) => sub(rate, 25, 0.25))}>- 0.25</button>
      ],
      value: playbackRate
    },
    {
      name: 'currentTimeMs',
      actions: [
        <button onClick={() => setCurrentTimeMs(undefined)}>Unset</button>,
        <button onClick={() => setCurrentTimeMs(0)}>Reset</button>,
        <button onClick={() => setCurrentTimeMs((currentTimeMs) => currentTimeMs === undefined ? 0 : add(currentTimeMs, 100000, totalTimeMs ?? 100000))}>+100s</button>,
        <button onClick={() => setCurrentTimeMs((currentTimeMs) => currentTimeMs === undefined ? 0 : sub(currentTimeMs, 100000, 0))}>-100s</button>
      ],
      value: currentTimeMs !== undefined ? `${(currentTimeMs / 1000).toFixed(2)}s` : 'undefined' 
    }
  ]

  return (
    <>
      <h2>Video/index.controlled.tsx</h2>
      <div style={{ padding: '1em', margin: '1em', border: '1px solid black', width: 'fit-content' }}>
        <div>Time Controlled ? {controlledCurrentTime ? 'true (toggle play won\'t work)' : 'false'}</div>
        <div>
          Props: 
          {uiProps.map(({ name, actions, value }) => (
            <div key={name}>
              <span>{name} : </span>
              {actions}
              <span> – {value}</span>
            </div>
          ))}
        </div>
      </div>
      
    <ControlledVideo 
      {...demoProps} 
      play={play} 
      volume={volume} 
      mute={mute}
      fullscreen={fullscreen}
      playbackRate={playbackRate}
      onPlay={(e) => setPlay(true)}
      onPause={(e) => setPlay(false)}
      onLoadedMetadata={(e) => setTotalTimeMs(secondsToMs(e.currentTarget.duration))}
      onVolumeChange={(e) => {
        if (e.currentTarget.muted) {
          setMute(true)
        } else {
          setMute(false)
        }
        setVolume(Number(e.currentTarget.volume))
      }}
      onRateChange={(e) => {
        setPlaybackRate(Number(e.currentTarget.playbackRate))
      }}
      onTimeUpdate={(e) => {
        if (controlledCurrentTime) {
          setCurrentTimeMs(secondsToMs(e.currentTarget.currentTime))
        }
        if (demoProps.onTimeUpdate) {
          demoProps.onTimeUpdate(e)
        }
      }}
      onFullscreenChange={isFullscreen => setFullscreen(isFullscreen)}
      onPlayButtonClicked={payload => {
        setPlay(true)
        demoProps.onPlayButtonClicked?.(payload)
      }}
      onPauseButtonClicked={payload => {
        setPlay(false)
        demoProps.onPauseButtonClicked?.(payload)
      }}
      onVolumeRangeChanged={payload => {
        setVolume(payload.targetVolume)
        demoProps.onVolumeRangeChanged?.(payload)
      }}
      onRateRangeChanged={payload => {
        setPlaybackRate(payload.targetRate)
        demoProps.onRateRangeChanged?.(payload)
      }}
      onTimelineClicked={payload => {
        if (controlledCurrentTime) setCurrentTimeMs(secondsToMs(payload.targetTime))
        demoProps.onTimelineClicked?.(payload)
      }}
      onLoudButtonClicked={payload => {
        setMute(false)
        demoProps.onLoudButtonClicked?.(payload)
      }}
      onMuteButtonClicked={payload => {
        setMute(true)
        demoProps.onMuteButtonClicked?.(payload)
      }}
      onFullscreenButtonClicked={payload => {
        setFullscreen(!payload.isFullscreen)
        demoProps.onFullscreenButtonClicked?.(payload)
      }}
      currentTimeMs={currentTimeMs} />
    </>
  )
}

/* Uncontrolled: the component owns every bit of its state, including the time,
so there is nothing for the demo to drive here. */
const VideoUncontrolledDemo: FunctionComponent = (demoProps: VideoProps) => <>
  <h2>Video/index.tsx</h2>
  <Video {...demoProps} />
</>

export const VideoDemo: FunctionComponent = () => {
  const [currentTimeMs, setCurrentTimeMs] = useState<undefined | number>(undefined)
  const [totalTimeMs, setTotalTimeMs] = useState<undefined | number>(undefined)

  const defaultDemoProps: Record<string, unknown> = {
    pauseBtnContent: 'Mettre en pause',
    playBtnContent: 'Lire',
    loudBtnContent: 'Activer le son',
    muteBtnContent: 'Désactiver le son',
    fullscreenBtnContent: 'Passer en plein écran',
    sources: [{
      src: 'https://assets-decodeurs.lemonde.fr/redacweb/2507-st-louis/siege.mp4',
      type: 'video/mp4'
    }],
    controls: true,
    tracks: [{
      src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt',
      kind: 'subtitles',
      srclang: 'fr',
      label: 'Français',
      default: true
    }],
    subtitles: {
      src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/massyka.srt'
    }
  } satisfies VideoProps;

  const demoProps: Record<string, unknown> = {
    ...defaultDemoProps,
    controls: true,
    muted: true,
    // autoPlay: true,
    whenVisible: ['play'],
    whenHidden: ['pause', 'mute'],
    loop: true,
    currentTimeMs,
    onLoadedMetadata: (e) => {
      setTotalTimeMs(secondsToMs(e.currentTarget.duration))
    },
    onPlayButtonClicked: () => {},
    onPauseButtonClicked: () => {},
    onLoudButtonClicked: () => {},
    onMuteButtonClicked: () => {},
    onFullscreenButtonClicked: () => {},
    onVolumeRangeChanged: () => {},
    onRateRangeChanged: () => {},
    onTimelineClicked: () => {},
    onIsPlayingChanged: (isPlaying) => {},
    onIsLoudChanged: (isLoud) => {},
    onIsFullscreenChanged: (isFullscreen) => {},
    onVolumeChanged: (volume) => {},
    onPlaybackRateChanged: (playbackRate) => {},
    onCurrentTimeMsChanged: (currentTimeMs) => {}
  } satisfies VideoProps


  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoStyles={demoStyles}
    demoProps={demoProps}>

    <div style={{ padding: '1em', margin: '1em', border: '1px solid black', width: 'fit-content' }}>
      <div>
        currentTimeMs:
        <button onClick={() => setCurrentTimeMs(undefined)}>Unset</button>
        <button onClick={() => setCurrentTimeMs(0)}>Reset</button>
        <button onClick={() => setCurrentTimeMs((currentTimeMs) => currentTimeMs === undefined ? 0 : add(currentTimeMs, 100000, totalTimeMs ?? 100000))}>+100s</button>
        <button onClick={() => setCurrentTimeMs((currentTimeMs) => currentTimeMs === undefined ? 0 : sub(currentTimeMs, 100000, 0))}>-100s</button>
        – <strong>{currentTimeMs === undefined ? 'undefined' : currentTimeMs}</strong> – <em>If currentTimeMs === undefined, the video can be played. Otherwise it won't be played and you must go forward or back thanks to the currentTimeMs property</em>
      </div>
    </div>
    <div style={{ height: '80vh' }} />   
    <VideoUncontrolledDemo {...demoProps} />
    <div style={{ height: '80vh' }} />   
    <VideoControlledDemo {...defaultDemoProps}  />
  </CompDisplayer>
}
