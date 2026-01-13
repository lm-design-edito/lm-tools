// [WIP]
// Has all keys from
// Has extra keys from
// Has same keys from

// Has equal properties than (maybe option for not just shallow equivalence?)
// Has extra properties than
// Has same properties than

/**
 * Checks if an object contains all the key-value pairs from a partial object.
 *
 * Performs a shallow equality check for each property in `partial`.
 *
 * @template T - The type of the full object.
 * @param {T} obj - The object to validate.
 * @param {Partial<T>} partial - The partial object with key-value pairs to check.
 * @returns {boolean} `true` if all entries in `partial` match those in `obj`, otherwise `false`.
 */
export function fromPartial<T extends object> (obj: T, partial: Partial<T>): boolean {
  return Object.entries(partial).every(([key, val]) => {
    return obj[key as keyof Partial<T>] === val
  })
}
