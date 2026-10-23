import {
  COMMAND_EVENT,
  type AddressedCommand,
  type Command
} from '../types.js'

export function sendCommand (command: Command, from: string): void {
  const detail: AddressedCommand = { ...command, target: command.target ?? from }
  window.dispatchEvent(new CustomEvent(COMMAND_EVENT, { detail }))
}
