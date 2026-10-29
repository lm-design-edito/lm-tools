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
 * The command and not just its `args`, because an action has to read `force` to know
 * whether it may run over a control the reader has taken over.
 */
export type CommandActions = Record<string, (command: Command) => void>
