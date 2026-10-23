import {
  useEffect,
  useRef
} from 'react'
import { splitFirst } from '../../../agnostic/strings/split-first/index.js'
import { splitTrim } from '../../../agnostic/strings/split-trim/index.js'
import type {
  AddressedCommand,
  Command,
  CommandActions
} from './types.js'

const COMMAND_EVENT = 'lm-tools-command'

// Its own target rather than `window`, so nothing global is touched.
const commandBus = new EventTarget()

class CommandEvent extends CustomEvent<AddressedCommand> {
  constructor (command: AddressedCommand) {
    super(COMMAND_EVENT, { detail: command })
  }
}

/** Reads `@target:action:arg,arg` into its parts, or `null` when the string isn't one. */
export function parseCommand (raw: string): Command | null {
  const trimmed = raw.trim()
  const [target, body] = trimmed.startsWith('@')
    ? splitFirst(trimmed.slice(1), ':')
    : [undefined, trimmed]
  if (target === '' || body === undefined) return null
  const [action, argList] = splitFirst(body, ':')
  if (action === '') return null
  const args = argList === undefined ? [] : splitTrim(argList, ',')
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
  const addressed: AddressedCommand = { ...command, target: command.target ?? from }
  commandBus.dispatchEvent(new CommandEvent(addressed))
}

/** Calls back on every command addressed to `target`, and returns the unsubscribe. */
export function subscribeToCommands (
  target: string,
  onCommand: (command: AddressedCommand) => void
): () => void {
  const listener = (event: Event): void => {
    if (!(event instanceof CommandEvent)) return
    if (event.detail.target === target) onCommand(event.detail)
  }
  commandBus.addEventListener(COMMAND_EVENT, listener)
  return () => { commandBus.removeEventListener(COMMAND_EVENT, listener) }
}

/** Runs the action a command names, for as long as a component is mounted. */
export function useCommands (
  target: string,
  actions: CommandActions
): void {
  // Through a ref, so a table rebuilt on every render doesn't resubscribe.
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  useEffect(
    () => subscribeToCommands(target, command => {
      const action = actionsRef.current[command.action]
      if (action === undefined) {
        // eslint-disable-next-line no-console
        console.warn(`"${target}" has no action named "${command.action}"`)
        return
      }
      action(command.args)
    }),
    [target]
  )
}
