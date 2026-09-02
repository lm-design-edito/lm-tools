import {
  type FunctionComponent,
  useState,
  type EventHandler,
  type ChangeEvent
} from 'react'
import {
  ZodError,
  type ZodType,
  type core
} from 'zod'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import { isNonNullObject } from '../../agnostic/objects/is-object/index.js'
import { Input } from '../Input/index.js'
import { Select } from '../Select/index.js'
import { Textarea } from '../Textarea/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import type { JsonValue } from './types.js'
import {
  c,
  getValueType
} from './utils.js'

/**
 * Props for the {@link JsonEditor} component.
 *
 * @property defaultValue - Initial JSON value rendered by the editor. Defaults to `null`.
 * @property onChange - Called after any value change with the updated JSON value.
 * @property onValidationError - Called when the updated value fails schema validation,
 * with the list of Zod issues. Not called when no `schema` is provided.
 * @property schema - Optional Zod schema used to validate the value after each change.
 * When provided, validation runs after `onChange` is dispatched.
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  defaultValue?: JsonValue
  onChange?: (val: JsonValue) => void
  onValidationError?: (issues: core.$ZodIssue[]) => void
  schema?: ZodType<JsonValue>
}>

/**
 * Interactive JSON editor component.
 *
 * Renders a recursive value editor tree alongside a live JSON preview.
 * Supports all JSON value types: strings, numbers, booleans, null, arrays,
 * and records. Each node exposes a type selector and a type-appropriate input.
 *
 * When a `schema` is provided, the current value is validated against it after
 * every change. Validation errors are reported through `onValidationError` and
 * do not block editing.
 *
 * ### CSS elements
 * - `value` — wraps each node in the editor tree; receives a type modifier
 *   matching the current value type (`string`, `number`, `boolean`, `null`, `array`, `record`).
 * - `type` — the type selector control.
 * - `string`, `number`, `boolean`, `null` — primitive value inputs.
 * - `record` — record entry list.
 * - `array` — array entry list items.
 * - `prop-name` — key input for record entries.
 * - `create-prop` — button to append a new entry to a record or array.
 * - `delete-prop` — button to remove an existing entry.
 * - `lift-prop` — button to move an array entry up.
 * - `drop-prop` — button to move an array entry down.
 * - `preview` — the serialized JSON preview.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A recursive JSON value editor with a live serialized preview.
 *
 * @remarks
 * **The editor is uncontrolled, at every level of the tree, and there is no
 * controlled variant.** Each node seeds its state from its `defaultValue` on
 * mount and never reads it again, so handing a mounted editor a new
 * `defaultValue` changes nothing on screen — remount it with a different `key`
 * to load another document. A controlled mode would mean rebuilding the state
 * model so the whole tree reads from a single owner, which is why none of these
 * components accepts a `value` prop.
 */
export const JsonEditor: FunctionComponent<Props> = ({
  defaultValue = null,
  onChange,
  onValidationError,
  schema,
  className
}) => {
  const [value, setValue] = useState(defaultValue)
  const setValueAndDispatch = (val: JsonValue): void => {
    setValue(val)
    onChange?.(val)
    try {
      schema?.parse(val)
    } catch (err) {
      if (err instanceof ZodError) {
        const { issues } = err
        onValidationError?.(issues)
      }
      else throw err
    }
  }
  const rootClss = mergeClassNames(c(), className)
  return <div className={rootClss}>
    <ValueEditor
      defaultValue={defaultValue}
      onChange={val => setValueAndDispatch(val)}
      path={[]} />
    <pre className={c('preview')}>{JSON.stringify(value, null, 2)}</pre>
  </div>
}

/* * * * * * * * * * * * * * * * *
 *
 * Value
 *
 * * * * * * * * * * * * * * * * */

/**
 * Props for the {@link ValueEditor} component.
 *
 * @property defaultValue - Initial value of this node. Read on mount only.
 * @property onChange - Called after the node's value changed, with the new value.
 * @property path - Keys and indices leading to this node from the document root,
 * exposed on the node as `data-path` and passed down to its children.
 * @property className - Additional class name(s) applied to the root element.
 */
export type ValueEditorProps = WithClassName<{
  defaultValue?: JsonValue
  onChange?: (newValue: JsonValue) => void
  path?: Array<string | number>
}>

/**
 * One node of the editor tree: a type selector, plus the editor matching the
 * value's current type. Switching type replaces the value with an empty one of
 * the new type.
 *
 * @param props - Component properties.
 * @see {@link ValueEditorProps}
 * @returns A span holding the type selector and the type-appropriate editor.
 */
export const ValueEditor: FunctionComponent<ValueEditorProps> = ({
  defaultValue = {},
  onChange,
  path = [],
  className
}) => {
  // State
  const [value, setValue] = useState(defaultValue)
  const setValueAndDispatch = (newValue: JsonValue): void => {
    setValue(newValue)
    onChange?.(newValue)
  }

  // Handlers
  const handleTypeSelectChange: EventHandler<ChangeEvent<HTMLSelectElement>> = e => {
    const newType = e.target.value
    if (newType === 'string') return setValueAndDispatch('')
    if (newType === 'number') return setValueAndDispatch(0)
    if (newType === 'boolean') return setValueAndDispatch(false)
    if (newType === 'null') return setValueAndDispatch(null)
    if (newType === 'record') return setValueAndDispatch({ a: 0, b: false })
    if (newType === 'array') return setValueAndDispatch([])
  }

  const handleStringValueChange: EventHandler<ChangeEvent<HTMLTextAreaElement | HTMLInputElement>> = e => setValueAndDispatch(e.target.value)
  const handleNumberValueChange: EventHandler<ChangeEvent<HTMLInputElement>> = e => setValueAndDispatch(parseFloat(e.target.value))
  const handleBooleanValueChange: EventHandler<ChangeEvent<HTMLInputElement>> = e => setValueAndDispatch(e.target.checked)
  const handleRecordValueChange: (val: Record<string, JsonValue>) => void = e => setValueAndDispatch(e)
  const handleArrayValueChange: (val: JsonValue[]) => void = e => setValueAndDispatch(e)

  // Rendering
  const valueType = getValueType(value)
  const valueEditorClss = mergeClassNames(c('value', valueType), className)
  const pathStringDataAttr = path.map(e => e.toString()).join('.')
  return <span
    className={valueEditorClss}
    data-path={pathStringDataAttr}>
    <Select
      className={c('type')}
      value={valueType}
      onChange={handleTypeSelectChange}>
      <option value='string'>string</option>
      <option value='number'>number</option>
      <option value='boolean'>boolean</option>
      <option value='null'>null</option>
      <option value='record'>record</option>
      <option value='array'>array</option>
    </Select>
    {typeof value === 'string' && <StringEditor
      type='textarea'
      defaultValue={value}
      onChange={handleStringValueChange} />}
    {typeof value === 'number' && <NumberEditor
      defaultValue={value}
      onChange={handleNumberValueChange} />}
    {typeof value === 'boolean' && <BooleanEditor
      defaultValue={value}
      onChange={handleBooleanValueChange} />}
    {value === null && <NullEditor />}
    {isNonNullObject(value) && !Array.isArray(value) && <RecordEditor
      defaultValue={value}
      onChange={handleRecordValueChange}
      path={path} />}
    {Array.isArray(value) && <ArrayEditor
      defaultValue={value}
      onChange={handleArrayValueChange}
      path={path} />}
  </span>
}

/* * * * * * * * * * * * * * * * *
 *
 * String
 *
 * * * * * * * * * * * * * * * * */

/**
 * Props for the {@link StringEditor} component.
 *
 * @property type - Which control to render. Defaults to a single-line `input`.
 * @property defaultValue - Initial text. Read on mount only.
 * @property onChange - Native change handler, forwarded to the control.
 * @property className - Additional class name(s) applied to the control.
 */
export type StringEditorProps = WithClassName<{
  type?: 'input' | 'textarea'
  defaultValue?: string
  onChange?: EventHandler<ChangeEvent<HTMLTextAreaElement | HTMLInputElement>>
}>

/**
 * The editor for a string value.
 *
 * @param props - Component properties.
 * @see {@link StringEditorProps}
 * @returns A textarea or a text input, depending on `type`.
 */
export const StringEditor: FunctionComponent<StringEditorProps> = ({
  type,
  defaultValue,
  onChange,
  className
}) => type === 'textarea'
  ? <Textarea
    className={mergeClassNames(c('string'), className)}
    defaultValue={defaultValue ?? ''}
    onChange={onChange} />
  : <Input
    type='text'
    className={mergeClassNames(c('string'), className)}
    defaultValue={defaultValue ?? ''}
    onChange={onChange} />

/* * * * * * * * * * * * * * * * *
 *
 * Number
 *
 * * * * * * * * * * * * * * * * */

/**
 * Props for the {@link NumberEditor} component.
 *
 * @property defaultValue - Initial number. Read on mount only.
 * @property onChange - Native change handler, forwarded to the input.
 * @property className - Additional class name(s) applied to the input.
 */
export type NumberEditorProps = WithClassName<{
  defaultValue?: number
  onChange?: EventHandler<ChangeEvent<HTMLInputElement>>
}>

/**
 * The editor for a number value.
 *
 * @param props - Component properties.
 * @see {@link NumberEditorProps}
 * @returns A number input.
 */
export const NumberEditor: FunctionComponent<NumberEditorProps> = ({
  defaultValue,
  onChange,
  className
}) => <Input
  className={mergeClassNames(c('number'), className)}
  type='number'
  defaultValue={defaultValue ?? 0}
  onChange={onChange} />

/* * * * * * * * * * * * * * * * *
 *
 * Boolean
 *
 * * * * * * * * * * * * * * * * */

/**
 * Props for the {@link BooleanEditor} component.
 *
 * @property defaultValue - Initial checked state. Read on mount only.
 * @property onChange - Native change handler, forwarded to the input.
 * @property className - Additional class name(s) applied to the input.
 */
export type BooleanEditorProps = WithClassName<{
  defaultValue?: boolean
  onChange?: EventHandler<ChangeEvent<HTMLInputElement>>
}>

/**
 * The editor for a boolean value.
 *
 * @param props - Component properties.
 * @see {@link BooleanEditorProps}
 * @returns A checkbox.
 */
export const BooleanEditor: FunctionComponent<BooleanEditorProps> = ({
  defaultValue,
  onChange,
  className
}) => <Input
  className={mergeClassNames(c('boolean'), className)}
  type='checkbox'
  defaultChecked={defaultValue ?? false}
  onChange={onChange} />

/* * * * * * * * * * * * * * * * *
 *
 * Null
 *
 * * * * * * * * * * * * * * * * */

/**
 * Props for the {@link NullEditor} component.
 *
 * @property className - Additional class name(s) applied to the root element.
 */
export type NullEditorProps = WithClassName<Record<string, never>>

/**
 * The editor for a null value — there is nothing to edit, so it only states the
 * type.
 *
 * @param props - Component properties.
 * @see {@link NullEditorProps}
 * @returns A span reading `null`.
 */
export const NullEditor: FunctionComponent<NullEditorProps> = ({
  className
}) => <span className={mergeClassNames(c('null'), className)}>null</span>

/* * * * * * * * * * * * * * * * *
 *
 * Record
 *
 * * * * * * * * * * * * * * * * */

/**
 * Props for the {@link RecordEditor} component.
 *
 * @property defaultValue - Initial entries. Read on mount only.
 * @property onChange - Called after any entry is added, removed, renamed or
 * edited, with the rebuilt record.
 * @property path - Keys and indices leading to this record from the document
 * root, extended with each entry's key before being passed down.
 * @property className - Additional class name(s) applied to the root element.
 */
export type RecordEditorProps = WithClassName<{
  defaultValue?: Record<string, JsonValue>
  onChange?: (newValue: Record<string, JsonValue>) => void
  path?: Array<string | number>
}>

/**
 * The editor for a record: one renamable, removable entry per key, each holding
 * a nested {@link ValueEditor}.
 *
 * @param props - Component properties.
 * @see {@link RecordEditorProps}
 * @returns A list of entries, followed by the button that appends one.
 *
 * @remarks
 * Entries are held in a `Map` keyed by property name, each carrying a stable id
 * used as the React key — so renaming a property doesn't remount its editor and
 * lose the subtree's state.
 */
export const RecordEditor: FunctionComponent<RecordEditorProps> = ({
  defaultValue = {},
  onChange,
  path,
  className
}) => {
  const [value, setValue] = useState(new Map(Object
    .entries(defaultValue)
    .map(([key, val]) => [key, {
      id: randomHash(8),
      val
    }])
  ))
  const setValueAndDispatch = (newValue: typeof value): void => {
    setValue(newValue)
    onChange?.(Array.from(newValue).reduce((acc, [key, { val }]) => ({
      ...acc,
      [key]: val
    }), {}))
  }

  const handleDeleteProp = (key: string): void => {
    const newValue = new Map(value)
    newValue.delete(key)
    setValueAndDispatch(newValue)
  }

  const handleCreateProp = (): void => {
    let propName = randomHash(4)
    while (value.get(propName) !== undefined) { propName = randomHash(4) }
    const newValue = new Map(value)
    newValue.set(propName, { id: randomHash(8), val: null })
    setValueAndDispatch(newValue)
  }

  const handleRenameProp = (oldName: string): EventHandler<ChangeEvent<HTMLTextAreaElement | HTMLInputElement>> => e => {
    const newName = e.target.value
    const newValue = new Map(Array
      .from(value)
      .map(([key, { id, val }]) => [
        key === oldName ? newName : key,
        { id, val }
      ]
      )
    )
    setValueAndDispatch(newValue)
  }

  const handleChangeProp = (changedKey: string) => (newValue: JsonValue) => {
    const newVal = new Map(Array.from(value).map(([key, { id, val }]) => [key, {
      id,
      val: key === changedKey ? newValue : val
    }]))
    setValueAndDispatch(newVal)
  }

  return <ul className={mergeClassNames(c('record'), className)}>
    {Array.from(value).map(([key, { id, val }]) => <li
      key={id}
      data-key={key}
      data-path={[...(path ?? []), key].join('.')}>
      <button
        className={c('delete-prop')}
        onClick={() => handleDeleteProp(key)}>
        x
      </button>
      <span className={c('prop-name')}>
        <StringEditor
          type='input'
          defaultValue={key}
          onChange={handleRenameProp(key)} />
      </span>
      <ValueEditor
        defaultValue={val}
        onChange={handleChangeProp(key)}
        path={[...(path ?? []), key]} />
    </li>)}
    <button
      className={c('create-prop')}
      onClick={handleCreateProp}>
      +
    </button>
  </ul>
}

/* * * * * * * * * * * * * * * * *
 *
 * Array
 *
 * * * * * * * * * * * * * * * * */

/**
 * Props for the {@link ArrayEditor} component.
 *
 * @property defaultValue - Initial items. Read on mount only.
 * @property onChange - Called after any item is added, removed, moved or edited,
 * with the rebuilt array.
 * @property path - Keys and indices leading to this array from the document
 * root, extended with each item's index before being passed down.
 * @property className - Additional class name(s) applied to the root element.
 */
export type ArrayEditorProps = WithClassName<{
  defaultValue?: JsonValue[]
  onChange?: (newValue: JsonValue[]) => void
  path?: Array<string | number>
}>

/**
 * The editor for an array: one removable, movable item per index, each holding a
 * nested {@link ValueEditor}.
 *
 * @param props - Component properties.
 * @see {@link ArrayEditorProps}
 * @returns An ordered list of items, followed by the button that appends one.
 *
 * @remarks
 * Items are held in a `Map` keyed by a stable id used as the React key, so
 * reordering moves the editors rather than remounting them.
 */
export const ArrayEditor: FunctionComponent<ArrayEditorProps> = ({
  defaultValue = [],
  onChange,
  path,
  className
}) => {
  const [value, setValue] = useState(new Map(defaultValue.map(val => [randomHash(8), val])))
  const setValueAndDispatch = (newValue: typeof value): void => {
    setValue(newValue)
    onChange?.(Array.from(newValue).map(([, val]) => val))
  }

  const handleDeleteProp = (pos: number): void => setValueAndDispatch(new Map([
    ...Array.from(value).slice(0, pos),
    ...Array.from(value).slice(pos + 1)
  ]))

  const handleCreateProp = (): void => {
    const newValue = new Map([...Array.from(value), [randomHash(8), null]])
    setValueAndDispatch(newValue)
  }

  const handleChangeProp = (pos: number) => (newValue: JsonValue) => setValueAndDispatch(new Map([
    ...Array.from(value).slice(0, pos),
    [Array.from(value)[pos]?.[0] ?? randomHash(8), newValue],
    ...Array.from(value).slice(pos + 1)
  ]))

  // Swapping with the entry before, so position 0 has nothing to swap with. The
  // guard is what keeps `pos - 1` from reaching back into the array as `-1`.
  const handleLiftProp = (pos: number): void => {
    if (pos <= 0) return
    const entries = Array.from(value)
    setValueAndDispatch(new Map([
      ...entries.slice(0, pos - 1),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entries[pos]!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entries[pos - 1]!,
      ...entries.slice(pos + 1)
    ]))
  }

  // Same, mirrored: the last entry has nothing to swap with.
  const handleDropProp = (pos: number): void => {
    const entries = Array.from(value)
    if (pos < 0 || pos >= entries.length - 1) return
    setValueAndDispatch(new Map([
      ...entries.slice(0, pos),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entries[pos + 1]!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entries[pos]!,
      ...entries.slice(pos + 2)
    ]))
  }

  return <ol className={mergeClassNames(className)}>
    {Array.from(value).map(([id, val], pos) => <li
      className={c('array')}
      key={id}
      data-path={[...(path ?? []), pos].join('.')}>
      <button className={c('delete-prop')} onClick={() => handleDeleteProp(pos)}>x</button>
      <button className={c('lift-prop')} disabled={pos === 0} onClick={() => handleLiftProp(pos)}>↑</button>
      <button className={c('drop-prop')} disabled={pos === value.size - 1} onClick={() => handleDropProp(pos)}>↓</button>
      <ValueEditor
        defaultValue={val}
        onChange={handleChangeProp(pos)}
        path={[...(path ?? []), pos]} />
    </li>)}
    <button className={c('create-prop')} onClick={handleCreateProp}>+</button>
  </ol>
}
