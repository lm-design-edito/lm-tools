import {
  type FunctionComponent,
  useState,
  useEffect
} from 'react'
import { codeToHtml } from 'shiki'
import cssModule from './styles.module.css'

export const SyntaxHighlighter: FunctionComponent<{
  code: string
  lang: string
  theme: string
}> = ({ code, lang, theme }) => {
  const [content, setContent] = useState('')
  useEffect(() => {
    codeToHtml(`${code.trim()}`, { lang, theme })
      .then(html => setContent(html))
  }, [code, lang, theme])
  return <div
    className={cssModule.root}
    dangerouslySetInnerHTML={{ __html: content }} />
}
