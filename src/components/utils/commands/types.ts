/** A command as parsed: an action, its arguments, a target it may not name, its modifiers. */
export type Command = {
  target?: string
  action: string
  args: string[]
  force: boolean
  sendLimit?: number
}

/** A command on the wire: the target is resolved, to the sender when none was written. */
export type AddressedCommand = Command & { target: string }

/**
 * The actions a component reacts to, by name, each taking the whole command.
 *
 * The command and not just its `args`, so an action can read the modifiers it arrived
 * with. Honouring `force` is not its business: a surrendered action is dropped before
 * it is ever called.
 */
export type CommandActions = Record<string, (command: Command) => void>
