import {
  type JSX,
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
import { clss } from '../../agnostic/css/clss/index.js'
import { isNonNullObject } from '../../agnostic/objects/is-object/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import { Input } from '../Input/index.js'
import { Select } from '../Select/index.js'
import { Textarea } from '../Textarea/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { jsonEditor as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue }

export type Props = WithClassName<{
  defaultValue?: JsonValue
  onChange?: (val: JsonValue) => void
  onValidationError?: (issues: core.$ZodIssue[]) => void
  schema?: ZodType<JsonValue>
}>

const c = clss(publicClassName, { cssModule })

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
  const rootClss = mergeClassNames(c(null, {}), className)
  return <div className={rootClss}>
    <ValueEditor
      defaultValue={defaultValue}
      onChange={val => setValueAndDispatch(val)}
      path={[]} />
    <pre>{JSON.stringify(value, null, 2)}</pre>
  </div>
}

export const ValueEditor: FunctionComponent<{
  defaultValue?: JsonValue
  onChange?: (newValue: JsonValue) => void
  path?: Array<string | number>
}> = ({
  defaultValue = {},
  onChange,
  path = []
}): JSX.Element => {
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
  const valueEditorClss = c('value', {
    string: typeof value === 'string',
    number: typeof value === 'number',
    boolean: typeof value === 'boolean',
    null: value === null,
    array: Array.isArray(value),
    record: !Array.isArray(value) && isNonNullObject(value)
  })
  const pathStringDataAttr = (path ?? []).map(e => e.toString()).join('.')
  return <span
    className={valueEditorClss}
    data-path={pathStringDataAttr}>
    <Select
      className={c('type')}
      onChange={handleTypeSelectChange}>
      <option value='string' selected={typeof value === 'string'}>string</option>
      <option value='number' selected={typeof value === 'number'}>number</option>
      <option value='boolean' selected={typeof value === 'boolean'}>boolean</option>
      <option value='null' selected={value === null}>null</option>
      <option value='record' selected={isNonNullObject(value) && !Array.isArray(value)}>record</option>
      <option value='array' selected={Array.isArray(value)}>array</option>
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
    {value === null && <NullEditor defaultValue={value} />}
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

const StringEditor: FunctionComponent<{
  type?: 'input' | 'textarea'
  defaultValue?: string
  onChange?: EventHandler<ChangeEvent<HTMLTextAreaElement | HTMLInputElement>>
}> = (props) => props.type === 'textarea'
  ? <Textarea
    className={c('string')}
    defaultValue={props.defaultValue ?? ''}
    onChange={props.onChange} />
  : <Input
    type='text'
    className={c('string')}
    defaultValue={props.defaultValue ?? ''}
    onChange={props.onChange} />

const NumberEditor: FunctionComponent<{
  defaultValue?: number
  onChange?: EventHandler<ChangeEvent<HTMLInputElement>>
}> = (props) => <Input
  className={c('number')}
  type='number'
  defaultValue={props.defaultValue ?? 0}
  onChange={props.onChange} />

const BooleanEditor: FunctionComponent<{
  defaultValue?: boolean
  onChange?: EventHandler<ChangeEvent<HTMLInputElement>>
}> = (props) => <Input
  className={c('boolean')}
  type='checkbox'
  defaultChecked={props.defaultValue ?? false}
  onChange={props.onChange} />

const NullEditor: FunctionComponent<{ defaultValue: null }> = () => <span className={c('null')}>null</span>

const RecordEditor: FunctionComponent<{
  defaultValue?: Record<string, JsonValue>
  onChange?: (newValue: Record<string, JsonValue>) => void
  path?: Array<string | number>
}> = ({
  defaultValue = {},
  onChange,
  path
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
    let propName = ''
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

  return <ul className={c('record')}>
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

const ArrayEditor: FunctionComponent<{
  defaultValue?: JsonValue[]
  onChange?: (newValue: JsonValue[]) => void
  path?: Array<string | number>
}> = ({
  defaultValue = [],
  onChange,
  path
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

  const handleLiftProp = (pos: number): void => setValueAndDispatch(new Map([
    ...Array.from(value).slice(0, pos - 1),
    Array.from(value)[pos],
    Array.from(value)[pos - 1],
    ...Array.from(value).slice(pos + 1)
  ].filter(e => e !== undefined)))

  const handleDropProp = (pos: number): void => setValueAndDispatch(new Map([
    ...Array.from(value).slice(0, pos),
    Array.from(value)[pos + 1],
    Array.from(value)[pos],
    ...Array.from(value).slice(pos + 2)
  ].filter(e => e !== undefined)))

  return <ol>
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
