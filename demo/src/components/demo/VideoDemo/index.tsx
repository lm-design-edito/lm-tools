import {
  type FunctionComponent,
  useState
} from 'react'
import {
  Video,
  type Props as VideoProps
} from '~/components/Video/index.js'
import { demoStyles as subsDemoStyles } from '../SubtitlesDemo/index.js'
import { demoStyles as disclaimerDemoStyles } from '../DisclaimerDemo/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

import { video as publicClassName } from '~/components/public-classnames.js'

const name = 'Video'

const description = `
Full-featured video player component. Wraps a native \`<video>\` element with
playback controls, volume, playback speed, a timeline, optional subtitles,
an optional disclaimer gate, and viewport-driven auto-play/mute behaviours.

### Root element modifiers
The root \`<figure>\` receives the public class name defined by \`video\` and
the following BEM-style modifier classes:
- \`--play-on\` / \`--play-off\` — reflects current playback state.
- \`--fullscreen-on\` / \`--fullscreen-off\` — reflects fullscreen state.
- \`--sound-on\` / \`--sound-off\` — reflects mute state.

### Data attributes on the root element
- \`data-play-on\` — present (empty string) when playing.
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
- \`--video-elapsed-time-ratio\` — elapsed / total ratio, fixed to 8 decimals.
Useful for driving progress-bar animations purely in CSS.

@param props - Component properties.
@see {@link Props}
@returns A \`<figure>\` element containing the video, its controls, optional
subtitles, and an optional disclaimer overlay.`

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
 * @property disclaimer - Props forwarded to the internal {@link Disclaimer} component.
 * While the disclaimer is active, \`autoPlay\` and \`muted\` are suppressed on the
 * underlying \`<video>\` element.
 * @property autoPlayWhenVisible - When \`true\`, triggers playback the first time the
 * component intersects the viewport, provided no disclaimer is active.
 * @property autoPauseWhenHidden - When \`true\`, pauses playback whenever the component
 * leaves the viewport.
 * @property autoLoudWhenVisible - When \`true\`, unmutes the video the first time the
 * component intersects the viewport, provided no disclaimer is active.
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
  disclaimer?: DisclaimerProps
  autoPlayWhenVisible?: boolean
  autoPauseWhenHidden?: boolean
  autoLoudWhenVisible?: boolean
  autoMuteWhenHidden?: boolean
}> & VideoHTMLAttributes<HTMLVideoElement>>`


/* Demo CSS */
const demoStyles = `
.${publicClassName}__timeline {
  position: relative;
  width: 100%;
  height: 10px;
  background-color: lightgray;
}

.${publicClassName}__timeline:before {
  content: '';
  position: absolute;
  left: 0;
  width: calc(
    var(--${publicClassName}-elapsed-time-ratio)
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
  
.${publicClassName} {
  ${disclaimerDemoStyles.split('\n').join('\n  ')}
}`

export const VideoDemo: FunctionComponent = () => {
  const [disclaimerIsOn, setDisclaimerIsOn] = useState<boolean | undefined>(undefined)
  const [disclaimerDefaultIsOn, setDisclaimerDefaultIsOn] = useState<boolean | undefined>(true)
  const demoProps: Record<string, unknown> = {
    pauseBtnContent: 'Mettre en pause',
    playBtnContent: 'Lire',
    loudBtnContent: 'Activer le son',
    muteBtnContent: 'Désactiver le son',
    fullScreenBtnContent: 'Passer en plein écran',
    sources: [{
      src: 'https://assets-decodeurs.lemonde.fr/redacweb/2507-st-louis/siege.mp4',
      type: 'video/mp4'
    }],
    controls: true,
    muted: true,
    // autoPlay: true,
    autoPlayWhenVisible: true,
    // autoPauseWhenHidden: true,
    autoMuteWhenHidden: true,
    // autoLoudWhenVisible: true,
    loop: true,
    tracks: [{
      kind: 'subtitles',
      src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt',
      srclang: 'fr',
      label: 'Français',
      default: true
    }],
    subtitles: {
      src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/massyka.srt'
    },
    disclaimer: {
      content: 'Contenu sensible.',
      togglerContent: <button>Cliquer pour afficher.</button>,
      defaultIsOn: disclaimerDefaultIsOn,
      isOn: disclaimerIsOn
    }
  } satisfies VideoProps
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoStyles={demoStyles}
    demoProps={demoProps}>
    <div>
      isOn
      <button onClick={() => setDisclaimerIsOn(undefined)}>{disclaimerIsOn === undefined ? <strong>undefined</strong> : 'undefined'}</button>
      <button onClick={() => setDisclaimerIsOn(true)}>{disclaimerIsOn === true ? <strong>true</strong> : 'true'}</button>
      <button onClick={() => setDisclaimerIsOn(false)}>{disclaimerIsOn === false ? <strong>false</strong> : 'false'}</button>
    </div>
    <div>
      defaultIsOn
      <button onClick={() => setDisclaimerDefaultIsOn(undefined)}>{disclaimerDefaultIsOn === undefined ? <strong>undefined</strong> : 'undefined'}</button>
      <button onClick={() => setDisclaimerDefaultIsOn(true)}>{disclaimerDefaultIsOn === true ? <strong>true</strong> : 'true'}</button>
      <button onClick={() => setDisclaimerDefaultIsOn(false)}>{disclaimerDefaultIsOn === false ? <strong>false</strong> : 'false'}</button>
    </div>
    <div style={{ height: '80vh' }} />
    <Video {...demoProps} />
  </CompDisplayer>
}
