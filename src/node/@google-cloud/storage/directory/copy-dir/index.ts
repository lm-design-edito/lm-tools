import {
  type Bucket,
  type GetFileOptions,
  type CopyOptions as GCSCopyOptions
} from '@google-cloud/storage'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type CopyDirOptions = {
  getFileOptions?: GetFileOptions
  copyOptions?: GCSCopyOptions

  /**
   * If false (default), existing target files will be skipped (not overwritten).
   */
  overwrite?: boolean
}

/** Recursively copies every object under `sourceDir` to the same relative path
 *  beneath `targetDir` within a single GCS bucket.
 * @param {Bucket} bucket - The GCS bucket instance.
 * @param {string} sourceDir - The source directory path (prefix) to copy from.
 * @param {string} targetDir - The target directory path (prefix) to copy to.
 * @param {CopyDirOptions} [options] - Optional parameters for the operation.
 * @param {boolean} [options.overwrite=false] - Whether to overwrite existing files at target.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the copy was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the copy fails.
 * */
export async function copyDir (
  bucket: Bucket,
  sourceDir: string,
  targetDir: string,
  options?: CopyDirOptions
): Promise<Outcome.Either<true, string>> {
  const { getFileOptions, copyOptions, overwrite = false } = options ?? {}
  const from = sourceDir.endsWith('/') ? sourceDir : `${sourceDir}/`
  const to = targetDir.endsWith('/') ? targetDir : `${targetDir}/`

  try {
    const [files] = await bucket.getFiles({ ...getFileOptions, prefix: from })
    for (const f of files) {
      const rel = f.name.substring(from.length)
      const dest = `${to}${rel}`

      if (!overwrite) {
        const destFile = bucket.file(dest)
        const [exists] = await destFile.exists()
        if (exists) {
          // Skip copy if target exists and overwrite is false
          continue
        }
      }

      await f.copy(dest, copyOptions)
    }
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
