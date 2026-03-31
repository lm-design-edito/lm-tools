import { getGeometricStep } from '../../numbers/geometric-progressions/index.js'
import { round } from '../../numbers/round/index.js'
import { make as makeArr } from '../../arrays/make/index.js'

/**
 * Generates an array of interpolated values between a minimum and maximum using a geometric progression.
 *
 * @param {number} min - The starting value of the scale.
 * @param {number} max - The ending value of the scale.
 * @param {number} intermediateLevels - The number of intermediate levels between min and max.
 * @returns {number[]} An array of rounded values including the minimum and interpolated steps up to the maximum.
 */
export const interpolateLevels = (
  min: number,
  max: number,
  intermediateLevels: number
): number[] => [
  round(min, 2),
  ...makeArr(
    pos => round(
      getGeometricStep(
        min,
        max,
        pos + 1,
        intermediateLevels + 1
      ),
      2
    ),
    intermediateLevels + 1
  )
]

/** Describes the configuration used to compute scale values across breakpoints. */
export type ScaleDataOptions = {
  /** Ordered list of breakpoint widths in pixels. Must contain at least two values. */ breakpoints: number[]
  /** The minimum and maximum values for the low end of the scale. */ loScaleBounds: [number, number]
  /** The minimum and maximum values for the high end of the scale. */ hiScaleBounds: [number, number]
  /** Number of intermediate levels between the minimum and maximum values. */ intermediateLevels: number
}

/**
 * Computes scale data for each breakpoint, including interpolated levels.
 *
 * @param {ScaleDataOptions} options - Configuration for generating scale data.
 * @param {number[]} options.breakpoints - Ordered list of breakpoint widths in pixels.
 * @param {[number, number]} options.loScaleBounds - Minimum and maximum values for the low end of the scale.
 * @param {[number, number]} options.hiScaleBounds - Minimum and maximum values for the high end of the scale.
 * @param {number} options.intermediateLevels - Number of intermediate levels between bounds.
 * @throws Will throw if `breakpoints` contains fewer than two values.
 */
export const getScaleData = ({
  breakpoints,
  loScaleBounds,
  hiScaleBounds,
  intermediateLevels
}: ScaleDataOptions): Array<{
  breakpoint: number
  levels: number[]
}> => {
  const [loMinValuePx, loMaxValuePx] = loScaleBounds
  const [hiMinValuePx, hiMaxValuePx] = hiScaleBounds
  const loValueDiff = loMaxValuePx - loMinValuePx
  const hiValueDiff = hiMaxValuePx - hiMinValuePx
  const maxBreakpoint = breakpoints.at(-1)
  const minBreakpoint = breakpoints.at(0)
  if (breakpoints.length < 2
    || maxBreakpoint === undefined
    || minBreakpoint === undefined) throw new Error(`\`breakpoints\` length must be at least 2. Found ${breakpoints.length}`)
  return breakpoints.map(breakpoint => {
    const thisBreakpointRatio = (breakpoint - minBreakpoint) / (maxBreakpoint - minBreakpoint)
    const lo = (thisBreakpointRatio * loValueDiff) + loMinValuePx
    const hi = (thisBreakpointRatio * hiValueDiff) + hiMinValuePx
    return {
      breakpoint,
      levels: interpolateLevels(
        lo,
        hi,
        intermediateLevels
      )
    }
  })
}

/** Extends scale data options with CSS generation parameters. */
export type GenerateScaleCssOptions = ScaleDataOptions & {
  /** The base name used for generated CSS custom properties. */ scaleName: string
  /** The CSS selector that will receive the custom properties. */ targetSelector: string
  /** The unit to append to each generated value (e.g., `px`, `rem`). */ unit: string
}

/**
 * Generates responsive CSS custom properties for a scale across breakpoints.
 *
 * @param {GenerateScaleCssOptions} options - Configuration for generating the CSS output.
 * @param {string} options.scaleName - Base name for CSS custom properties.
 * @param {string} options.targetSelector - CSS selector to which the properties will be applied.
 * @param {string} options.unit - Unit appended to each value.
 * @param {number[]} options.breakpoints - Ordered list of breakpoint widths in pixels.
 * @param {[number, number]} options.loScaleBounds - Minimum and maximum values for the low end of the scale.
 * @param {[number, number]} options.hiScaleBounds - Minimum and maximum values for the high end of the scale.
 * @param {number} options.intermediateLevels - Number of intermediate levels between bounds.
 * @returns {string} A CSS string containing custom properties for each breakpoint, wrapped in media queries where applicable.
 */
export const generateScaleCss = ({
  scaleName,
  targetSelector,
  unit,
  ...options
}: GenerateScaleCssOptions): string => getScaleData(options).map(({
  breakpoint,
  levels
}, pos) => {
  const levelsCss = levels.map((lvlVal, lvlPos) => `--${scaleName}-${lvlPos}: ${lvlVal}${unit};`)
  if (pos === 0) return `${targetSelector} {
  ${levelsCss.join('\n  ')}
}\n`
  return `@media (min-width: ${breakpoint}px) {
  ${targetSelector} {
    ${levelsCss.join('\n    ')}
  }
}\n`
}).join('\n')
