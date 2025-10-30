import Client, { TransferOptions } from 'ssh2-sftp-client'
import { PassThrough } from 'node:stream'
import { Outcome } from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

export type CopyOptions = TransferOptions & {
  /**
   * If `false` and the target already exists, the operation is aborted.
   * @default false
   */
  overwrite?: boolean
  /**
   * If `true`, ensures that the target directory hierarchy exists before the
   * upload starts (creates missing folders with `mkdir -p` behaviour).
   * @default true
   */
  ensureDir?: boolean
}

/**
 * Copies a file from one path to another on the same SFTP server using streams
 * (avoids loading the entire file into memory).
 *
 * @param {Client}  sftp       - The ssh2‑sftp‑client instance.
 * @param {string}  sourcePath - The path of the source file.
 * @param {string}  targetPath - The destination path.
 * @param {CopyOptions} [options] - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copy (
  sftp: Client,
  sourcePath: string,
  targetPath: string,
  options?: CopyOptions
): Promise<Outcome.Either<true, string>> {
  const {
    overwrite  = false,
    ensureDir  = true,
    ...transferOptions
  } = options ?? {}

  try {
    // Abort if destination exists and overwrite is disabled
    if (!overwrite) {
      const exists = await sftp.exists(targetPath)
      if (exists) return Outcome.makeFailure(`File already exists at ${targetPath}.`)
    }

    // Create missing target directories if requested
    if (ensureDir) {
      const dirPath = targetPath.substring(0, targetPath.lastIndexOf('/'))
      if (dirPath) await sftp.mkdir(dirPath, true)
    }

    // Stream copy: download → PassThrough → upload
    const pass = new PassThrough()
    const uploadPromise = sftp.put(pass, targetPath, transferOptions)
    await sftp.get(sourcePath, pass, transferOptions)
    await uploadPromise

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}