import Client, { TransferOptions } from 'ssh2-sftp-client'
import { PassThrough } from 'node:stream'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

export type CopyOptions = TransferOptions & {
  /** If false and the target already exists, the operation is aborted. Defaults to false. */
  overwrite?: boolean
}

/**
 * Copies a file from one path to another on the same SFTP server using streams
 * (avoids loading the entire file into memory).
 *
 * @param {Client} sftp          - The ssh2‑sftp‑client instance.
 * @param {string} sourcePath    - The path of the source file.
 * @param {string} targetPath    - The destination path.
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
  const { overwrite = false, ...transferOptions } = options ?? {}

  try {
    if (!overwrite) {
      const exists = await sftp.exists(targetPath)
      if (exists) return Outcome.makeFailure(`File already exists at ${targetPath}.`)
    }

    const pass = new PassThrough()

    // Start the upload first so it can read from `pass` as data arrives
    const uploadPromise = sftp.put(pass, targetPath, transferOptions)

    // Stream the source file into the PassThrough
    await sftp.get(sourcePath, pass, transferOptions)

    await uploadPromise
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
