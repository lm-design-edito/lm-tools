import Client from 'ssh2-sftp-client'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

/**
 * Checks if a *file* (not a directory) exists on a specified SFTP server.
 *
 * `sftp.exists(path)` resolves to:
 *   • `'d'` – the path exists and is a **directory**  
 *   • `'-'` – the path exists and is a **regular file**  
 *   • `'l'` – the path exists and is a **symlink**  
 *   • `false` – the path does **not** exist
 *
 * For the purpose of this util we treat a regular file (`'-'`) **or** a
 * symlink (`'l'`) as a “file”. A directory (`'d'`) returns `false`.
 *
 * @param {Client} sftp        - The ssh2‑sftp‑client instance.
 * @param {string} sourcePath  - The path to check.
 * @returns {Promise<Outcome.Either<boolean, string>>}
 * - Success: `Outcome.makeSuccess(true | false)` indicating file existence.
 * - Failure: `Outcome.makeFailure(errStr)` if an error occurs.
 */
export async function exists (
  sftp: Client,
  sourcePath: string
): Promise<Outcome.Either<boolean, string>> {
  try {
    const res = await sftp.exists(sourcePath)  // 'd' | '-' | 'l' | false
    const isFile = res === '-' || res === 'l'
    return Outcome.makeSuccess(isFile)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
