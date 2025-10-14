export function round (number: number, nbDecimals: number) {
  const multiplier = Math.pow(10, nbDecimals)
  return Math.round(number * multiplier) / multiplier
}

export function ceil (number: number, nbDecimals: number) {
  const multiplier = Math.pow(10, nbDecimals)
  return Math.ceil(number * multiplier) / multiplier
}

export function floor (number: number, nbDecimals: number) {
  const multiplier = Math.pow(10, nbDecimals)
  return Math.floor(number * multiplier) / multiplier
}
