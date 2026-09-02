/** A JSON value that contains no other value. */
export type JsonPrimitive = string | number | boolean | null

/** Any value `JSON.parse` can produce, and the type the editor reads and emits. */
export type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue }

/**
 * The editor's name for a value's kind. It is what the type selector offers, and
 * what modifies the `value` class name on each node.
 */
export type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'record'
