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

const demoStyles = ``

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
