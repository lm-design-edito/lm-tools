import { isRecord } from '../is-record/index.js'

/**
 * Safely retrieves a nested property from an object using a dot-separated path string.
 *
 * @param {unknown} anythingThatHasProperties - The object (or record) to traverse.
 * @param {string} pathString - Dot-separated path of the property to retrieve (e.g., `'a.b.c'`).
 * @returns {any} The value at the specified path.
 * @throws {string} `'PROPERTY_UNREACHABLE'` if any part of the path is inaccessible or not an object.
 */
export function deepGetProperty (
  anythingThatHasProperties: unknown,
  pathString: string
): any {
  const pathChunks = pathString.split('.').map(e => e.trim()).filter(e => e !== '')
  let currentObject = anythingThatHasProperties
  let returned: any = currentObject
  pathChunks.forEach((chunk, pos) => {
    const isLast = pos === pathChunks.length - 1
    if (!isRecord(currentObject)) throw new Error('PROPERTY_UNREACHABLE')
    if (isLast) {
      const val = currentObject[chunk]
      returned = val
    } else {
      const found = currentObject[chunk]
      if (isRecord(found)) currentObject = found
      else throw new Error('PROPERTY_UNREACHABLE')
    }
  })
  return returned
}
