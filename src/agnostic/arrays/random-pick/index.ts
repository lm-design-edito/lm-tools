import * as ERR from '../../../shared/errors/index.js'

export function randomPick<T> (arr: T[], exclude: T[] = []): T {
  const filteredArr = [...arr].filter(elt => !exclude.includes(elt))
  const length = filteredArr.length
  if (length === 0) throw ERR.register.getError(ERR.Codes.IMPOSSIBLE_TO_PICK_IN_ARRAY, arr)
  const pos = Math.floor(Math.random() * length)
  const found = filteredArr[pos] as T
  return found
}

export function randomPickMany<T> (
  howMuch: number,
  arr: T[],
  exclude: T[] = []
): T[] {
  const grindedArr = [...arr]
  const pickedSelection: T[] = []
  for (let i = 0; i < howMuch; i++) {
    const picked = randomPick(grindedArr, exclude)
    const indexOfPicked = grindedArr.indexOf(picked)
    grindedArr.splice(indexOfPicked, 1)
    pickedSelection.push(picked)
  }
  return pickedSelection
}
