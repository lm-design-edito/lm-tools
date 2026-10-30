import {
  useCallback,
  useEffect,
  useRef
} from 'react'
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

const SEND_LIMIT_PATTERN = /^(?:once|\d+ce)$/v

const isTarget = (segment: string): boolean => segment.startsWith('@')
const isForce = (segment: string): boolean => segment === 'force'
const isSendLimit = (segment: string): boolean => SEND_LIMIT_PATTERN.test(segment)

/**
 * Reads `@target:force:once:action:arg,arg` into its parts, the first three in any
 * order, or `null` when the string isn't a command. A lone argument can therefore not
 * be `force`, `once`, `3ce`, or start with `@`.
 */
export function parseCommand (raw: string): Command | null {
  const segments = raw.trim().split(':')
  const targets = segments.filter(isTarget)
  const forces = segments.filter(isForce)
  const sendLimits = segments.filter(isSendLimit)
  if (targets.length > 1 || forces.length > 1 || sendLimits.length > 1) return null

  const [action, argList, ...extraneous] = segments.filter(segment => !isTarget(segment)
    && !isForce(segment)
    && !isSendLimit(segment))
  if (action === undefined || action === '' || extraneous.length > 0) return null

  const target = targets[0]?.slice(1)
  if (target === '') return null

  const args = argList === undefined ? [] : splitTrim(argList, ',')
  if (args.some(arg => arg === '')) return null

  const sendLimitSegment = sendLimits[0]
  const sendLimit = sendLimitSegment === undefined
    ? undefined
    : sendLimitSegment === 'once' ? 1 : Number.parseInt(sendLimitSegment, 10)
  if (sendLimit === 0) return null

  return { target, action, args, force: forces.length === 1, sendLimit }
}

/** Writes a command back as the string it is parsed from, modifiers in one order. */
export function formatCommand (command: Command): string {
  const { target, action, args, force, sendLimit } = command
  return [
    ...target === undefined ? [] : [`@${target}`],
    ...force ? ['force'] : [],
    ...sendLimit === undefined ? [] : [sendLimit === 1 ? 'once' : `${sendLimit}ce`],
    action,
    ...args.length === 0 ? [] : [args.join(',')]
  ].join(':')
}

// Both ledgers are keyed by a component and emptied when it unsubscribes, so a remount
// starts clean. The inner key is built through JSON so no id can forge one.
const sendCounts = new Map<string, Map<string, number>>()
const surrenderedActions = new Map<string, Set<string>>()

/**
 * Dispatches every command in `raw`, addressed to the sender when one names no target.
 * A command carrying a send limit is dropped once its origin, target and action have
 * been sent that many times — a count that lasts as long as the sender is mounted.
 */
export function sendCommands (raw: string | string[], fromCompId: string): void {
  const sendOne = (command: Command): void => {
    const addressed: AddressedCommand = { ...command, target: command.target ?? fromCompId }
    const countKey = JSON.stringify([addressed.target, addressed.action])
    const senderCounts = sendCounts.get(fromCompId) ?? new Map<string, number>()
    const sentCount = senderCounts.get(countKey) ?? 0
    if (addressed.sendLimit !== undefined && sentCount >= addressed.sendLimit) return
    senderCounts.set(countKey, sentCount + 1)
    sendCounts.set(fromCompId, senderCounts)
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

/**
 * Holds back the actions a reader has taken over, for the component they address.
 *
 * They stop firing until that component unsubscribes, unless a command carries `force`.
 * The ledger is this layer's, not the component's: nothing is returned, nothing
 * re-renders, and a command sent in the same tick as the gesture is already refused.
 * @param targetCompId - The component the actions belong to.
 * @param actions - The action names to hold back.
 */
export function surrenderCommands (targetCompId: string, actions: readonly string[]): void {
  const held = surrenderedActions.get(targetCompId) ?? new Set<string>()
  actions.forEach(action => { held.add(action) })
  surrenderedActions.set(targetCompId, held)
}

/**
 * Runs the action a command names, for as long as a component is mounted.
 *
 * A surrendered action is dropped unless the command carries `force`, which is where
 * that modifier takes effect — see {@link surrenderCommands}. Unsubscribing empties both
 * of this component's ledgers, so what it surrendered and what it has already sent last
 * the mount and no longer.
 * @param targetCompId - The id commands are addressed to.
 * @param actions - What to run for each action name.
 */
export function useCommands (
  targetCompId: string,
  actions: CommandActions
): void {
  // Through a ref, so a table rebuilt on every render doesn't resubscribe.
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  useEffect(() => {
    const unsubscribe = subscribeToCommands(targetCompId, command => {
      const action = actionsRef.current[command.action]
      if (action === undefined) {
        // eslint-disable-next-line no-console
        console.warn(`"${targetCompId}" has no action named "${command.action}"`)
        return
      }
      if (!command.force && surrenderedActions.get(targetCompId)?.has(command.action) === true) return
      action(command)
    })
    return () => {
      unsubscribe()
      surrenderedActions.delete(targetCompId)
      sendCounts.delete(targetCompId)
    }
  }, [targetCompId])
}

/**
 * Binds a component's own vocabulary to {@link surrenderCommands}.
 *
 * A domain groups the actions one control governs, so `surrender('sound')` holds back
 * every action mapped to it at once. A domain no action carries yet holds back nothing
 * and starts working on its own the day a verb joins it.
 * @param targetCompId - The component's own id.
 * @param actionDomains - The domain of each action.
 * @returns What to call from the handler of a control the reader has just used. It takes
 * any name, so a caller annotates it with its own domain type to have typos caught.
 */
export function useCommandSurrender (
  targetCompId: string,
  actionDomains: Readonly<Record<string, string>>
): (domain: string) => void {
  return useCallback((domain: string) => {
    surrenderCommands(targetCompId, Object.entries(actionDomains)
      .filter(([, actionDomain]) => actionDomain === domain)
      .map(([action]) => action))
  }, [targetCompId, actionDomains])
}
