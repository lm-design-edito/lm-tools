import { pbkdf2Sync, randomBytes } from 'node:crypto'

export type GenerateOptions = {
  saltLength?: number
  iterations?: number
}

/**
 * Generates an encryption key from a passphrase using PBKDF2.
 *
 * @param passphrase - The passphrase to derive the key from.
 * @param outputByteLength - The length of the output encryption key in bytes.
 * @param [options] - Optional options.
 * @param [options.saltLength=16] - The length of the salt in bytes. Defaults to 16 bytes.
 * @param [options.iterations=100000] - The number of PBKDF2 iterations. Defaults to 100,000 iterations.
 *
 * @returns The derived encryption key and salt, concatenated as a string in the format `salt:encryptionKey`.
 */
export function generate (
  passphrase: string,
  outputByteLength: number,
  options?: GenerateOptions
): string {
  const { saltLength = 16, iterations = 100000 } = options ?? {}
  const salt = randomBytes(saltLength)
  const key = pbkdf2Sync(passphrase, salt, iterations, outputByteLength, 'sha256')
  const saltString = salt.toString('hex')
  const keyString = key.toString('hex')
  return `${saltString}:${keyString}`
}
