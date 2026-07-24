import type { setTimeout } from 'node:timers'

/** The return type of Node.js `setTimeout`, used for typed timeout handles. */
export type NodeTimeout = ReturnType<typeof setTimeout>
