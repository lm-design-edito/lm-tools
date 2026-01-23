import * as Cast from '../../misc/cast/index.js'

/**
 * Returns a shallow copy of an object including values from its getter properties.
 *
 * @param {unknown} obj - The object to flatten.
 * @returns {Record<string, unknown>} A new object containing all own properties and evaluated getter values.
 */
export function flattenGetters (obj: unknown): Record<string, unknown> {
  const { entries, getOwnPropertyDescriptors } = Object
  const properties = Cast.toRecord(obj)
  const getters = entries(getOwnPropertyDescriptors(obj))
    .filter(([_, desc]) => (typeof desc.get === 'function'))
    .map(([key]) => key)
  const returned: Record<string, unknown> = { ...properties }
  getters.forEach(getter => {
    returned[getter] = (obj as any)[getter]
  })
  return returned
}
