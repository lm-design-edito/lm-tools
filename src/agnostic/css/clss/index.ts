export type CssModuleObj = Readonly<Record<string, string>>
export type ModsDescriptor = string | string[] | Record<string, boolean | null | undefined>
export type EltNamesDescriptor = string | null | Array<string | null>
export type Options = {
  cssModule: CssModuleObj
  cssModuleRoot?: string
}
export type ClssMaker = (eltNames: EltNamesDescriptor, modNames?: ModsDescriptor) => string

export function clss (
  blockNames: string | string[],
  options?: Options
): ClssMaker {
  const blockNamesArr = Array.isArray(blockNames)
    ? blockNames
    : [blockNames]
  return (eltNames, modNames = []) => {
    // Refine input arguments
    const eltNamesArr = Array.isArray(eltNames) ? eltNames : [eltNames]
    const modNamesArr = (Array.isArray(modNames) ? modNames : [modNames]).map(modName => {
      if (typeof modName === 'string') return modName
      const trueModNames = Object
        .entries(modName)
        .filter((entry): entry is [string, true] => entry[1] === true)
        .map(([key]) => key)
      return trueModNames
    }).flat()

    // Prepare returned value
    const outputClassesArr: string[] = []
    blockNamesArr.forEach(compName => {
      eltNamesArr.forEach(eltName => {
        // Un-modified classes
        const targetPublicClss = eltName === null ? compName : `${compName}__${eltName}`
        const targetPrivateClss = eltName === null
          ? options?.cssModule[options.cssModuleRoot ?? 'root']
          : options?.cssModule[eltName]
        outputClassesArr.push(targetPublicClss)
        if (targetPrivateClss !== undefined) outputClassesArr.push(targetPrivateClss)

        // Modified classes
        modNamesArr.forEach(modName => {
          const targetModifiedPublicClss = `${targetPublicClss}--${modName}`
          const targetModifiedPrivateClss = eltName === null
            ? options?.cssModule[`${options.cssModuleRoot ?? 'root'}--${modName}`]
            : options?.cssModule[`${eltName}--${modName}`]
          outputClassesArr.push(targetModifiedPublicClss)
          if (targetModifiedPrivateClss !== undefined) outputClassesArr.push(targetModifiedPrivateClss)
        })
      })
    })

    // Return
    return outputClassesArr.join(' ')
  }
}
