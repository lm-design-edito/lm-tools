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

/** The actions a component reacts to, by name, each taking the raw arguments. */
export type CommandActions = Record<string, (args: string[]) => void>
