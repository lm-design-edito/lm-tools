export const COMMAND_EVENT = 'lm-command'

export type Command = {
  target?: string
  action: string
  args: string[]
}

// What a sender emits: the target has been resolved, to itself when none was written.
export type AddressedCommand = Command & { target: string }

declare global {
  interface WindowEventMap {
    'lm-command': CustomEvent<AddressedCommand>
  }
}
