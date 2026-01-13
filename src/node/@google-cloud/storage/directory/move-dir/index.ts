import {
  Bucket,
  FileOptions,
  CopyOptions as GCSCopyOptions,
  DeleteFileOptions as GCSDeleteOptions
} from '@google-cloud/storage'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type MoveDirOptions = {
  fileOptions?: FileOptions
  copyOptions?: GCSCopyOptions
  deleteOptions?: GCSDeleteOptions
  /**
   * If false and any destination file exists, the operation aborts with an error.
   * Defaults to false.
   */
  overwrite?: boolean
}

/**
 * Recursively moves every object under `sourceDir` to the corresponding path
 * under `targetDir` within the same bucket.
 *
 * Example: moving `a/b/` to `x/y/` copies
 * `a/b/file.txt` → `x/y/file.txt` and then deletes the original.
 *
 * If `overwrite` is false (default), the operation aborts if any destination file
 * already exists.
 *
 * @param {Bucket} bucket - The GCS bucket instance.
 * @param {string} sourceDir - The source directory prefix to move from.
 * @param {string} targetDir - The target directory prefix to move to.
 * @param {MoveDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success: `Outcome.makeSuccess(true)`.
 * - On failure: `Outcome.makeFailure(errStr)`.
 */
export async function moveDir (
  bucket: Bucket,
  sourceDir: string,
  targetDir: string,
  options?: MoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, copyOptions, deleteOptions, overwrite = false } = options ?? {}
  const from = sourceDir.endsWith('/') ? sourceDir : `${sourceDir}/`
  const to   = targetDir.endsWith('/')   ? targetDir   : `${targetDir}/`

  try {
    const [files] = await bucket.getFiles({ prefix: from })
    for (const f of files) {
      const rel  = f.name.substring(from.length)
      const dest = `${to}${rel}`
      const srcFile = bucket.file(f.name, fileOptions)
      const destFile = bucket.file(dest, fileOptions)

      if (!overwrite) {
        const [exists] = await destFile.exists()
        if (exists) throw new Error(`File already exists at ${dest}.`)
      }

      await srcFile.copy(dest, copyOptions)
      await srcFile.delete(deleteOptions)
    }
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
