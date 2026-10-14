export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue }
export type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'record'
