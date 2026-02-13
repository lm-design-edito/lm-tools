import { createRoot } from 'react-dom/client'
import { Disclaimer } from '~/components/Disclaimer/index.js'
import { Drawer } from '~/components/Drawer/index.js'
import { EventListenerComponent } from '~/components/EventListener/index.js'
import { Gallery } from '~/components/Gallery/index.js'
import { IntersectionObserverComponent } from '~/components/IntersectionObserver/index.js'
import { ResizeObserverComponent } from '~/components/ResizeObserver/index.js'
import { ShadowRootComponent } from '~/components/ShadowRoot/index.js'
import styles from './styles.module.css'

const App = () => <div className={styles['app']}>
  {/* Gallery */}
  <h3>Gallery</h3>
  <p>This is a gallery</p>
  <Gallery
    paddingLeft='30%'
    paddingRight='30%'
    prevButtonContent='<'
    nextButtonContent='>'
    paginationContent={page => `Page ${page}`}>
    <div style={{ width: '40px', height: '200px', backgroundColor: 'coral', margin: 40 }}>truc</div>
    <div style={{ width: '400px', height: '200px', backgroundColor: 'cadetblue', margin: 40 }}>trac</div>
    <div style={{ width: '800px', height: '200px', backgroundColor: 'chartreuse', margin: 40 }}>troc</div>
    <div style={{ width: '80px', height: '200px', backgroundColor: 'coral', margin: 40 }}>truc</div>
    <div style={{ width: '120px', height: '200px', backgroundColor: 'cadetblue', margin: 40 }}>trac</div>
    <div style={{ width: '1200px', height: '200px', backgroundColor: 'chartreuse', margin: 40 }}>troc</div>
    <div style={{ width: '40px', height: '200px', backgroundColor: 'coral', margin: 40 }}>truc</div>
    <div style={{ width: '400px', height: '200px', backgroundColor: 'cadetblue', margin: 40 }}>trac</div>
    <div style={{ width: '800px', height: '200px', backgroundColor: 'chartreuse', margin: 40 }}>troc</div>
    <div style={{ width: '80px', height: '200px', backgroundColor: 'coral', margin: 40 }}>truc</div>
    <div style={{ width: '120px', height: '200px', backgroundColor: 'cadetblue', margin: 40 }}>trac</div>
    <div style={{ width: '1200px', height: '200px', backgroundColor: 'chartreuse', margin: 40 }}>troc</div>
  </Gallery>

  {/* Drawer */}
  <h3>Drawer</h3>
  <p>This is a drawer</p>
  <Drawer
    initialIsOpened={true}
    openerContent="Open this"
    closerContent="Close this">
    <div style={{ width: 200, height: 200, backgroundColor: 'slateblue' }}></div>
  </Drawer>

  {/* ShadowRoot */}
  <h3>ShadowRoot</h3>
  <p>This is a shadow root</p>
  <ShadowRootComponent>
    <div style={{ width: 200, height: 200, backgroundColor: 'slateblue' }}></div>
  </ShadowRootComponent>

  {/* ResizeObserver */}
  <h3>ResizeObserver</h3>
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
  </ResizeObserverComponent>

  {/* Disclaimer */}
  <h3>Disclaimer</h3>
  <p>This is a disclaimer</p>
  <Disclaimer
    content='U sure bro?'
    togglerContent='Lets go'>
    <div>Disclosed content</div>
  </Disclaimer>
  <br />
  <br />

  {/* EventListener */}
  <h3>EventListener</h3>
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
  </EventListenerComponent>

  {/* IntersectionObserver */}
  <h3>IntersectionObserver</h3>
  <IntersectionObserverComponent
    onIntersection={details => console.log(details)}>
    <div style={{
      backgroundColor: 'red',
      width: 400,
      height: 400
    }} />
  </IntersectionObserverComponent>
</div>

const target = document.querySelector('.root')
if (target !== null) createRoot(target).render(<App />)
