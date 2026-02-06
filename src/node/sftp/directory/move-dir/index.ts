import type Client from 'ssh2-sftp-client'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

export type MoveDirOptions = {
  /** If false and `targetDir` exists, the operation is aborted. Defaults to false. */
  overwrite?: boolean
  /** If true, ensures the parent directory of `targetDir` exists before moving. Defaults to true. */
  ensureDir?: boolean
}

/**
 * Renames (moves) a directory on an SFTP server using `rename`, which moves
 * the entire tree in one operation when supported by the server.
 *
 * If `ensureDir` is true (default), the parent directory of `targetDir` is
 * created if it does not exist.
 *
 * @param {Client} sftp - The SFTP client instance.
 * @param {string} sourceDir - The source directory path to move from.
 * @param {string} targetDir - The target directory path to move to.
 * @param {MoveDirOptions} [options] - Optional parameters for the operation.
 * @param {boolean} [options.overwrite=false] - If false and `targetDir` exists, abort.
 * @param {boolean} [options.ensureDir=true] - Whether to create the parent directory of `targetDir`.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the move was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the move fails.
 */
export async function moveDir (
  sftp: Client,
  sourceDir: string,
  targetDir: string,
  options?: MoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { overwrite = false, ensureDir = true } = options ?? {}

  try {
    if (ensureDir) {
      const parentDir = targetDir.substring(0, targetDir.lastIndexOf('/'))
      await sftp.mkdir(parentDir, true)
    }

    if (!overwrite) {
      const exists = await sftp.exists(targetDir)
      if (exists !== false) return Outcome.makeFailure(`Target ${targetDir} already exists.`)
    }

    await sftp.rename(sourceDir, targetDir)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
