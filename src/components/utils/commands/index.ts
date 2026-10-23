import {
  useEffect,
  useRef
} from 'react'
import {
  COMMAND_EVENT,
  type AddressedCommand,
  type Command
} from './types.js'

function splitOnce (value: string, separator: string): [string, string | undefined] {
  const index = value.indexOf(separator)
  if (index === -1) return [value, undefined]
  return [value.slice(0, index), value.slice(index + separator.length)]
}

/** Reads `@target:action:arg,arg` into its parts, or `null` when the string isn't one. */
export function parseCommand (raw: string): Command | null {
  const trimmed = raw.trim()
  const [target, body] = trimmed.startsWith('@')
    ? splitOnce(trimmed.slice(1), ':')
    : [undefined, trimmed]
  if (target === '' || body === undefined) return null
  const [action, argList] = splitOnce(body, ':')
  if (action === '') return null
  const args = argList === undefined ? [] : argList.split(',').map(arg => arg.trim())
  if (args.some(arg => arg === '')) return null
  return { target, action, args }
}

/** Writes a command back as the string it is parsed from. */
export function formatCommand (command: Command): string {
  const { target, action, args } = command
  const address = target === undefined ? '' : `@${target}:`
  const argList = args.length === 0 ? '' : `:${args.join(',')}`
  return `${address}${action}${argList}`
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
