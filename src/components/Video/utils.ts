import type {
  Dispatch,
  SetStateAction
} from 'react'

/* Video element triggers */

export const muteAttributeWorkaround = (
  video: HTMLVideoElement | null,
  shouldMute: boolean,
  setIsSoundOn: Dispatch<SetStateAction<boolean>>
) => {
  if (video === null) return
  if (shouldMute !== true) return
  const currentMuted = video.getAttribute('muted')
  if (currentMuted !== null) return
  video.setAttribute('muted', '')
  video.load()
  setIsSoundOn(false)
}

export const forceMute = (
  video: HTMLVideoElement | null,
  setIsSoundOn: Dispatch<SetStateAction<boolean>>
) => {
  if (video === null) return
  video.muted = true
  setIsSoundOn(false)
}

export const forceLoud = (
  video: HTMLVideoElement | null,
  setIsSoundOn: Dispatch<SetStateAction<boolean>>
) => {
  if (video === null) return
  video.muted = false
  setIsSoundOn(true)
}

export const forcePlay = async (
  video: HTMLVideoElement | null,
  shouldDisclaimerBeOn: boolean,
  setIsPlaying: Dispatch<SetStateAction<boolean>>
) => {
  if (shouldDisclaimerBeOn) {
    setIsPlaying(false)
    return
  }
  if (video === null) return
  try {
    await video.play()
    setIsPlaying(true)
  } catch (e) {
    console.error(e)
  }
}

export const forcePause = (
  video: HTMLVideoElement | null,
  setIsPlaying: Dispatch<SetStateAction<boolean>>
) => {
  if (video === null) {
    setIsPlaying(false)
    return
  }
  try {
    video.pause()
    setIsPlaying(false)
  } catch (e) {
    console.error(e)
  }
}

export const forceFullScreen = async (
  video: HTMLVideoElement | null,
  shouldDisclaimerBeOn: boolean,
  setIsFullscreen: Dispatch<SetStateAction<boolean>>
) => {
  if (shouldDisclaimerBeOn) return
  if (video === null) {
    setIsFullscreen(false)
    return
  }
  try {
    await video.requestFullscreen()
    setIsFullscreen(true)
  } catch (e) {
    setIsFullscreen(false)
    console.error(e)
  }
}

export const forceExitFullScreen = async (
  video: HTMLVideoElement | null,
  setIsFullscreen: Dispatch<SetStateAction<boolean>>
) => {
  if (video === null) {
    setIsFullscreen(false)
    return
  }
  try {
    await document.exitFullscreen()
    setIsFullscreen(false)
  } catch (e) {
    console.error(e)
  }
}

/* Time & formats */

export function secondsToMs (seconds: number): number {
  return seconds * 1000
}

export function formatTime (ms: number, format: string, fps: number = 25): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const frames = Math.floor(((ms % 1000) / 1000) * fps)
  const msRest = Math.floor(ms % 1000)
  const tokens: Record<string, string | number> = {
    hh: String(hours).padStart(2, '0'),
    mm: String(minutes).padStart(2, '0'),
    ss: String(seconds).padStart(2, '0'),
    frame: String(frames).padStart(2, '0'),
    ms: String(msRest).padStart(3, '0'),
    h: hours,
    m: minutes,
    s: seconds,
    f: frames
  }
  const result = Object
    .keys(tokens)
    .sort((a, b) => b.length - a.length)
    .reduce(
      (acc, t) => acc.replace(new RegExp(t, 'g'), String(tokens[t])),
      format
    )
  return result
}
