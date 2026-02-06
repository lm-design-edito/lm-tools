import { Buffer } from 'node:buffer'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

/**
 * Encrypts a `Uint8Array` using AES-256-GCM encryption and the specified encryption key.
 *
 * @param {Uint8Array} fileArray - The input data to encrypt.
 * @param {string} encryptionKey - The encryption key to use.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV). Defaults to 16 bytes.
 *
 * @returns {Outcome.Either<Uint8Array, string>} The result of the encryption. Success returns the encrypted data as a `Uint8Array` (with IV prepended), or failure returns an error message.
 */
export function encryptUint8Array (
  fileArray: Uint8Array,
  encryptionKey: string
): Outcome.Either<Uint8Array, string> {
  const ivLength = 12
  const keyBuffer = Buffer.from(encryptionKey, 'utf-8')
  if (keyBuffer.length !== 32) return Outcome.makeFailure('Encryption key must be 32 bytes for AES-256-GCM.')
  try {
    const iv = randomBytes(ivLength)
    const cipher = createCipheriv('aes-256-gcm', keyBuffer, iv)
    let encrypted = cipher.update(fileArray)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return Outcome.makeSuccess(new Uint8Array(Buffer.concat([iv, encrypted])))
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}

/**
 * Decrypts an encrypted `Uint8Array` using AES-256-GCM encryption and the specified encryption key.
 *
 * @param {Uint8Array} encryptedFile - The encrypted data to decrypt.
 * @param {string} encryptionKey - The encryption key to use.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV). Defaults to 16 bytes.
 *
 * @returns {Outcome.Either<Uint8Array, string>} The result of the decryption. Success returns the decrypted data as a `Uint8Array`, or failure returns an error message.
 */
export function decryptUint8Array (
  encryptedFile: Uint8Array,
  encryptionKey: string
): Outcome.Either<Uint8Array, string> {
  const ivLength = 12
  const iv = encryptedFile.subarray(0, ivLength)
  const keyBuffer = Buffer.from(encryptionKey, 'utf-8')
  if (keyBuffer.length !== 32) return Outcome.makeFailure('Encryption key must be 32 bytes for AES-256-GCM.')
  try {
    const encryptedData = encryptedFile.subarray(ivLength)
    const decipher = createDecipheriv('aes-256-gcm', keyBuffer, iv)
    let decrypted = decipher.update(encryptedData)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return Outcome.makeSuccess(new Uint8Array(decrypted))
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
