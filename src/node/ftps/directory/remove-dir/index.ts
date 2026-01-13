import { Client } from 'basic-ftp'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

export type RemoveDirOptions = {
  /**
   * If **true** (default) the function ignores the case where `directoryPath`
   * does not exist and simply returns success.  
   * If **false** and the path is missing, the function returns a failure.
   * @default true
   */
  ignoreMissing?: boolean
}

/**
 * Recursively deletes a directory (and all contents) on an FTP server.
 *
 * @param {Client} ftpClient            - The FTP client instance.
 * @param {string} directoryPath        - The path of the directory to delete.
 * @param {RemoveDirOptions} [options]  - Optional configuration.
 * @param {boolean} [options.ignoreMissing=true] - Whether to ignore a missing directory.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success: `Outcome.makeSuccess(true)` – deletion succeeded, or directory
 *   was absent and `ignoreMissing` is true.  
 * - On failure: `Outcome.makeFailure(errStr)` if deletion fails, or directory
 *   absent and `ignoreMissing` is false.
 */
export async function removeDir (
  ftpClient: Client,
  directoryPath: string,
  options?: RemoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { ignoreMissing = true } = options ?? {}

  async function recurse (dir: string): Promise<void> {
    const list = await ftpClient.list(dir)
    for (const entry of list) {
      const full = dir.endsWith('/') ? dir + entry.name : `${dir}/${entry.name}`
      if (entry.isDirectory) {
        await recurse(full)
      } else if (entry.isFile) {
        await ftpClient.remove(full)
      }
    }
    await ftpClient.removeDir(dir)
  }

  try {
    await recurse(directoryPath)
    return Outcome.makeSuccess(true)
  } catch (err: any) {
    // 550 (“No such file or directory”) when the path is missing
    if (ignoreMissing && err.code === 550) {
      return Outcome.makeSuccess(true)
    }
    return Outcome.makeFailure(unknownToString(err))
  }
}
