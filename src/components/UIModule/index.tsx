import {
  type FunctionComponent,
  useEffect,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { unknownToString } from '../../agnostic/errors/unknown-to-string/index.js'
import { isNonNullObject } from '../../agnostic/objects/is-object/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { uiModule as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Describes the contract a dynamically imported UI module must satisfy.
 * Every member is validated at runtime after the import resolves.
 *
 * @property init - Called once after the module loads. Receives the current
 * `props` and must return the root `Element` that will be appended to the
 * host `<div>`. Throwing inside `init` is caught and surfaced as an error state.
 * @property destroy - Called when the component unmounts or `src` changes.
 * Receives the `Element` previously returned by `init`. Use it to tear down
 * event listeners, timers, or third-party instances.
 * @property update - Optional. Called when `props` change after the module is
 * already initialized. Receives the live `Element` and the new props object.
 * @property css - Optional array of raw CSS strings scoped automatically to
 * the host element via `.<publicClassName>#<id> { … }` and injected as
 * `<style>` elements.
 */
type ModuleData = {
  init: (props: Record<string, unknown>) => Element
  destroy: (target: Element) => void
  update?: (target: Element, props: Record<string, unknown>) => void
  css?: string[]
}

/**
 * Props for the {@link UIModule} component.
 *
 * @property src - URL of the ES module to import dynamically. The module must
 * satisfy the {@link ModuleData} interface — `init` and `destroy` are required,
 * `update` and `css` are optional. When `undefined`, nothing is loaded and the
 * component stays in the `--no-module` state.
 * @property props - Arbitrary key-value object forwarded verbatim to the
 * module's `init` call and, on subsequent changes, to `update` (if exported).
 * @property stateHandlers - Optional callbacks invoked whenever internal state changes:
 * - `idChanged` — called with the stable instance ID once on mount.
 * - `isLoadingChanged` — called with the new loading state on every transition.
 * - `loadedModuleChanged` — called with the new module value (`ModuleData`, `Error`, or `null`)
 * after each load attempt or teardown.
 * - `moduleTargetChanged` — called with the `Element` returned by `init`, or `null`
 * when the module is unloaded or errored.
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  src?: string
  props?: Record<string, unknown>
  stateHandlers?: {
    idChanged?: (id: string) => void
    isLoadingChanged?: (isLoading: boolean) => void
    loadedModuleChanged?: (loadedModule: ModuleData | Error | null) => void
    moduleTargetChanged?: (moduleTarget: Element | null) => void
  }
}>

/**
 * Dynamic UI module host component. Asynchronously imports an ES module by URL,
 * validates its exported interface, calls its `init` lifecycle to obtain a DOM
 * `Element`, and appends that element to its own root `<div>`. Handles loading,
 * error, and teardown states automatically.
 *
 * The imported module is expected to conform to the {@link ModuleData} interface.
 * Any violation (missing exports, wrong types, `init` not returning an `Element`)
 * transitions the component into the `--error` state and logs to `console.error`.
 *
 * ### Root element modifiers
 * The root `<div>` receives the public class name defined by `uiModule` and
 * the following BEM-style modifier classes reflecting the current load lifecycle:
 * - `--loading` — the module fetch is in progress.
 * - `--no-module` — no module has been loaded yet (`src` is undefined or the
 * effect has not run).
 * - `--error` — the import, validation, or `init` call failed.
 * - `--loaded` — the module passed validation and `init` returned successfully.
 * - `--initialized` — the `Element` returned by `init` has been appended to the
 * host `<div>`.
 *
 * ### Root element attributes
 * - `id` — a stable randomly generated ID (prefixed `f`) assigned once on mount.
 * Used to scope the module's `css` entries to this specific instance.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @see {@link ModuleData}
 * @returns A host `<div>` into which the module's root `Element` is appended,
 * along with any `<style>` blocks exported by the module.
 */
export const UIModule: FunctionComponent<Props> = ({
  src,
  props,
  stateHandlers,
  className
}) => {
  // State & refs
  const [id] = useState(`f${randomHash(10)}`)
  const [loading, setLoading] = useState(false)
  const [loadedModule, _setLoadedModule] = useState<ModuleData | Error | null>(null)
  const [moduleTarget, _setModuleTarget] = useState<Element | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const loadedModuleRef = useRef<ModuleData | Error | null>(null)
  const moduleTargetRef = useRef<Element | null>(null)
  const setLoadedModule = (data: ModuleData | Error | null): void => {
    loadedModuleRef.current = data
    _setLoadedModule(data)
  }
  const setModuleTarget = (data: Element | null): void => {
    moduleTargetRef.current = data
    _setModuleTarget(data)
  }

  // State changes dispatch
  useEffect(() => { stateHandlers?.idChanged?.(id) }, [id, stateHandlers])
  useEffect(() => { stateHandlers?.isLoadingChanged?.(loading) }, [loading, stateHandlers])
  useEffect(() => { stateHandlers?.loadedModuleChanged?.(loadedModule) }, [loadedModule, stateHandlers])
  useEffect(() => { stateHandlers?.moduleTargetChanged?.(moduleTarget) }, [moduleTarget, stateHandlers])

  // Fx dep. `src` - load & init module effect
  useEffect(() => {
    if (src === undefined) return
    try {
      setLoading(true)
      import(src)
        .then(data => {
          setLoading(false)
          const errs = {
            notMod: new Error('Not a module'),
            initFunc: new Error('Module exported member `init` must be a function'),
            destroyFunc: new Error('Module exported member `destroy` must be a function'),
            cssStrArr: new Error('Module exported member `css` must be an array of strings'),
            updFunc: new Error('Module exported member `update` must be a function'),
            initRetElt: new Error('Module exported function `init` must return an Element'),
            initRetFirstElt: new Error('Module exported function `init` must return an array containing an Element in its first position')
          }
          if (!isNonNullObject(data)) return setLoadedModule(errs.notMod)
          if (!('init' in data)) return setLoadedModule(errs.initFunc)
          if (typeof data.init !== 'function') return setLoadedModule(errs.initFunc)
          if (!('destroy' in data) || typeof data.destroy !== 'function') return setLoadedModule(errs.destroyFunc)
          if ('css' in data) {
            if (!Array.isArray(data.css)) return setLoadedModule(errs.cssStrArr)
            if (data.css.some(i => typeof i !== 'string')) return setLoadedModule(errs.cssStrArr)
          }
          if ('update' in data && typeof data.update !== 'function') return setLoadedModule(errs.updFunc)
          const module = data as ModuleData
          setLoadedModule(module)
          try {
            const target = module.init(props ?? {})
            if (!(target instanceof Element)) return setLoadedModule(errs.initRetElt)
            setModuleTarget(target)
          } catch (err) {
            setModuleTarget(null)
            const e = err instanceof Error
              ? err
              : new Error(unknownToString(err))
            setLoadedModule(e)
          }
        }).catch(err => {
          setLoading(false)
          setLoadedModule(err instanceof Error ? err : new Error(unknownToString(err)))
          setModuleTarget(null)
        })
    } catch (err) {
      if (err instanceof Error) return setLoadedModule(err)
      const errStr = unknownToString(err)
      return setLoadedModule(new Error(errStr))
    }
    return () => {
      if (moduleTargetRef.current === null) return
      if (loadedModuleRef.current instanceof Error) return
      if (loadedModuleRef.current === null) return
      loadedModuleRef.current.destroy(moduleTargetRef.current)
    }
  }, [src])

  // Fx dep. `loadedModule` - log load errors
  useEffect(() => {
    if (loadedModule instanceof Error) console.error(loadedModule)
  }, [loadedModule])

  // Fx dep. `moduleTarget` - append the rendered module
  useEffect(() => {
    if (moduleTarget === null) return
    if (rootRef.current === null) return
    rootRef.current.appendChild(moduleTarget)
  }, [moduleTarget])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      loading,
      'no-module': loadedModule === null,
      'error': loadedModule instanceof Error,
      'loaded': !loading && loadedModule !== null && !(loadedModule instanceof Error),
      'initialized': moduleTarget !== null
    }),
    className
  )
  return <div
    className={rootClss}
    ref={rootRef}
    id={id}>
    {loadedModule === null && ''}
    {loadedModule !== null
      && !(loadedModule instanceof Error)
      && loadedModule.css?.map(css => <style>
        {`.${publicClassName}#${id} { ${css} }`}
      </style>)}
  </div>
}
