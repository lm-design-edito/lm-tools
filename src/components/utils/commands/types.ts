/** The event type commands are dispatched as, on `commandBus` and nowhere else. */
export const COMMAND_EVENT = 'command'

/** A command as parsed: an action, its arguments, and a target it may not name. */
export type Command = {
  target?: string
  action: string
  args: string[]
}

/** A command on the wire: the target is resolved, to the sender when none was written. */
export type AddressedCommand = Command & { target: string }
