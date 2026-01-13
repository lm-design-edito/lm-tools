import { Buffer } from 'node:buffer'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import {
  encryptUint8Array,
  decryptUint8Array
} from '../uint8-array/index.js'

/**
 * Encrypts a `Buffer` by converting it to a `Uint8Array`, performing encryption, and then returning the result as a `Buffer`.
 *
 * @param {Buffer} inputBuffer - The input data to encrypt.
 * @param {string} encryptionKey - The encryption key to use.
 * 
 * @returns {Outcome.Either<Buffer, string>} The result of the encryption. Success returns the encrypted data as a `Buffer` (with IV prepended), or failure returns an error message.
 */
export function encrypt (
  inputBuffer: Buffer,
  encryptionKey: string
): Outcome.Either<Buffer, string> {
  const fileArray = new Uint8Array(inputBuffer)
  const encryptionOutcome = encryptUint8Array(fileArray, encryptionKey)
  if (!encryptionOutcome.success) return encryptionOutcome
  return Outcome.makeSuccess(Buffer.from(encryptionOutcome.payload))
}

/**
 * Decrypts an encrypted `Buffer` by converting it to a `Uint8Array`, performing decryption, and then returning the result as a `Buffer`.
 *
 * @param {Buffer} encryptedBuffer - The encrypted data to decrypt.
 * @param {string} encryptionKey - The encryption key to use.
 * 
 * @returns {Outcome.Either<Buffer, string>} The result of the decryption. Success returns the decrypted data as a `Buffer`, or failure returns an error message.
 */
export function decrypt (
  encryptedBuffer: Buffer,
  encryptionKey: string
): Outcome.Either<Buffer, string> {
  const encryptedArray = new Uint8Array(encryptedBuffer)
  const decryptionOutcome = decryptUint8Array(encryptedArray, encryptionKey)
  if (!decryptionOutcome.success) return decryptionOutcome
  return Outcome.makeSuccess(Buffer.from(decryptionOutcome.payload))
}
