export const forceActivateSlot = (
  div: HTMLDivElement | null,
  targetPos: number,
  smooth: boolean = true
): void => {
  if (div === null) return
  const children = Array.from(div.children) as HTMLElement[]
  if (children[targetPos] === undefined) return
  const target = children[targetPos]
  const halfClientWidth = div.clientWidth / 2
  const halfOffsetWidth = div.offsetWidth / 2
  const offset = target.offsetLeft - (halfClientWidth - halfOffsetWidth)
  div.scrollTo({ left: offset, behavior: smooth ? 'smooth' : 'instant' })
}
