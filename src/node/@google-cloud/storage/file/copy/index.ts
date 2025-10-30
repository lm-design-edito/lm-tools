import { Bucket, FileOptions, CopyOptions as GCSFileCopyOptions } from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'

export type CopyOptions = {
  /** Additional options for constructing the `File` handles. */
  fileOptions?: FileOptions
  /** Additional parameters forwarded to the underlying `copy` call. */
  copyOptions?: GCSFileCopyOptions
  /**
   * If `false` (default) and `targetPath` already exists, the copy aborts with
   * an error.
   * @default false
   */
  overwrite?: boolean
}

/**
 * Copies a file from one location to another within a Google Cloud Storage bucket.
 *
 * If `overwrite` is **false** (default) and the destination object already
 * exists, the operation aborts.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket containing the file.
 * @param {string} sourcePath - The path of the source object to copy.
 * @param {string} targetPath - The destination path for the copied object.
 * @param {CopyOptions} [options] - Optional copy configuration.
 * @param {FileOptions} [options.fileOptions] - Extra options for `bucket.file`.
 * @param {GCSFileCopyOptions} [options.copyOptions] - Extra options for `file.copy`.
 * @param {boolean} [options.overwrite=false] - Whether to overwrite an existing destination object.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copy (
  bucket: Bucket,
  sourcePath: string,
  targetPath: string,
  options?: CopyOptions
): Promise<Outcome.Either<true, string>> {
  const {
    fileOptions,
    copyOptions,
    overwrite = false
  } = options ?? {}

  try {
    const srcFile  = bucket.file(sourcePath, fileOptions)
    const destFile = bucket.file(targetPath, fileOptions)

    if (!overwrite) {
      const [destExists] = await destFile.exists()
      if (destExists) {
        return Outcome.makeFailure(`Object already exists at ${targetPath}.`)
      }
    }

    await srcFile.copy(destFile, copyOptions)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
