import { isRecord } from '../is-record/index.js'

export function deepGetProperty (
  anythingThatHasProperties: unknown,
  pathString: string
): any {
  const pathChunks = pathString.split('.').map(e => e.trim()).filter(e => e !== '')
  let currentObject = anythingThatHasProperties
  let returned: any = currentObject
  pathChunks.forEach((chunk, pos) => {
    const isLast = pos === pathChunks.length - 1
    if (!isRecord(currentObject)) throw 'PROPERTY_UNREACHABLE' // [WIP] maybe use the lib's error register ?
    if (isLast) {
      const val = currentObject[chunk]
      returned = val
    } else {
      const found = currentObject[chunk]
      if (isRecord(found)) currentObject = found
      else throw 'PROPERTY_UNREACHABLE'
    }
  })
  return returned
}
