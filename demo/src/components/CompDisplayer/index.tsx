import {
  type PropsWithChildren,
  type FunctionComponent
} from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import cssModule from './styles.module.css'

export type Props = PropsWithChildren<{
  name?: string
  description?: string
  tsxDetails?: string
}>

export const CompDisplayer: FunctionComponent<Props> = ({
  name,
  description,
  tsxDetails,
  children
}) => {
  return <div className={cssModule['root']}>
    {name !== undefined && <h3 className={cssModule['name']}>{name}</h3>}
    {description !== undefined && <p className={cssModule['description']}>{description}</p>}
    {tsxDetails !== undefined && <div className={cssModule['details']}>
      <SyntaxHighlighter
        language='tsx'
        style={docco}>
        {tsxDetails}
      </SyntaxHighlighter>
    </div>}
    {children !== undefined && <>
      <div className={cssModule['demo-label']}>Demo</div>
      <div className={cssModule['content']}>
        {children}
      </div>
    </>}
  </div>
}
