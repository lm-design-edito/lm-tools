export const forceActivateSlot = (
  div: HTMLDivElement | null,
  targetPos: number,
  smooth = true
): void => {
  if (div === null) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- div.children (HTMLCollection) always contains Element/HTMLElement nodes
  const children = Array.from(div.children) as HTMLElement[]
  if (children[targetPos] === undefined) return
  const target = children[targetPos]
  const halfClientWidth = div.clientWidth / 2
  const halfOffsetWidth = div.offsetWidth / 2
  const offset = target.offsetLeft - (halfClientWidth - halfOffsetWidth)
  div.scrollTo({
    left: offset,
    behavior: smooth ? 'smooth' : 'instant'
  })
}
