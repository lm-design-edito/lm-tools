import { Bem as BemNamespace } from './bem'
import {
  niceColors as niceColorsConst,
  generateNiceColor as generateNiceColorFunc
} from './generate-nice-color'
import {
  classNameRegex as classNameRegexConst,
  isValidClassName as isValidClassNameFunc
} from './is-valid-css-class-name'
import {
  StylesSetItem as StylesSetItemType,
  StylesSet as StylesSetClass,
  StylesSetCompProps as StylesSetCompPropsFype,
  StylesSetComp as StylesSetCompFunc
} from './styles-set'

export namespace Css {
  // Bem
  export import Bem = BemNamespace
  // Nice color
  export const niceColors = niceColorsConst
  export const generateNiceColor = generateNiceColorFunc
  // Is valid css Classname
  export const classNameRegex = classNameRegexConst
  export const isValidClassName = isValidClassNameFunc
  // Styles set
  export type StylesSetItem = StylesSetItemType
  export const StylesSet = StylesSetClass
  export type StylesSetCompProps = StylesSetCompPropsFype
  export const StylesSetComp = StylesSetCompFunc
}
