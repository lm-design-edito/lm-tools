import { deepSelect } from '../deep-select/index.js'

type Options = {
  watch?: (elt: Element) => void
  unwatch?: (elt: Element) => void
  selectIntervalMs?: number
}

export const watchSelection = async (
  selector: string,
  options: Options
) => {
  const watch = options?.watch ?? (() => {})
  const unwatch = options?.unwatch ?? (() => {})
  let watched = await deepSelect(selector)
  watched.forEach(watch)
  const selectIntervalMs = options?.selectIntervalMs ?? 100
  const interval = window.setInterval(async () => {
    const watchedNow = await deepSelect(selector)
    const staleWatched = watched.filter(elt => !watchedNow.includes(elt))
    const newWatched = watchedNow.filter(elt => !watched.includes(elt))
    staleWatched.forEach(unwatch)
    newWatched.forEach(watch)
    watched = watchedNow
  }, selectIntervalMs)
  const kill = () => {
    window.clearInterval(interval)
    watched.forEach(unwatch)
  }
  return { kill }
}
