import type { Command } from '../types.js'

export function formatCommand (command: Command): string {
  const { target, action, args } = command
  const prefix = target === undefined ? [] : [`@${target}`]
  return [...prefix, action, ...args].join(':')
}
