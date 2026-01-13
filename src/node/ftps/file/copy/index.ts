import { Client } from 'basic-ftp'
import { PassThrough } from 'node:stream'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

export type CopyOptions = {
  /**
   * If `false` and the target already exists, the operation is aborted.
   * @default false
   */
  overwrite?: boolean
  /**
   * If `true`, ensures that the target directory hierarchy exists before the
   * upload starts (creates missing folders with `ensureDir`).
   * @default true
   */
  ensureDir?: boolean
}

/**
 * Copies a file from one path to another on the same FTP server, streaming the
 * data instead of buffering it in memory.
 *
 * @param {Client}  ftpClient  - The basic‑ftp client instance.
 * @param {string}  sourcePath - The path of the source file.
 * @param {string}  targetPath - The destination path.
 * @param {CopyOptions} [options] - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copy (
  ftpClient: Client,
  sourcePath: string,
  targetPath: string,
  options?: CopyOptions
): Promise<Outcome.Either<true, string>> {
  const {
    overwrite  = false,
    ensureDir  = true
  } = options ?? {}

  try {
    // Abort if destination exists and overwrite is disabled
    if (!overwrite) {
      try {
        await ftpClient.size(targetPath)
        return Outcome.makeFailure(`File already exists at ${targetPath}.`)
      } catch { /* 550 = not found – safe to proceed */ }
    }

    // Create missing target directories if requested
    if (ensureDir) {
      const dirPath = targetPath.substring(0, targetPath.lastIndexOf('/'))
      if (dirPath) await ftpClient.ensureDir(dirPath)
    }

    // Stream copy: download → PassThrough → upload
    const pass = new PassThrough()

    // Start the upload first so the server reads from `pass` as data arrives
    const uploadPromise = ftpClient.uploadFrom(pass, targetPath)

    // Pump data from source into `pass`
    await ftpClient.downloadTo(pass, sourcePath)

    // Wait until the upload completes
    await uploadPromise
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
