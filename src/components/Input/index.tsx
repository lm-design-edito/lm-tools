import { InputHTMLAttributes, JSX } from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import * as classes from '../public-classnames.js'
import styles from './styles.module.css'

// [WIP] this is just a draft, did not really think about this

export type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label?: string | JSX.Element
  labelAfter?: boolean
}

export const Input = (props: Props) => {
  const { label, labelAfter } = props
  delete props.label
  delete props.labelAfter

  const c = clss([classes.input], { cssModule: styles })
  const inputClassName = c(null, { alt: true })
  const inputId = props.id ?? randomHash(8)

  return <>
    {label !== undefined
      && labelAfter !== true
      && <label>{label}</label>}
    <input
      {...props}
      className={inputClassName}
      id={inputId} />
    {label !== undefined
      && labelAfter === true
      && <label>{label}</label>}
  </>
}
