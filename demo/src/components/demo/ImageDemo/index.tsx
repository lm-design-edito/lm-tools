import { type FunctionComponent } from 'react'
import {
  Image,
  type Props as ImageProps
} from '~/components/Image/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import { demoStyles as disclaimerDemoStyles } from '../DisclaimerDemo/index.js' 
import { demoStyles as theatreDemoStyles } from '../TheatreDemo/index.js' 
import {
  disclaimer as disclaimerClassName,
  image as publicClassName,
  theatre as theatrePublicClassName
} from '~/components/public-classnames.js'

const name = 'Image'

const description = `
Image component. Wraps a native \`<img>\` (or \`<picture>\`) element with
optional responsive sources, an optional disclaimer gate.


### Child elements
- \`__picture\` — wrapping \`<picture>\` element, always rendered. Contains the
\`<source>\` elements (if any) and the \`<img>\`.
- \`__img\` — the native \`<img>\` element.

@param props - Component properties.
@see {@link Props}
@returns A \`<figure>\` element containing a \`<picture>\` with the image,
and an optional disclaimer overlay.`

const tsxDetails = `/**
 * Describes a single responsive image source for use in a \`<picture>\` element.
 *
 * @property srcSet - One or more image URLs with optional width/density descriptors
 * (e.g. \`'img@2x.png 2x'\`).
 * @property type - MIME type hint for the source (e.g. \`'image/webp'\`).
 * @property media - Media condition under which this source is selected
 * (e.g. \`'(max-width: 768px)'\`).
 * @property sizes - Sizes attribute forwarded to the \`<source>\` element.
 */
type SourceData = {
  srcSet?: string
  type?: string
  media?: string
  sizes?: string
}

/**
 * Props for the {@link Image} component.
 *
 * Extends all native \`ImgHTMLAttributes<HTMLImageElement>\`, so any standard
 * img attribute (\`alt\`, \`loading\`, \`sizes\`, \`srcSet\`, etc.) can be passed
 * and will be forwarded to the underlying \`<img>\` element.
 *
 * @property sources - One or more responsive sources rendered as \`<source>\`
 * elements inside a wrapping \`<picture>\`. Accepts:
 * - a single srcSet string,
 * - an array of srcSet strings,
 * - an array of {@link SourceData} objects for full \`<source>\` control.
 * @property disclaimer - Props forwarded to the internal {@link Disclaimer} component.
 * While the disclaimer is active the \`<img>\` is hidden.
 * @property theatre - Props forwarded to the internal {@link Theatre} component.
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  sources?: string | string[] | SourceData[]
  disclaimer?: DisclaimerProps
  theatre?: TheatreProps
}> & ImgHTMLAttributes<HTMLImageElement>`


/* Demo CSS */
const demoStyles = `
.${publicClassName} {
  position: relative;
}

.${publicClassName} img,
.${publicClassName} picture {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
  
.${publicClassName} {
  ${theatreDemoStyles.split('\n').join('\n  ')}
}

.${publicClassName} {
  ${disclaimerDemoStyles.split('\n').join('\n  ')}
}
  
.${publicClassName} .${theatrePublicClassName}__open-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}
  
.${publicClassName} .${disclaimerClassName}.${disclaimerClassName}--on .${theatrePublicClassName}__stage,
.${publicClassName} .${disclaimerClassName}.${disclaimerClassName}--on .${theatrePublicClassName}__close-btn {
  display: none;
}`

const demoProps: ImageProps = {
  src: 'https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg',
  alt: 'Image demo',
  disclaimer: {
    content: 'Contenu sensible',
    togglerContent: <button>Afficher l'image</button>,
    defaultIsOn: true
  },
  theatre: {
    openBtnContent: <button>Ouvrir le théâtre</button>,
    closeBtnContent: <button>Fermer le théâtre</button>,
    defaultIsOn: false
  }
}

export const ImageDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    demoStyles={demoStyles}
    description={description}
    demoProps={demoProps as Record<string, unknown>}
    tsxDetails={tsxDetails}>
    <Image {...demoProps} />
  </CompDisplayer>
}
