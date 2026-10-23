/** The `window` event every command travels on. */
export const COMMAND_EVENT = 'lm-command'

/** A command as parsed: an action, its arguments, and a target it may not name. */
export type Command = {
  target?: string
  action: string
  args: string[]
}

/** A command on the wire: the target is resolved, to the sender when none was written. */
export type AddressedCommand = Command & { target: string }

declare global {
  interface WindowEventMap {
    'lm-command': CustomEvent<AddressedCommand>
  }
}
