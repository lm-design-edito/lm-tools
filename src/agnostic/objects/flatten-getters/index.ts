/**
 * Returns a shallow copy of an object including values from its getter properties.
 *
 * @param obj - The object to flatten.
 * @returns A new object containing all own properties and evaluated getter values.
 */
export function flattenGetters (obj: object): Record<string, unknown> {
  const getters = Object.entries(
    Object.getOwnPropertyDescriptors(obj)
  ).filter(([_, desc]) => (typeof desc.get === 'function'))
    .map(([key]) => key)
  const returned: Record<string, unknown> = { ...obj }
  getters.forEach(getter => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- getter came from Object.getOwnPropertyDescriptors(obj)'s own keys, so it's always a key of obj
    const key = getter as keyof typeof obj
    returned[getter] = obj[key]
  })
  return returned
}
