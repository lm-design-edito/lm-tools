/**
 * Maps the values of a record using a provided mapper function, returning a new record with the same keys.
 *
 * @template Input - The type of the input record.
 * @template MappedValue - The type of the mapped values.
 * @param {Input} record - The record whose values will be mapped.
 * @param {(value: Input[keyof Input], key: keyof Input) => MappedValue} mapper - Function to transform each value.
 * @returns {{ [K in keyof Input]: MappedValue }} A new record with the same keys and mapped values.
 */
export function recordMap<Input extends Record<string, any>, MappedValue> (
  record: Input,
  mapper: (value: Input[keyof Input], key: keyof Input) => MappedValue
): { [K in keyof Input]: MappedValue } {
  const result: Partial<{
    [K in keyof Input]: MappedValue
  }> = {}
  for (const key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      result[key] = mapper(record[key], key)
    }
  }
  return result as {
    [K in keyof Input]: MappedValue
  }
}
