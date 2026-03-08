import {
  type PropsWithChildren,
  type FunctionComponent,
  type ReactNode,
  useState,
  useEffect,
  isValidElement
} from 'react'
import { randomHash } from '~/agnostic/random/uuid/index.js'
import { isNonNullObject } from '~/agnostic/objects/is-object/index.js'
import { Drawer } from '~/components/Drawer/index.js'
import { SyntaxHighlighter } from '../SyntaxHighlighter/index.js'
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
      Object.entries(demoProps ?? {}).forEach(([key, val]) => {
        if (val === undefined) return
        if (typeof val === 'string'
          || typeof val === 'number'
          || typeof val === 'boolean'
          || val === null
        ) {
          toStringify[key] = val
        } else if (isValidElement(val)) {
          toStringify[key] = `[React Element]`
        } else if (typeof val === 'function') {
          toStringify[key] = val.toString()
        } else if (isNonNullObject(val)
          && 'toString' in val
          && typeof val.toString === 'function') {
          toStringify[key] = val.toString()
        } else {
          toStringify[key] = '[Unknown]'
        }
      })
      const str = JSON.stringify(toStringify, null, 2)
      setStrDemoProps(str)
    } catch (err) {
      console.warn(err)
      console.warn(`Failed serializing demo props`, demoProps)
    }
  })

  return <div
    id={id}
    className={cssModule['root']}>
    {name !== undefined && <h3 className={cssModule['name']}>{name}</h3>}
    {typeof description === 'string' && <pre className={cssModule['description']}>{description.trim()}</pre>}
    {description !== undefined
      && typeof description !== 'string'
      && <p className={cssModule['description']}>{description}</p>}
    {/* TSX Details */}
    {tsxDetails !== undefined && <div className={cssModule['details']}>
      <SyntaxHighlighter
        code={tsxDetails.trim()}
        lang='tsx'
        theme='github-dark' />
    </div>}

    {/* Demo Props */}
    {strDemoProps !== undefined && <div className={cssModule['demo-props']}>
      <Drawer
        openerContent={<>
          <button>↓ See</button>
          <label> Custom demo Props</label>
        </>}
        closerContent={<>
          <button>↑ Close</button>
          <label> Custom demo Props</label>
        </>}>
        <SyntaxHighlighter
          lang='json'
          code={strDemoProps.trim()}
          theme='github-dark' />
      </Drawer>
    </div>}

    {/* Demo CSS */}
    {(demoStyles ?? '').trim() !== '' && withCss && <style>{`#${id} {\n${demoStyles}\n}`}</style>}
    {(demoStyles ?? '').trim() !== '' && <div className={cssModule['demo-css']}>
      <Drawer
        openerContent={<>
          <button>↓ See</button>
          <label> Custom demo CSS </label>
          <button onClick={e => {
            e.stopPropagation()
            handleToggleCss()
          }}>{withCss ? 'Disable' : 'Enable'}</button>
        </>}
        closerContent={<>
          <button>↑ Close</button>
          <label> Custom demo CSS </label>
        </>}>
        <SyntaxHighlighter
          code={demoStyles?.trim() ?? ''}
          lang='css'
          theme='github-dark' />
      </Drawer>
    </div>}

    {/* Content */}
    {children !== undefined && <>
      <div className={cssModule['demo-label']}>Demo</div>
      <div className={cssModule['content']}>
        {children}
      </div>
    </>}
  </div>
}
