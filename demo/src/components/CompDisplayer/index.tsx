import {
  type PropsWithChildren,
  type FunctionComponent,
  type ReactNode,
  useState,
  useEffect,
  isValidElement
} from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { randomHash } from '~/agnostic/random/uuid/index.js'
import { Drawer } from '~/components/Drawer/index.js'
import cssModule from './styles.module.css'

export type Props = PropsWithChildren<{
  name?: ReactNode
  description?: ReactNode
  tsxDetails?: string
  demoStyles?: string
  demoProps?: Record<string, unknown>
}>

export const CompDisplayer: FunctionComponent<Props> = ({
  name,
  description,
  tsxDetails,
  demoStyles,
  demoProps,
  children
}) => {
  const [id] = useState(`_${randomHash(6)}`)
  const [withCss, setWithCss] = useState(true)
  const handleToggleCss = () => setWithCss(!withCss)

  const [strDemoProps, setStrDemoProps] = useState('')
  useEffect(() => {
    try {
      let toStringify: Record<string, unknown> = {}
      Object.entries(demoProps ?? {}).map(([key, val]) => {
        if (typeof val === 'string'
          || typeof val === 'number'
          || typeof val === 'boolean'
          || val === null
          || typeof val === 'function'
        ) {
          toStringify[key] = val
        } else if (isValidElement(val)) {
          toStringify[key] = '[React.element]'
        }
      })
      const str = JSON.stringify(toStringify, null, 2)
      setStrDemoProps(str)
    } catch (err) {
      console.warn(err)
      console.warn(`Failed serializing demo props`, demoProps)
    }
  })

  console.log('!!!')
  console.log(strDemoProps)

  return <div
    id={id}
    className={cssModule['root']}>
    {name !== undefined && <h3 className={cssModule['name']}>{name}</h3>}
    {description !== undefined && <p className={cssModule['description']}>{description}</p>}
    
    {/* TSX Details */}
    {tsxDetails !== undefined && <div className={cssModule['details']}>
      <SyntaxHighlighter
        language='tsx'
        style={docco}>
        {tsxDetails}
      </SyntaxHighlighter>
    </div>}

    {/* Demo Props */}
    {strDemoProps !== undefined && <div className={cssModule['demo-css']}>
      <Drawer
        openerContent={<>
          <button>↓ See</button>
          <label> Custom demo Props</label>
        </>}
        closerContent={<>
          <button>↑ Close</button>
          <label> Custom demo Props</label>
        </>}>
        {/* <><pre>{strDemoProps}</pre></> */}
        <SyntaxHighlighter
          language='javascript'
          style={docco}>
          {strDemoProps}
        </SyntaxHighlighter>
      </Drawer>
    </div>}
    {/* {strDemoProps !== undefined && <div className={cssModule['demo-css']}>
      <Drawer
        initialIsOpened={false}
        openerContent={<div style={{
          borderBottom: '1px solid #ddd',
          paddingBottom: '8px'
        }}>
          <button>↓ See</button>
          <label> Custom demo Props</label>
        </div>}
        closerContent={<div style={{
          borderBottom: '1px solid #ddd',
          paddingBottom: '8px'
        }}>
          <button>↑ Close</button>
          <label> Custom demo Props</label>
        </div>}>
        <br />
        <SyntaxHighlighter
          language='javascript'
          style={docco}>
          {strDemoProps}
        </SyntaxHighlighter>
      </Drawer>
    </div>} */}

    {/* Demo CSS */}
    {demoStyles !== undefined && withCss && <style>{`#${id} {\n${demoStyles}\n}`}</style>}
    {demoStyles !== undefined && <div className={cssModule['demo-css']}>
      <Drawer
        openerContent={<>
          <button>↓ See</button>
          <label> Custom demo CSS</label>
          <button onClick={e => {
            e.stopPropagation()
            handleToggleCss()
          }}>{withCss ? 'Disable' : 'Enable'}</button>
        </>}
        closerContent={<>
          <button>↑ Close</button>
          <label> Custom demo CSS</label>
        </>}>
        <SyntaxHighlighter
          language='css'
          style={docco}>
          {demoStyles}
        </SyntaxHighlighter>
      </Drawer>
    </div>}
    {/* {demoStyles !== undefined && <div className={cssModule['demo-css']}>
      <Drawer
        initialIsOpened={false}
        openerContent={<div style={{
          borderBottom: '1px solid #ddd',
          paddingBottom: '8px'
        }}>
          <button>↓ See</button>
          <label> Custom demo CSS </label>
          <button onClick={e => {
            e.stopPropagation()
            handleToggleCss()
          }}>{withCss ? 'Disable' : 'Enable'}</button>
        </div>}
        closerContent={<div style={{
          borderBottom: '1px solid #ddd',
          paddingBottom: '8px'
        }}>
          <button>↑ Close</button>
          <label> Custom demo CSS </label>
          <button onClick={e => {
            e.stopPropagation()
            handleToggleCss()
          }}>{withCss ? 'Disable' : 'Enable'}</button>
        </div>}>
        <br />
        <SyntaxHighlighter
          language='css'
          style={docco}>
          {demoStyles}
        </SyntaxHighlighter>
      </Drawer>
    </div>} */}

    {/* {demoProps !== undefined && <div className={cssModule['demo-props']}>
      <Drawer
        initialIsOpened={false}
        openerContent={<div style={{
          borderBottom: '1px solid #ddd',
          paddingBottom: '8px'
        }}>
          <button>↓ See</button>
          <label> Custom demo Props</label>
        </div>}
        closerContent={<div style={{
          borderBottom: '1px solid #ddd',
          paddingBottom: '8px'
        }}>
          <button>↑ Close</button>
          <label> Custom demo Props</label>
        </div>}>
        <br />
        <SyntaxHighlighter
          language='javascript'
          style={docco}>
          {strDemoProps}
        </SyntaxHighlighter>
      </Drawer>
    </div>} */}

    {/* Content */}
    {children !== undefined && <>
      <div className={cssModule['demo-label']}>Demo</div>
      <div className={cssModule['content']}>
        {children}
      </div>
    </>}
  </div>
}
