export function getRelativePointerCoordinates (event: PointerEvent, element: HTMLDivElement | null): { x: number, y: number } {
  if (element === null) {
    return { x: 0, y: 0 }
  }
  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y }
}
