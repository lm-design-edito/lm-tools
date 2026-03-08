import { useState, useEffect, type FunctionComponent } from 'react'
import {
  Theatre,
  type Props as TheatreProps
} from '~/components/Theatre/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import { theatre as publicClassName } from '~/components/public-classnames.js'

const name = 'Theatre'
const description = <>
 A component that allow to toggle a fullscreen mode for its content.
 If <code>canTheatre</code> is true, the component displays a button to toggle the theatre mode.<br /><br /> Otherwise, the component can be controlled by setting the <code>isTheatreOn</code> prop and listening to the <code>onTheatreToggle</code> callback.
</>
const tsxDetails = `'Use wisely'`


/* Demo CSS */
const demoStyles = `
.${publicClassName}--on {
  background-color: rgba(0, 0, 0, 0.8);
  transition: background 0.3s ease-in;
}
`

const props: TheatreProps = {
  isTheatreOn: false,
  openBtnContent: 'Ouvrir le théâtre',
  closeBtnContent: 'Fermer le théâtre'
}

export const TheatreDemo: FunctionComponent = () => {
  const [isTheatreOn, setIsTheatreOn] = useState(false)
  
  return (
    <CompDisplayer
      name={name}
      demoStyles={demoStyles}
      description={description}
      demoProps={ props }
      tsxDetails={tsxDetails}
    >
      <Theatre {...props} isTheatreOn={isTheatreOn} onTheatreToggle={() => setIsTheatreOn(prev => !prev)}>
        <div style={{
          width: '300px',
          height: '200px',
          backgroundColor: 'lightblue',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem'
        }}>
          Contenu à basculer en mode théâtre
        </div>
      </Theatre>
    </CompDisplayer>
  )
}
