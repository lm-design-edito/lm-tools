import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
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

// Keyed on the trio a send limit counts, built through JSON so no id can forge a key.
const sendCounts = new Map<string, number>()

/**
 * Dispatches every command in `raw`, addressed to the sender when one names no target.
 * A command carrying a send limit is dropped once its origin, target and action have
 * been sent that many times — a count that lasts as long as the page.
 */
export function sendCommands (raw: string | string[], fromCompId: string): void {
  const sendOne = (command: Command): void => {
    const addressed: AddressedCommand = { ...command, target: command.target ?? fromCompId }
    const countKey = JSON.stringify([fromCompId, addressed.target, addressed.action])
    const sentCount = sendCounts.get(countKey) ?? 0
    if (addressed.sendLimit !== undefined && sentCount >= addressed.sendLimit) return
    sendCounts.set(countKey, sentCount + 1)
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
 * Runs the action a command names, for as long as a component is mounted.
 *
 * An action named in `surrenderedActions` is dropped unless the command carries
 * `force`, which is where that modifier takes effect — see {@link useCommandSurrender}.
 * @param targetCompId - The id commands are addressed to.
 * @param actions - What to run for each action name.
 * @param surrenderedActions - The actions the reader has taken over.
 */
export function useCommands (
  targetCompId: string,
  actions: CommandActions,
  surrenderedActions: readonly string[] = []
): void {
  // Through a ref, so a table rebuilt on every render doesn't resubscribe.
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const surrenderedActionsRef = useRef(surrenderedActions)
  surrenderedActionsRef.current = surrenderedActions
  useEffect(
    () => subscribeToCommands(targetCompId, command => {
      const action = actionsRef.current[command.action]
      if (action === undefined) {
        // eslint-disable-next-line no-console
        console.warn(`"${targetCompId}" has no action named "${command.action}"`)
        return
      }
      if (!command.force && surrenderedActionsRef.current.includes(command.action)) return
      action(command)
    }),
    [targetCompId]
  )
}

/**
 * Holds what the reader has taken over, and hands a domain over for good.
 *
 * A domain groups the actions one control governs, so surrendering `sound` silences
 * `loud`, `mute` and `volume` at once. A domain no action carries yet is surrendered
 * all the same: it silences nothing today and starts working the day a verb joins it.
 * @template D - The component's domains.
 * @param domains - Every domain the component knows. It also orders what comes back, so
 * a rendered list never depends on the order the reader clicked in.
 * @param actionDomains - The domain of each action.
 * @returns `surrenderedDomains` to render, `surrenderedActions` to hand to
 * {@link useCommands}, and `surrender` to call from a handler.
 */
export function useCommandSurrender<D extends string> (
  domains: readonly D[],
  actionDomains: Readonly<Record<string, D>>
): {
  surrenderedDomains: D[]
  surrenderedActions: string[]
  surrender: (domain: D) => void
} {
  const [claimedDomains, setClaimedDomains] = useState<D[]>([])
  const surrender = useCallback((domain: D) => {
    setClaimedDomains(current => current.includes(domain) ? current : [...current, domain])
  }, [])
  const surrenderedDomains = useMemo(
    () => domains.filter(domain => claimedDomains.includes(domain)),
    [domains, claimedDomains]
  )
  const surrenderedActions = useMemo(
    () => Object.entries(actionDomains)
      .filter(([, domain]) => surrenderedDomains.includes(domain))
      .map(([action]) => action),
    [actionDomains, surrenderedDomains]
  )
  return { surrenderedDomains, surrenderedActions, surrender }
}
