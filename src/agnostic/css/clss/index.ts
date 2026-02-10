/**
 * Object representing a CSS module mapping class names to hashed class strings.
 */
export type CssModuleObj = Readonly<Record<string, string>>

/**
 * Descriptor for modifiers.
 * Can be:
 * - a single string,
 * - an array of strings,
 * - an object mapping modifier names to boolean (only `true` modifiers are used).
 */
export type ModsDescriptor = string | string[] | Record<string, boolean | null | undefined>

/**
 * Descriptor for element names.
 * Can be:
 * - a single string,
 * - `null`,
 * - an array of strings or `null`.
 */
export type EltNamesDescriptor = string | null | Array<string | null>

/**
 * Options used to configure the `clss` function.
 */
export type Options = {
  /** CSS module object containing class name mappings */
  cssModule: CssModuleObj
  /** Optional key for the root block in the CSS module */
  cssModuleRoot?: string
}

/**
 * Function to compute class names for elements and modifiers.
 *
 * @param eltNames - Element names or `null`. Can be a string, `null`, or array of strings/null.
 * @param modNames - Modifier names. Can be a string, array of strings, or an object mapping modifiers to boolean.
 * @returns A string containing all resolved public and private CSS classes.
 *
 * @example
 * const classes = btnClss('icon', { active: true, disabled: false })
 * // Returns: "button__icon button__icon--active _hash123 _hash456"
 */
export type ClssMaker = (
  eltNames?: EltNamesDescriptor,
  modNames?: ModsDescriptor
) => string

/**
 * Generates a `ClssMaker` function for a block or blocks.
 *
 * @param blockNames - A single block name or an array of block names.
 * @param options - Optional configuration:
 *   - `cssModule`: Object mapping class names to their hashed equivalents (required if using CSS modules).
 *   - `cssModuleRoot`: Optional key for the root block in the CSS module (defaults to `'root'` if not provided).
 * @returns {ClssMaker}
 *   A function to generate class names for elements and modifiers.
 *
 *   The returned function (`ClssMaker`) parameters:
 *   - `eltNames`: Element names or `null`. Can be a string, `null`, or array of strings/null.
 *   - `modNames`: Modifier names. Can be a string, array of strings, or object mapping modifiers to boolean (`true` modifiers are included).
 *   - Returns a string containing all resolved public and private CSS classes, including element-specific and modifier-specific classes.
 *
 * @example
 * const btnClss = clss('button', { cssModule: styles, cssModuleRoot: 'root' })
 * const classes = btnClss('icon', { active: true, disabled: false })
 */
export function clss (
  blockNames: string | string[],
  options?: Options
): ClssMaker {
  const blockNamesArr = Array.isArray(blockNames)
    ? blockNames
    : [blockNames]
  return (
    eltNames = null,
    modNames = []
  ) => {
    // Refine input arguments
    const eltNamesArr = Array.isArray(eltNames)
      ? eltNames
      : [eltNames]
    const modNamesArr = (Array.isArray(modNames) ? modNames : [modNames])
      .map(modName => {
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
