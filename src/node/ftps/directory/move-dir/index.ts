import { Client } from 'basic-ftp'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

export type MoveDirOptions = {
  /** If false and `targetDir` exists, the operation is aborted. Defaults to false. */
  overwrite?: boolean
  /** If true, ensures the parent directory of `targetDir` exists before moving. Defaults to true. */
  ensureDir?: boolean
}

/**
 * Renames (moves) a directory on an FTP server.  
 * Most FTP servers allow `RNFR /path/old` + `RNTO /path/new` to move a tree
 * atomically. Falling back to manual copy/delete would be expensive, so this
 * util simply performs `rename`.
 *
 * If `ensureDir` is true (default), the parent directory of `targetDir` is
 * created if it does not exist.
 *
 * @param {Client} ftpClient - The FTP client instance.
 * @param {string} sourceDir - The source directory path to move from.
 * @param {string} targetDir - The target directory path to move to.
 * @param {MoveDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the move was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the move fails.
 */
export async function moveDir (
  ftpClient: Client,
  sourceDir: string,
  targetDir: string,
  options?: MoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { overwrite = false, ensureDir = true } = options ?? {}

  try {
    if (ensureDir) {
      // ensure parent directory of targetDir exists
      const parentDir = targetDir.substring(0, targetDir.lastIndexOf('/'))
      if (parentDir) {
        await ftpClient.ensureDir(parentDir)
      }
    }

    if (!overwrite) {
      try {
        await ftpClient.size(targetDir) // will throw 550 for dirs or missing
        return Outcome.makeFailure(`Target ${targetDir} already exists.`)
      } catch { /* not found – ok */ }
    }

    await ftpClient.rename(sourceDir, targetDir)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
