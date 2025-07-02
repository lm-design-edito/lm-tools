import { Client } from 'basic-ftp'
import { PassThrough } from 'node:stream'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

export type CopyOptions = {
  /** If false and the target already exists, the operation is aborted. Defaults to false. */
  overwrite?: boolean
}

/**
 * Copies a file from one path to another on the same FTP server, streaming the
 * data instead of buffering it in memory.
 *
 * @param {Client} ftpClient     - The basic‑ftp client instance.
 * @param {string} sourcePath    - The path of the source file.
 * @param {string} targetPath    - The destination path.
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
  const { overwrite = false } = options ?? {}
  try {
    if (!overwrite) {
      try {
        await ftpClient.size(targetPath)
        return Outcome.makeFailure(`File already exists at ${targetPath}.`)
      } catch { /* 550 = not found – safe to proceed */ }
    }
    const pass = new PassThrough()

    // Begin reading from `pass` on the server before we start writing into it
    const uploadPromise = ftpClient.uploadFrom(pass, targetPath)

    // Stream the source file into the PassThrough
    await ftpClient.downloadTo(pass, sourcePath)

    // Wait until the upload completes
    await uploadPromise
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
