import { createRoot } from 'react-dom/client'
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
import styles from './styles.module.css'

const App = () => <div className={styles['app']}>
  {/* Scrllgngn */}
  <h3>Scrllgngn</h3>
  <p>This is a gallery</p>
  <div style={{ width: '50%' }}>
    <Scrllgngn
      forceStickBlocks='none'
      thresholdOffsetPercent={80}
      pages={[
        {
          id: 'premiere-page',
          blocks: [{
            id: 'scr-blk-1',
            depth: 'scroll',
            children: <div style={{
              width: 300,
              height: 2000,
              backgroundColor: 'linen'
            }}>scrl-blk-1</div>
          }, {
            id: 'bk-blk-1',
            depth: 'back',
            zIndex: 1000,
            children: <div style={{ width: 100, height: 200, marginLeft: 200, backgroundColor: 'maroon' }}>back 1</div>
          }, {
            id: 'ft-blk-1',
            depth: 'front',
            children: <div style={{ width: 100, height: 200, marginLeft: 50, backgroundColor: 'darkorange' }}>front 1</div>
          }, {
            depth: 'back',
            children: <div style={{ width: 100, height: 200, marginLeft: 50, marginTop: 200, backgroundColor: 'violet' }}>back 2</div>
          }]
        },
        {
          id: 'deuz-page',
          blocks: [{
            id: 'scr-blk-2',
            depth: 'scroll',
            children: <div style={{
              width: 300,
              height: 2000,
              backgroundColor: 'gold'
            }}>scrl-blk-2</div>
          }, {
            id: 'bk-blk-1'
          }]
        },
        {
          id: 'troiz-page',
          blocks: [{
            id: 'scr-blk-3',
            depth: 'scroll',
            children: <div style={{
              width: 300,
              height: 2000,
              backgroundColor: 'honeydew'
            }}>scrl-blk-3</div>
          }, {
            id: 'ft-blk-1'
          }]
        }, {
          id: 'quatr-page',
          blocks: [{
            id: 'scr-blk-4',
            depth: 'scroll',
            children: <div style={{
              width: 300,
              height: 2000,
              backgroundColor: 'fuchsia'
            }}>scrl-blk-4</div>
          }]
        }, {
          id: 'cinq-page',
          blocks: [{
            id: 'scr-blk-5',
            depth: 'scroll',
            children: <div style={{
              width: 300,
              height: 2000,
              backgroundColor: 'orangered'
            }}>scrl-blk-5</div>
          }]
        }, {
          id: 'six-page',
          blocks: [{
            id: 'scr-blk-6',
            depth: 'scroll',
            children: <div style={{
              width: 300,
              height: 2000,
              backgroundColor: 'papayawhip'
            }}>scrl-blk-6</div>
          }, {
            id: 'ft-blk-1'
          }]
        }
      ]} />
  </div>

  {/* Paginator */}
  <h3>Paginator</h3>
  <p>This is a gallery</p>
  <Paginator thresholdOffsetPercent={80}>
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'darkgrey' }}>Page 1</div>
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'tan' }}>Page 2</div>
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'plum' }}>Page 3</div>
  </Paginator>

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

  {/* Subtitles */}
  <h3>Subtitles</h3>
  <Subtitles subsSrc="https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt" timecodeMs={29752} />
  <Subtitles subsSrc="https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt" subsGroups={[1, 10]} timecodeMs={29752} />

  {/* Vidéo */}
  <h3>Vidéo</h3>
</div>

const target = document.querySelector('.root')
if (target !== null) createRoot(target).render(<App />)
