import {
  useCallback, useRef, useEffect, type FunctionComponent,
  type PropsWithChildren
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { theatre as publicClassName, scrllgngn as scrllgngnPublicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

export type Props = PropsWithChildren<WithClassName<{
  children?: ReactNode
  content?: ReactNode
  closeBtnContent?: ReactNode
  openBtnContent?: ReactNode
  isTheatreOn?: boolean
  onTheatreToggle?: (open: boolean) => void
}>>

export const Theatre: FunctionComponent<Props> = ({
  closeBtnContent,
  openBtnContent,
  isTheatreOn,
  onTheatreToggle,

  children,
  content,
  className
}) => {
  const previousScrollY = useRef(0)
  const previousZIndex = useRef(0)

  const onOpenTheatre = useCallback((e) => {
    if (isTheatreOn === true) {
      return
    }
    e.preventDefault()
    if (onTheatreToggle !== undefined) {
      onTheatreToggle(true)
    }
  }, [isTheatreOn, onTheatreToggle])

  const onCloseTheatre = useCallback((e) => {
    if (isTheatreOn === false) {
      return
    }
    e.preventDefault()
    if (onTheatreToggle !== undefined) {
      onTheatreToggle(false)
    }
  }, [isTheatreOn, onTheatreToggle])

  const toggleBlockBodyScroll = useCallback((shouldBlock: boolean) => {
    if (shouldBlock) {
      previousScrollY.current = window.scrollY
      document.body.style.height = '100vh'
      document.body.style.overflow = 'hidden'
      document.body.scrollTo(0, previousScrollY.current)
    } else {
      document.body.style.height = 'auto'
      document.body.style.overflow = 'auto'
      document.body.scrollTo(0, previousScrollY.current)
    }
  }, [])

  const toggleScrollgngnZIndex = useCallback((shouldBringTheatreToFront: boolean) => {
    const scrollgngnEl = document.querySelector(`.${scrllgngnPublicClassName}`)
    if (scrollgngnEl === null) {
      return
    }

    if (shouldBringTheatreToFront) {
      const scrllgngnZIndex = scrllgngnEl.style.getPropertyValue('z-index')
      previousZIndex.current = scrllgngnZIndex !== undefined ? scrllgngnZIndex : 1
      scrllgngnBlock.style.setProperty('--z-index', 999999)
      return
    }

    scrllgngnBlock.style.setProperty('--z-index', previousZIndex.current)
  }, [])

  useEffect(() => {
    if (isTheatreOn === true) {
      toggleBlockBodyScroll(true)
      toggleScrollgngnZIndex(true)
    }
    return () => {
      toggleBlockBodyScroll(false)
      toggleScrollgngnZIndex(false)
    }
  }, [isTheatreOn])

  const c = clss(publicClassName, {
    cssModule,
    cssModuleRoot: 'theatre'
  })
  const rootClss = mergeClassNames(c(null, {
    'on': isTheatreOn === true,
    'off': isTheatreOn === undefined || !isTheatreOn
  }), className)

  return (
    <div className={rootClss}>
      <div onClick={onOpenTheatre}>{ openBtnContent ?? 'Open Theatre' }</div>
      <div onClick={onCloseTheatre}>{ closeBtnContent ?? 'Close Theatre' }</div>
      { children }
      { content }
    </div>
  )
}
