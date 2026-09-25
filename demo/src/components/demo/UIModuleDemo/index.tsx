import { type FunctionComponent } from 'react'
import {
  UIModule,
  type Props as UIModuleProps
} from '~/components/UIModule/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'UIModule'
const description = `Dynamic UI module host component. Asynchronously imports an ES module by URL,
validates its exported interface, calls its \`init\` lifecycle to obtain a DOM
\`Element\`, and appends that element to its own root \`<div>\`. Handles loading,
error, and teardown states automatically.

The imported module is expected to conform to the {@link ModuleData} interface.
Any violation (missing exports, wrong types, \`init\` not returning an \`Element\`)
transitions the component into the \`--error\` state and logs to \`console.error\`.

### Root element modifiers
The root \`<div>\` receives the public class name defined by \`uiModule\` and
the following BEM-style modifier classes reflecting the current load lifecycle:
- \`--loading\` — the module fetch is in progress.
- \`--no-module\` — no module has been loaded yet (\`src\` is undefined or the
effect has not run).
- \`--error\` — the import, validation, or \`init\` call failed.
- \`--loaded\` — the module passed validation and \`init\` returned successfully.
- \`--initialized\` — the \`Element\` returned by \`init\` has been appended to the
host \`<div>\`.

### Root element attributes
- \`id\` — a stable randomly generated ID (prefixed \`f\`) assigned once on mount.
Used to scope the module's \`css\` entries to this specific instance.

@param props - Component properties.
@see {@link Props}
@see {@link ModuleData}
@returns A host \`<div>\` into which the module's root \`Element\` is appended,
along with any \`<style>\` blocks exported by the module.`

const tsxDetails = `/**
 * Describes the contract a dynamically imported UI module must satisfy. Only \`init\`
 * is required; every member present is validated at runtime after the import resolves.
 *
 * @property init - Called once after the module loads. Receives the current \`props\`
 * and must return the root \`Element\` that will be appended to the host \`<div>\`.
 * **The element is not in the document yet**, so measuring it or reaching its
 * ancestors belongs in \`postInit\`, not here. Throwing is caught and surfaced as an
 * error state.
 * @property postInit - Optional. Called once, right after the element returned by
 * \`init\` has been appended. First point at which the module holds an attached
 * element: layout can be measured and ancestors reached. **May return a teardown
 * function**, run at unmount before \`destroy\` — which lets whatever it set up stay in
 * its own closure instead of being filed somewhere \`destroy\` can find it again.
 * @property update - Optional. Called when the \`props\` object changes identity,
 * once the module is live. Compared by reference, not by value — a consumer passing
 * an inline object gets one call per render, one passing a stable reference gets one
 * per real change.
 * @property destroy - Optional. Called when the component unmounts or \`src\` changes.
 * Receives the \`Element\` previously returned by \`init\`. Use it to tear down event
 * listeners, timers, or third-party instances.
 * @property css - Optional array of raw CSS strings scoped automatically to
 * the host element via \`.<publicClassName>#<id> { … }\` and injected as
 * \`<style>\` elements.
 */
type ModuleData = {
  init: (props: Record<string, unknown>) => Element
  postInit?: (target: Element, props: Record<string, unknown>) => void | (() => void)
  update?: (target: Element, props: Record<string, unknown>) => void
  destroy?: (target: Element) => void
  css?: string[]
}

/**
 * Props for the {@link UIModule} component.
 *
 * @property src - URL of the ES module to import dynamically. The module must
 * satisfy the {@link ModuleData} interface — only \`init\` is required. When
 * \`undefined\`, nothing is loaded and the component stays in the \`--no-module\` state.
 * @property props - Arbitrary key-value object forwarded verbatim to \`init\`, then to
 * \`postInit\`, then to \`update\` whenever the object's identity changes.
 * @property onIdGenerated - Called once on mount with the instance's generated
 * \`id\`. The id never changes afterwards, so this fires exactly once.
 * @property onIsLoadingChanged - Called after the loading state changed, with
 * the new value.
 * @property onLoadedModuleChanged - Called after the loaded module changed, with
 * the new value: the validated {@link ModuleData}, an \`Error\`, or \`null\`.
 * @property onModuleTargetChanged - Called after the hosted element changed,
 * with the \`Element\` returned by \`init\`, or \`null\` once unloaded or errored.
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  src?: string
  props?: Record<string, unknown>
  onIdGenerated?: (id: string) => void
  onIsLoadingChanged?: (isLoading: boolean) => void
  onLoadedModuleChanged?: (loadedModule: ModuleData | Error | null) => void
  onModuleTargetChanged?: (moduleTarget: Element | null) => void
}>`

const demoStyles = ``

const demoProps: UIModuleProps = {
  src: 'http://localhost:8080/NewModule.module.js',
  props: {
    title: 'New module',
    count: 7,
    isActive: true
  },
  /* eslint-disable no-console */
  onIdGenerated: id => console.log('id:', id),
  onLoadedModuleChanged: loadedModule => console.log('loaded:', loadedModule),
  onIsLoadingChanged: isLoading => console.log('loading:', isLoading),
  onModuleTargetChanged: moduleTarget => console.log('target:', moduleTarget)
  /* eslint-enable no-console */
}

export const UIModuleDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    <UIModule {...demoProps} />
  </CompDisplayer>
}
