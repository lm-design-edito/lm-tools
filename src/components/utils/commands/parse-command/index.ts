import type { Command } from '../types.js'

export function parseCommand (raw: string): Command | null {
  const segments = raw.trim().split(':')
  if (segments.some(segment => segment === '')) return null
  const [first, ...rest] = segments
  if (first === undefined) return null
  if (!first.startsWith('@')) return { action: first, args: rest }
  const target = first.slice(1)
  const [action, ...args] = rest
  if (target === '' || action === undefined) return null
  return { target, action, args }
}
