import Client from 'ssh2-sftp-client'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

export type MoveOptions = {
  /**
   * When `true`, ensures that the parent directory of `targetPath` exists
   * before attempting the rename (`mkdir` with the recursive flag).
   * @default true
   */
  ensureDir?: boolean
  /**
   * When `false` (default) and `targetPath` already exists, the move is aborted
   * and a failure is returned.
   * @default false
   */
  overwrite?: boolean
}

/**
 * Moves (renames) a file on an SFTP server.
 *
 * The function uses `rename`, which atomically moves the file from
 * `sourcePath` to `targetPath`.  It supports two safety features:
 *
 * 1. **ensureDir** – If enabled, the parent directory of `targetPath`
 *    is created with `mkdir -p` semantics before the rename.
 * 2. **overwrite** – If disabled (default) the function first checks whether
 *    something already exists at `targetPath`; if so, it aborts.
 *
 * @param {Client} sftp          - The ssh2‑sftp‑client instance.
 * @param {string} sourcePath    - The full path of the source file.
 * @param {string} targetPath    - The full destination path.
 * @param {MoveOptions} [options] - Optional move configuration.
 * @param {boolean} [options.ensureDir=true]  - Whether to create missing parent directories.
 * @param {boolean} [options.overwrite=false] - Whether to overwrite an existing destination.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function move (
  sftp: Client,
  sourcePath: string,
  targetPath: string,
  options?: MoveOptions
): Promise<Outcome.Either<true, string>> {
  const {
    ensureDir = true,
    overwrite = false
  } = options ?? {}

  try {
    if (ensureDir) {
      const dirPath = targetPath.substring(0, targetPath.lastIndexOf('/'))
      if (dirPath) await sftp.mkdir(dirPath, true)   // mkdir -p
    }

    if (!overwrite) {
      const exists = await sftp.exists(targetPath)   // 'd' | '-' | 'l' | false
      if (exists) {
        return Outcome.makeFailure(`File already exists at ${targetPath}.`)
      }
    }

    await sftp.rename(sourcePath, targetPath)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
