import { Arrays as ArraysNamespace } from './arrays/index.js'
import { Booleans as BooleansNamespace } from './booleans/index.js'
import { Css as CssNamespace } from './css/index.js'
import { Errors as ErrorsNamespace } from './errors/index.js'
import { Html as HtmlNamespace } from './html/index.js'
import * as MiscNamespace from './misc/index.js'
import { Numbers as NumbersNamespace } from './numbers/index.js'
import { Objects as ObjectsNamespace } from './objects/index.js'
import { Optim as OptimNamespace } from './optim/index.js'
import { Regexps as RegexpsNamespace } from './regexps/index.js'
import { Strings as StringsNamespace } from './strings/index.js'
import { Colors as ColorsNamespace } from './colors/index.js'

export namespace Agnostic {
  export import Arrays = ArraysNamespace
  export import Booleans = BooleansNamespace
  export import Css = CssNamespace
  export import Errors = ErrorsNamespace
  export import Html = HtmlNamespace
  export import Misc = MiscNamespace
  export import Numbers = NumbersNamespace
  export import Objects = ObjectsNamespace
  export import Optim = OptimNamespace
  export import Regexps = RegexpsNamespace
  export import Strings = StringsNamespace
  export import Colors = ColorsNamespace
}
