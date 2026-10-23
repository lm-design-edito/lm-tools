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

/** Dispatches every command in `raw`, addressed to the sender when one names no target. */
export function sendCommands (raw: string | string[], fromCompId: string): void {
  const sendOne = (command: Command): void => {
    const addressed: AddressedCommand = { ...command, target: command.target ?? fromCompId }
    commandBus.dispatchEvent(new CommandEvent(addressed))
  }
  const rawCommands = typeof raw === 'string' ? [raw] : raw
  rawCommands.forEach(rawCommand => {
    const command = parseCommand(rawCommand)
    if (command === null) {
      // eslint-disable-next-line no-console
      console.warn(`"${rawCommand}" is not a command`)
      return
    }
    sendOne(command)
  })
}

/** Calls back on every command addressed to `targetCompId`, and returns the unsubscribe. */
export function subscribeToCommands (
  targetCompId: string,
  onCommand: (command: AddressedCommand) => void
): () => void {
  const listener = (event: Event): void => {
    if (!(event instanceof CommandEvent)) return
    if (event.detail.target === targetCompId) onCommand(event.detail)
  }
  commandBus.addEventListener(COMMAND_EVENT, listener)
  return () => { commandBus.removeEventListener(COMMAND_EVENT, listener) }
}

/** Runs the action a command names, for as long as a component is mounted. */
export function useCommands (
  targetCompId: string,
  actions: CommandActions
): void {
  // Through a ref, so a table rebuilt on every render doesn't resubscribe.
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  useEffect(
    () => subscribeToCommands(targetCompId, command => {
      const action = actionsRef.current[command.action]
      if (action === undefined) {
        // eslint-disable-next-line no-console
        console.warn(`"${targetCompId}" has no action named "${command.action}"`)
        return
      }
      action(command.args)
    }),
    [targetCompId]
  )
}
