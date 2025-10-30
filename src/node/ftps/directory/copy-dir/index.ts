import { Client } from 'basic-ftp'
import { PassThrough } from 'node:stream'
import { Outcome } from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

export type CopyDirOptions = {
  /**
   * If `false` and a destination file already exists, copying aborts.
   * @default false
   */
  overwrite?: boolean
  /**
   * When `true`, creates any missing directories in the destination path
   * (`ftpClient.ensureDir`) before writing files.
   * @default true
   */
  ensureDir?: boolean
}

/**
 * Recursively copies every file under `sourceDir` to the same relative path
 * beneath `targetDir` on an FTP server, streaming data to avoid buffering.
 *
 * @param {Client}  ftpClient  - The FTP client instance.
 * @param {string}  sourceDir  - The source directory path to copy from.
 * @param {string}  targetDir  - The target directory path to copy to.
 * @param {CopyDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - Success: `Outcome.makeSuccess(true)` if the copy succeeds.
 * - Failure: `Outcome.makeFailure(errStr)` if an error occurs.
 */
export async function copyDir (
  ftpClient: Client,
  sourceDir: string,
  targetDir: string,
  options?: CopyDirOptions
): Promise<Outcome.Either<true, string>> {
  const {
    overwrite = false,
    ensureDir = true
  } = options ?? {}

  async function recurse (dir: string): Promise<void> {
    const list = await ftpClient.list(dir)

    for (const entry of list) {
      const src = dir.endsWith('/') ? dir + entry.name : dir + '/' + entry.name
      const rel = src.substring(sourceDir.length + (sourceDir.endsWith('/') ? 0 : 1))
      const dst = targetDir.endsWith('/') ? targetDir + rel : `${targetDir}/${rel}`

      if (entry.isDirectory) {
        if (ensureDir) await ftpClient.ensureDir(dst)
        await recurse(src)
      } else if (entry.isFile) {
        if (!overwrite) {
          try {
            await ftpClient.size(dst)
            throw new Error(`File already exists at ${dst}.`)
          } catch { /* 550 “not found” – safe to proceed */ }
        }

        // Make sure parent directory exists if ensureDir is enabled
        if (ensureDir) {
          const dirPath = dst.substring(0, dst.lastIndexOf('/'))
          if (dirPath) await ftpClient.ensureDir(dirPath)
        }

        const pass = new PassThrough()
        const upload = ftpClient.uploadFrom(pass, dst)
        await ftpClient.downloadTo(pass, src)
        await upload
      }
    }
  }

  try {
    if (ensureDir) await ftpClient.ensureDir(targetDir)
    await recurse(sourceDir)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
