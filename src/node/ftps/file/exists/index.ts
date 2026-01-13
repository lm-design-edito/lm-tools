import { Client, FileType } from 'basic-ftp'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

/**
 * Checks if a *file* (not a directory) exists on a specified FTP server.
 *
 * `ftpClient.list(parentDir)` returns an array of `FileInfo` objects:
 *   • `type === FileType.File`          → regular file  
 *   • `type === FileType.Directory`     → directory  
 *   • `type === FileType.SymbolicLink`  → symlink  
 *
 * The function reports **true** only for `FileType.File` or
 * `FileType.SymbolicLink`, mirroring the SFTP behaviour where `'-'` and `'l'`
 * are considered files.
 *
 * @param {Client} ftpClient  - The basic‑ftp client instance.
 * @param {string} sourcePath - The full path to check on the FTP server.
 * @returns {Promise<Outcome.Either<boolean, string>>}
 * - Success: `Outcome.makeSuccess(true | false)` – true only if a file exists.
 * - Failure: `Outcome.makeFailure(errStr)` if an error occurs.
 */
export async function exists (
  ftpClient: Client,
  sourcePath: string
): Promise<Outcome.Either<boolean, string>> {
  try {
    // Split path into parent dir and base name
    const lastSlash = sourcePath.lastIndexOf('/')
    const parentDir = lastSlash === -1 ? '.' : sourcePath.slice(0, lastSlash) || '/'
    const baseName  = lastSlash === -1 ? sourcePath : sourcePath.slice(lastSlash + 1)

    const list = await ftpClient.list(parentDir)
    const entry = list.find(e => e.name === baseName)

    const isFile = entry
      ? entry.type === FileType.File || entry.type === FileType.SymbolicLink
      : false

    return Outcome.makeSuccess(isFile)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
