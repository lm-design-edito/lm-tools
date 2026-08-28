import { type FunctionComponent } from 'react'
import { z } from 'zod'
import {
  JsonEditor,
  type Props as JsonEditorProps
} from '~/components/JsonEditor/index.js'
import { jsonEditor as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'JsonEditor'

const description = `
Interactive JSON editor component.

Renders a recursive value editor tree alongside a live JSON preview.
Supports all JSON value types: strings, numbers, booleans, null, arrays,
and records. Each node exposes a type selector and a type-appropriate input.

When a \`schema\` is provided, the current value is validated against it after
every change. Validation errors are reported through \`onValidationError\` and
do not block editing.

### CSS elements
- \`value\` — wraps each node in the editor tree; receives a type modifier
  matching the current value type (\`string\`, \`number\`, \`boolean\`, \`null\`, \`array\`, \`record\`).
- \`type\` — the type selector control.
- \`string\`, \`number\`, \`boolean\`, \`null\` — primitive value inputs.
- \`record\` — record entry list.
- \`array\` — array entry list items.
- \`prop-name\` — key input for record entries.
- \`create-prop\` — button to append a new entry to a record or array.
- \`delete-prop\` — button to remove an existing entry.
- \`lift-prop\` — button to move an array entry up.
- \`drop-prop\` — button to move an array entry down.

@param props - Component properties.
@see {@link Props}
@returns A recursive JSON value editor with a live serialized preview.
`

/* TSX Details */

const tsxDetails = `
type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue }

/**
 * Props for the {@link JsonEditor} component.
 *
 * @property defaultValue - Initial JSON value rendered by the editor. Defaults to \`null\`.
 * @property onChange - Called after any value change with the updated JSON value.
 * @property onValidationError - Called when the updated value fails schema validation,
 * with the list of Zod issues. Not called when no \`schema\` is provided.
 * @property schema - Optional Zod schema used to validate the value after each change.
 * When provided, validation runs after \`onChange\` is dispatched.
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  defaultValue?: JsonValue
  onChange?: (val: JsonValue) => void
  onValidationError?: (issues: core.$ZodIssue[]) => void
  schema?: ZodType<JsonValue>
}>
`

/* Demo CSS */

const demoStyles = `
.${publicClassName} {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  font-family: monospace;
  font-size: 14px;
}

/* Editor tree */

.${publicClassName}__value {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
}

.${publicClassName}__type {
  font-family: inherit;
  font-size: 11px;
  padding: 1px 2px;
}

/* The --<type> modifiers let each node be styled after its current value type */
.${publicClassName}__value--string > .${publicClassName}__type { color: seagreen; }
.${publicClassName}__value--number > .${publicClassName}__type { color: royalblue; }
.${publicClassName}__value--boolean > .${publicClassName}__type { color: darkorchid; }
.${publicClassName}__value--null > .${publicClassName}__type { color: darkgray; }
.${publicClassName}__value--record > .${publicClassName}__type { color: darkgoldenrod; }
.${publicClassName}__value--array > .${publicClassName}__type { color: chocolate; }

/* Primitive inputs */

textarea.${publicClassName}__string,
input.${publicClassName}__string,
input.${publicClassName}__number {
  font-family: inherit;
  font-size: inherit;
  padding: 2px 4px;
  border: 1px solid lightgray;
}

textarea.${publicClassName}__string {
  min-width: 240px;
  height: 22px;
  resize: vertical;
}

input.${publicClassName}__number { width: 90px; }

.${publicClassName}__null {
  color: darkgray;
  font-style: italic;
}

/* Record and array entries */

.${publicClassName}__record,
.${publicClassName} ol {
  margin: 0;
  padding: 0 0 0 20px;
  border-left: 1px solid lightgray;
  list-style: none;
}

.${publicClassName}__record > li,
.${publicClassName}__array {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 3px 0;
}

.${publicClassName}__prop-name input {
  width: 120px;
  min-width: unset;
}

.${publicClassName}__create-prop,
.${publicClassName}__delete-prop,
.${publicClassName}__lift-prop,
.${publicClassName}__drop-prop {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid lightgray;
  background-color: whitesmoke;
  font-family: inherit;
  line-height: 1;
  cursor: pointer;
}

.${publicClassName}__create-prop:disabled,
.${publicClassName}__delete-prop:disabled,
.${publicClassName}__lift-prop:disabled,
.${publicClassName}__drop-prop:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Live preview */

.${publicClassName} > pre {
  width: 100%;
  margin: 0;
  padding: 12px;
  background-color: #24292e;
  border-radius: 4px;
  color: #e1e4e8;
  overflow-x: auto;
}
`

/* Demo props */

const schema: NonNullable<JsonEditorProps['schema']> = z.object({
  title: z.string().min(1),
  published: z.boolean(),
  views: z.number().int().nonnegative(),
  tags: z.array(z.string()),
  author: z.object({
    name: z.string(),
    email: z.string().nullable()
  })
})

const demoProps: JsonEditorProps = {
  defaultValue: {
    title: "Jour de l'opinion",
    published: false,
    views: 0,
    tags: ['politique', 'société'],
    author: {
      name: 'Ada Lovelace',
      email: null
    }
  },
  schema,
  onChange: val => console.log('changed:', val),
  onValidationError: issues => console.log('validation issues:', issues)
}

export const JsonEditorDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps as Record<string, unknown>}
    demoStyles={demoStyles}>
    <JsonEditor {...demoProps} />
  </CompDisplayer>
}
