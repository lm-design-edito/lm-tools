/**
 * Checks whether a value exists in a TypeScript enum.
 *
 * Works with both string and numeric enums, ignoring reverse mappings in numeric enums.
 *
 * @template E - The enum type.
 * @param {E} enumObj - The enum object to check against.
 * @param {string | number} value - The value to test.
 * @returns {value is E[keyof E]} `true` if the value is a valid enum member, otherwise `false`.
 */
export function isInEnum<E extends Record<string, string | number>> (
  enumObj: E,
  value: string | number
): value is E[keyof E] {
  const keys = Object.keys(enumObj)
  const values = Object.values(enumObj)
  const numericValues = values.filter(val => typeof val === 'number')
  const cleanKeys = keys.filter(key => !numericValues.includes(parseInt(key, 10)))
  const cleanValues = cleanKeys.map(cleanKey => enumObj[cleanKey])
  return cleanValues.includes(value)
}
