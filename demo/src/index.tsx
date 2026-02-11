import { createRoot } from 'react-dom/client'
import { Disclaimer } from '~/components/Disclaimer/index.js'
import { EventListenerComponent } from '~/components/EventListener/index.js'
import { Input } from '~/components/Input/index.js'
import { IntersectionObserverComponent } from '~/components/IntersectionObserver/index.js'
import { ResizeObserverComponent } from '~/components/ResizeObserver/index.js'
import styles from './styles.module.css'

const App = () => <div className={styles['app']}>
  <h3>ResizeObserver</h3>
  <p>This is a resize observer</p>
  <ResizeObserverComponent>
    <div style={{
      width: '100%',
      height: '600px',
      backgroundColor: 'coral'
    }}>resize me!!</div>
  </ResizeObserverComponent>


  <h3>Disclaimer</h3>
  <p>This is a disclaimer</p>
  <Disclaimer
    content='U sure bro?'
    buttonContent='Lets go'>
    <div>Disclosed content</div>
  </Disclaimer>
  <br />
  <br />

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

  <h3>Input</h3>
  <Input
    type="number"
    name="some-name"
    label='Label' />

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
