import {
  useEffect,
  useRef
} from 'react'
import {
  COMMAND_EVENT,
  type AddressedCommand,
  type Command
} from './types.js'

/** Reads `@target:action:arg` into its parts, or `null` when the string isn't one. */
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

/** Writes a command back as the string it is parsed from. */
export function formatCommand (command: Command): string {
  const { target, action, args } = command
  const prefix = target === undefined ? [] : [`@${target}`]
  return [...prefix, action, ...args].join(':')
}

/** Dispatches a command, addressed to `from` when it names no target of its own. */
export function sendCommand (command: Command, from: string): void {
  const detail: AddressedCommand = { ...command, target: command.target ?? from }
  window.dispatchEvent(new CustomEvent(COMMAND_EVENT, { detail }))
}

/** Calls back on every command addressed to `target`, and returns the unsubscribe. */
export function subscribeToCommands (
  target: string,
  onCommand: (command: AddressedCommand) => void
): () => void {
  const listener = (event: CustomEvent<AddressedCommand>): void => {
    if (event.detail.target === target) onCommand(event.detail)
  }
  window.addEventListener(COMMAND_EVENT, listener)
  return () => { window.removeEventListener(COMMAND_EVENT, listener) }
}

/** `subscribeToCommands` for as long as a component is mounted. */
export function useCommands (
  target: string,
  onCommand: (command: AddressedCommand) => void
): void {
  // Through a ref, so a handler rebuilt on every render doesn't resubscribe.
  const onCommandRef = useRef(onCommand)
  onCommandRef.current = onCommand
  useEffect(
    () => subscribeToCommands(target, command => onCommandRef.current(command)),
    [target]
  )
}
