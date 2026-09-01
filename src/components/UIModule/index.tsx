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
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
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

/** A module that initialized successfully, paired with the element it produced. */
type LiveInstance = {
  module: ModuleData
  target: Element
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
 * @property onIdGenerated - Called once on mount with the instance's generated
 * `id`. The id never changes afterwards, so this fires exactly once.
 * @property onIsLoadingChanged - Called after the loading state changed, with
 * the new value.
 * @property onLoadedModuleChanged - Called after the loaded module changed, with
 * the new value: the validated {@link ModuleData}, an `Error`, or `null`.
 * @property onModuleTargetChanged - Called after the hosted element changed,
 * with the `Element` returned by `init`, or `null` once unloaded or errored.
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  src?: string
  props?: Record<string, unknown>
  onIdGenerated?: (id: string) => void
  onIsLoadingChanged?: (isLoading: boolean) => void
  onLoadedModuleChanged?: (loadedModule: ModuleData | Error | null) => void
  onModuleTargetChanged?: (moduleTarget: Element | null) => void
}>

/**
 * Dynamic UI module host. Asynchronously imports an ES module by URL, validates
 * its exported interface, calls its `init` lifecycle to obtain a DOM `Element`,
 * and appends that element to its own root `<div>`.
 *
 * The imported module is expected to conform to the {@link ModuleData} interface.
 * Any violation (missing exports, wrong types, `init` not returning an `Element`)
 * transitions the component into the `--error` state and logs to `console.error`.
 *
 * ### CSS modifiers
 * Reflecting the current load lifecycle:
 * - `loading` — the module fetch is in progress.
 * - `no-module` — nothing has been loaded yet (`src` is undefined, or the
 *   effect has not run).
 * - `error` — the import, the validation, or the `init` call failed.
 * - `loaded` — the module passed validation and `init` returned successfully.
 * - `initialized` — the `Element` returned by `init` has been appended.
 *
 * ### Root element attributes
 * - `id` — a stable generated id, assigned once on mount and used to scope the
 * module's `css` entries to this specific instance.
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
  onIdGenerated,
  onIsLoadingChanged,
  onLoadedModuleChanged,
  onModuleTargetChanged,
  className
}) => {
  // State & refs
  const [id] = useState(() => `f${randomHash(10)}`)
  const [isLoading, setIsLoading] = useState(false)
  const [loadedModule, setLoadedModule] = useState<ModuleData | Error | null>(null)
  const [moduleTarget, setModuleTarget] = useState<Element | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  // What the teardown needs, held outside state so the load effect can depend on
  // `src` alone and still destroy whatever is actually live at cleanup time.
  const liveInstanceRef = useRef<LiveInstance | null>(null)

  // State dispatch
  useChangeDispatch(isLoading, onIsLoadingChanged)
  useChangeDispatch(loadedModule, onLoadedModuleChanged)
  useChangeDispatch(moduleTarget, onModuleTargetChanged)

  // Fx. no dep. - report the generated id, which never changes afterwards
  useEffect(() => { onIdGenerated?.(id) }, [])

  // Fx. dep. `src` - import, validate and initialize the module
  useEffect(() => {
    if (src === undefined) return
    setIsLoading(true)
    void import(src)
      .then(data => {
        setIsLoading(false)
        if (!isNonNullObject(data)) return setLoadedModule(new Error('Not a module'))
        if (!('init' in data) || typeof data.init !== 'function') return setLoadedModule(new Error('Module exported member `init` must be a function'))
        if (!('destroy' in data) || typeof data.destroy !== 'function') return setLoadedModule(new Error('Module exported member `destroy` must be a function'))
        if ('css' in data) {
          if (!Array.isArray(data.css)) return setLoadedModule(new Error('Module exported member `css` must be an array of strings'))
          if (data.css.some(entry => typeof entry !== 'string')) return setLoadedModule(new Error('Module exported member `css` must be an array of strings'))
        }
        if ('update' in data && typeof data.update !== 'function') return setLoadedModule(new Error('Module exported member `update` must be a function'))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- shape fully validated by the checks above
        const module = data as ModuleData
        setLoadedModule(module)
        try {
          const target = module.init(props ?? {})
          if (!(target instanceof Element)) return setLoadedModule(new Error('Module exported function `init` must return an Element'))
          liveInstanceRef.current = { module, target }
          setModuleTarget(target)
        } catch (err) {
          liveInstanceRef.current = null
          setModuleTarget(null)
          setLoadedModule(err instanceof Error ? err : new Error(unknownToString(err)))
        }
      })
      .catch((err: unknown) => {
        setIsLoading(false)
        liveInstanceRef.current = null
        setLoadedModule(err instanceof Error ? err : new Error(unknownToString(err)))
        setModuleTarget(null)
      })
    return () => {
      const liveInstance = liveInstanceRef.current
      if (liveInstance === null) return
      liveInstance.module.destroy(liveInstance.target)
      liveInstanceRef.current = null
    }
  }, [src])

  // Fx. dep. `loadedModule` - surface load errors
  useEffect(() => {
    // eslint-disable-next-line no-console
    if (loadedModule instanceof Error) console.error(loadedModule)
  }, [loadedModule])

  // Fx. dep. `moduleTarget` - append the element the module built
  useEffect(() => {
    if (moduleTarget === null) return
    if (rootRef.current === null) return
    rootRef.current.appendChild(moduleTarget)
  }, [moduleTarget])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const hasErrored = loadedModule instanceof Error
  const rootClss = mergeClassNames(
    c(null, {
      'loading': isLoading,
      'no-module': loadedModule === null,
      'error': hasErrored,
      'loaded': !isLoading && loadedModule !== null && !hasErrored,
      'initialized': moduleTarget !== null
    }),
    className
  )
  const moduleCss = hasErrored || loadedModule === null ? [] : loadedModule.css ?? []
  return <div
    className={rootClss}
    ref={rootRef}
    id={id}>
    {moduleCss.map((css, cssPos) => <style key={cssPos}>
      {`.${publicClassName}#${id} { ${css} }`}
    </style>)}
  </div>
}
