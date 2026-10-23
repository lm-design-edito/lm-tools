import {
  useEffect,
  useRef
} from 'react'
import { subscribeToCommands } from '../subscribe-to-commands/index.js'
import type { AddressedCommand } from '../types.js'

export function useCommands (
  target: string,
  onCommand: (command: AddressedCommand) => void
): void {
  // Through a ref, so a handler rebuilt on every render doesn't resubscribe.
  const onCommandRef = useRef(onCommand)
  onCommandRef.current = onCommand
  useEffect(
    () => subscribeToCommands(target, command => onCommandRef.current(command)),
    [target]
  )
}
