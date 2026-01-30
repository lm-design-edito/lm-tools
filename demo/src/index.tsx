import { createRoot } from 'react-dom/client'
import { EventListenerComponent } from '~/components/EventListener/index.js'
import { Input } from '~/components/Input/index.js'
import { IntersectionObserverComponent } from '~/components/IntersectionObserver/index.js'
import styles from './styles.module.css'

const App = () => <div className={styles['app']}>
  <h3>EventListener</h3>
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
