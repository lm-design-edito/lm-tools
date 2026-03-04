import {
  type ReactNode,
  useState
} from 'react'
import { createRoot } from 'react-dom/client'

import { Gallery } from '~/components/Gallery/index.js'

import { DisclaimerDemo } from './components/DisclaimerDemo/index.js'
import { DrawerDemo } from './components/DrawerDemo/index.js'
import { EventListenerDemo } from './components/EventListenerDemo/index.js'
import { IntersectionObserverDemo } from './components/IntersectionObserverDemo/index.js'
import { GalleryDemo } from './components/GalleryDemo/index.js'
import { PaginatorDemo } from './components/PaginatorDemo/index.js'
import { ResizeObserverDemo } from './components/ResizeObserverDemo/index.js'
import { ScrllgngnDemo } from './components/ScrllgngnDemo/index.js'
import { ShadowRootDemo } from './components/ShadowRootDemo/index.js'
import { SubtitlesDemo } from './components/SubtitlesDemo/index.js'

import cssModule from './styles.module.css'
import { Drawer } from '~/components/Drawer/index.js'
import { VideoDemo } from 'components/VideoDemo/index.js'

const components: Array<{
  name: string,
  comp: ReactNode
}> = [
  { name: 'Disclaimer', comp: <DisclaimerDemo /> },
  { name: 'Drawer', comp: <DrawerDemo /> },
  { name: 'EventListener', comp: <EventListenerDemo /> },
  { name: 'Gallery', comp: <GalleryDemo /> },
  { name: 'IntersectionObserver', comp: <IntersectionObserverDemo /> },
  { name: 'Paginator', comp: <PaginatorDemo /> },
  { name: 'ResizeObserver', comp: <ResizeObserverDemo /> },
  { name: 'Scrllgngn', comp: <ScrllgngnDemo /> },
  { name: 'ShadowRoot', comp: <ShadowRootDemo /> },
  { name: 'Subtitles', comp: <SubtitlesDemo /> },
  { name: 'Video', comp: <VideoDemo /> }
]

const App = () => {
  const initActiveTab = 0
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
