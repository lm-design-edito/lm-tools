import {
  COMMAND_EVENT,
  type AddressedCommand
} from '../types.js'

export function subscribeToCommands (
  target: string,
  onCommand: (command: AddressedCommand) => void
): () => void {
  const listener = (event: CustomEvent<AddressedCommand>): void => {
    if (event.detail.target === target) onCommand(event.detail)
  }
  window.addEventListener(COMMAND_EVENT, listener)
  return () => { window.removeEventListener(COMMAND_EVENT, listener) }
}
