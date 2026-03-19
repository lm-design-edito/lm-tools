import { type ReactNode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Gallery } from '~/components/Gallery/index.js'

// Demo components
import { BeforeAfterDemo } from './components/demo/BeforeAfterDemo/index.js'
import { DisclaimerDemo } from './components/demo/DisclaimerDemo/index.js'
import { DrawerDemo } from './components/demo/DrawerDemo/index.js'
import { EventListenerDemo } from './components/demo/EventListenerDemo/index.js'
import { GalleryDemo } from './components/demo/GalleryDemo/index.js'
import { ImageDemo } from './components/demo/ImageDemo/index.js'
import { IntersectionObserverDemo } from './components/demo/IntersectionObserverDemo/index.js'
import { OverlayerDemo } from './components/demo/OverlayerDemo/index.js'
import { PaginatorDemo } from './components/demo/PaginatorDemo/index.js'
import { ResizeObserverDemo } from './components/demo/ResizeObserverDemo/index.js'
import { ScrllgngnDemo } from './components/demo/ScrllgngnDemo/index.js'
import { ScrollListenerDemo } from './components/demo/ScrollListenerDemo/index.js'
import { SequencerDemo } from './components/demo/SequencerDemo/index.js'
import { ShadowRootDemo } from './components/demo/ShadowRootDemo/index.js'
import { SubtitlesDemo } from './components/demo/SubtitlesDemo/index.js'
import { TheatreDemo } from './components/demo/TheatreDemo/index.js'
import { UIModuleDemo } from './components/demo/UIModuleDemo/index.js'
import { VideoDemo } from './components/demo/VideoDemo/index.js'

// Demo styles
import cssModule from './styles.module.css'

const components: Array<{
  name: string
  comp: ReactNode
}> = [
  { name: 'BeforeAfter', comp: <BeforeAfterDemo /> },
  { name: 'Disclaimer', comp: <DisclaimerDemo /> },
  { name: 'Drawer', comp: <DrawerDemo /> },
  { name: 'EventListener', comp: <EventListenerDemo /> },
  { name: 'Gallery', comp: <GalleryDemo /> },
  { name: 'Image', comp: <ImageDemo /> },
  { name: 'IntersectionObserver', comp: <IntersectionObserverDemo /> },
  { name: 'Overlayer', comp: <OverlayerDemo /> },
  { name: 'Paginator', comp: <PaginatorDemo /> },
  { name: 'ResizeObserver', comp: <ResizeObserverDemo /> },
  { name: 'Scrllgngn', comp: <ScrllgngnDemo /> },
  { name: 'ScrollListener', comp: <ScrollListenerDemo /> },
  { name: 'Sequencer', comp: <SequencerDemo /> },
  { name: 'ShadowRoot', comp: <ShadowRootDemo /> },
  { name: 'Subtitles', comp: <SubtitlesDemo /> },
  { name: 'Theatre', comp: <TheatreDemo /> },
  { name: 'UIModule', comp: <UIModuleDemo /> },
  { name: 'Video', comp: <VideoDemo /> }
]

const App = () => {
  const initActiveTab = components.findIndex(e => e.name === 'Overlayer')
  const [activeTab, setActiveTab] = useState(initActiveTab)
  return <div className={cssModule['app']}>
    <Gallery
      className={cssModule['components-nav']}
      initActive={initActiveTab}>
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
  </div>
}

const target = document.querySelector('.root')
if (target !== null) createRoot(target).render(<App />)
