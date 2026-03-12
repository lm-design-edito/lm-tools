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
 * Describes the contract a dynamically imported UI module must satisfy.
 * Every member is validated at runtime after the import resolves.
 *
 * @property init - Called once after the module loads. Receives the current
 * \`props\` and must return the root \`Element\` that will be appended to the
 * host \`<div>\`. Throwing inside \`init\` is caught and surfaced as an error state.
 * @property destroy - Called when the component unmounts or \`src\` changes.
 * Receives the \`Element\` previously returned by \`init\`. Use it to tear down
 * event listeners, timers, or third-party instances.
 * @property update - Optional. Called when \`props\` change after the module is
 * already initialized. Receives the live \`Element\` and the new props object.
 * @property css - Optional array of raw CSS strings scoped automatically to
 * the host element via \`.<publicClassName>#<id> { … }\` and injected as
 * \`<style>\` elements.
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
 * satisfy the {@link ModuleData} interface — \`init\` and \`destroy\` are required,
 * \`update\` and \`css\` are optional. When \`undefined\`, nothing is loaded and the
 * component stays in the \`--no-module\` state.
 * @property props - Arbitrary key-value object forwarded verbatim to the
 * module's \`init\` call and, on subsequent changes, to \`update\` (if exported).
 * @property stateHandlers - Optional callbacks invoked whenever internal state changes:
 * - \`idChanged\` — called with the stable instance ID once on mount.
 * - \`isLoadingChanged\` — called with the new loading state on every transition.
 * - \`loadedModuleChanged\` — called with the new module value (\`ModuleData\`, \`Error\`, or \`null\`)
 * after each load attempt or teardown.
 * - \`moduleTargetChanged\` — called with the \`Element\` returned by \`init\`, or \`null\`
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
}>`

const demoStyles = ``

const demoProps: UIModuleProps = {
  src: 'http://localhost:8080/NewModule.module.js',
  props: {
    title: 'New module',
    count: 7,
    isActive: true
  },
  stateHandlers: {
    idChanged: id => console.log('id:', id),
    loadedModuleChanged: loadedModule => console.log('loaded:', loadedModule),
    isLoadingChanged: loading => console.log('loading:', loading),
    moduleTargetChanged: moduleTarget => console.log('target:', moduleTarget)
  }
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
