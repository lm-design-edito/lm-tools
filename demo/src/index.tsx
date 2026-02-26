import {
  type ReactNode,
  useState
} from 'react'
import { createRoot } from 'react-dom/client'

// Lib components
import { Disclaimer } from '~/components/Disclaimer/index.js'
import { Drawer } from '~/components/Drawer/index.js'
import { EventListenerComponent } from '~/components/EventListener/index.js'
import { Gallery } from '~/components/Gallery/index.js'
import { IntersectionObserverComponent } from '~/components/IntersectionObserver/index.js'
import { Paginator } from '~/components/Paginator/index.js'
import { ResizeObserverComponent } from '~/components/ResizeObserver/index.js'
import { Scrllgngn } from '~/components/Scrllgngn/index.js'
import { ShadowRootComponent } from '~/components/ShadowRoot/index.js'
import { Subtitles } from '~/components/Subtitles/index.js'
import { Video } from '~/components/Video/index.js'

// Demo components
import { DisclaimerDemo } from './components/DisclaimerDemo/index.js'
import { GalleryDemo } from './components/GalleryDemo/index.js'
import { ScrllgngnDemo } from './components/ScrllgngnDemo/index.js'

// Demo styles
import cssModule from './styles.module.css'

const components: Array<{
  name: string,
  comp: ReactNode
}> = [
  { name: 'Disclaimer', comp: <DisclaimerDemo /> },
  { name: 'Drawer', comp: <>Drawer Tab !!!</> },
  { name: 'EventListener', comp: <>EventListener Tab !!!</> },
  { name: 'Gallery', comp: <GalleryDemo /> },
  { name: 'IntersectionObserver', comp: <>IntersectionObserver Tab !!!</> },
  { name: 'Paginator', comp: <>Paginator Tab !!!</> },
  { name: 'ResizeObserver', comp: <>ResizeObserver Tab !!!</> },
  { name: 'Scrllgngn', comp: <ScrllgngnDemo /> },
  { name: 'ShadowRoot', comp: <>ShadowRoot Tab !!!</> },
  { name: 'Subtitles', comp: <>Subtitles Tab !!!</> },
  { name: 'Video', comp: <>Video Tab !!!</> }
]

const App = () => {
  const initActiveTab = 5
  const [activeTab, setActiveTab] = useState(initActiveTab)

  return <div className={cssModule['app']}>
    <Gallery
      className={cssModule['components-nav']}
      initActive={initActiveTab}
      noSnap>
      {components.map(({ name }, pos) => {
        const classes = [cssModule['components-nav-item']]
        if (pos === activeTab) classes.push(cssModule['components-nav-item--active'])
        return <button
          className={classes.join(' ')}
          onClick={() => setActiveTab(pos)}>
          {name}
        </button>
      })}
    </Gallery>

    <div className={cssModule['components-panel']}>
      {components[activeTab]?.comp}
    </div>

    {/* <Gallery
      className={cssModule['components-panel']}
      active={activeTab}>
      {components.map(({ comp }, pos) => {
        const classes = [cssModule['component-panel']]
        if (pos === activeTab) classes.push(cssModule['component-panel--active'])
        return <div className={classes.join(' ')}>
          {pos === activeTab ? comp : null}
        </div>
      })}
    </Gallery> */}

    {/* Gallery */}
    {/* <GalleryDemo /> */}
    
    {/* Scrllgngn */}
    {/* <ScrllgngnDemo /> */}

    {/* Paginator */}
    {/* <h3>Paginator</h3>
    <p>This is a gallery</p>
    <Paginator thresholdOffsetPercent={80}>
      <div style={{ width: '100%', height: '120vh', backgroundColor: 'darkgrey' }}>Page 1</div>
      <div style={{ width: '100%', height: '120vh', backgroundColor: 'tan' }}>Page 2</div>
      <div style={{ width: '100%', height: '120vh', backgroundColor: 'plum' }}>Page 3</div>
    </Paginator> */}

    {/* Drawer */}
    {/* <h3>Drawer</h3>
    <p>This is a drawer</p>
    <Drawer
      initialIsOpened={true}
      openerContent="Open this"
      closerContent="Close this">
      <div style={{ width: 200, height: 200, backgroundColor: 'slateblue' }}></div>
    </Drawer> */}

    {/* ShadowRoot */}
    {/* <h3>ShadowRoot</h3>
    <p>This is a shadow root</p>
    <ShadowRootComponent>
      <div style={{ width: 200, height: 200, backgroundColor: 'slateblue' }}></div>
    </ShadowRootComponent> */}

    {/* ResizeObserver */}
    {/* <h3>ResizeObserver</h3>
    <p>This is a resize observer</p>
    <ResizeObserverComponent>
      <div style={{
        width: '50%',
        height: '600px',
        backgroundColor: 'coral',
        position: 'relative'
      }}>
        <span>resize me!!</span>
        <div style={{
          position: 'absolute',
          left: '70%',
          width: '70%',
          height: '200px',
          backgroundColor: 'cornflowerblue'
        }} />
      </div>
    </ResizeObserverComponent> */}

    {/* Disclaimer */}
    {/* <h3>Disclaimer</h3>
    <p>This is a disclaimer</p>
    <Disclaimer
      content='U sure bro?'
      togglerContent='Lets go'>
      <div>Disclosed content</div>
    </Disclaimer>
    <br />
    <br /> */}

    {/* EventListener */}
    {/* <h3>EventListener</h3>
    <p>Click on the button to see the console log.</p>
    <p>Hover on the button to see the console log.</p>
    <pre>
      console.log('clicked')
    </pre>
    <EventListenerComponent
      type='click'
      onEvent={() => console.log('clicked')}>
      <EventListenerComponent
        type='mouseenter'
        onEvent={() => console.log('hovered')}>
        Child
      </EventListenerComponent>
    </EventListenerComponent> */}

    {/* IntersectionObserver */}
    {/* <h3>IntersectionObserver</h3>
    <IntersectionObserverComponent
      onIntersection={details => console.log(details)}>
      <div style={{
        backgroundColor: 'red',
        width: 400,
        height: 400
      }} />
    </IntersectionObserverComponent> */}

    {/* Subtitles */}
    {/* <h3>Subtitles</h3>
    <Subtitles
      src="https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt"
      timecodeMs={29752} />
    -----
    <Subtitles
      src="https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt"
      srtFileContent={`
        1
        00:00:00,599 --> 00:00:00,608
        Il faut

        2
        00:00:00,709 --> 00:00:00,888
        que

        3
        00:00:01,000 --> 00:00:01,012
        j'enlève
      `}
      timecodeMs={0} /> */}

    {/* Vidéo */}
    {/* <h3>Vidéo</h3> */}
    {/* <Video
      sources="https://assets-decodeurs.lemonde.fr/redacweb/2507-st-louis/siege.mp4"
      controls
      autoPlay
      loop /> 
    <Video
      pauseBtnContent="Mettre en pause"
      playBtnContent="Lire"
      soundOnBtnContent="Activer le son"
      soundOffBtnContent="Désactiver le son"
      fullscreenBtnContent="Passer en plein écran"
      sources={[{
        src: 'https://assets-decodeurs.lemonde.fr/redacweb/2507-st-louis/siege.mp4',
        type: 'video/mp4'
      }]}
      controls
      autoPlay
      loop
      tracks={[{
        kind: 'subtitles',
        src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt',
        srclang: 'fr',
        label: 'Français',
        default: true
      }]} /> */}
  </div>
}

const target = document.querySelector('.root')
if (target !== null) createRoot(target).render(<App />)
