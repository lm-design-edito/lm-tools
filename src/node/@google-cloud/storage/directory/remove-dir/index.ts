import { Bucket, DeleteFileOptions as GCSDeleteFileOptions } from '@google-cloud/storage'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type RemoveDirOptions = {
  /** Extra parameters forwarded to `bucket.deleteFiles`. */
  deleteOptions?: GCSDeleteFileOptions & { force?: boolean }
  /**
   * If **true** (default) the function ignores the case where the prefix is
   * already empty / does not exist and simply returns success.  
   * If **false** and no objects are found, the function returns a failure.
   * @default true
   */
  ignoreMissing?: boolean
}

/**
 * Recursively deletes all objects under a directory prefix in a GCS bucket
 * (including the directory placeholder itself, if present).
 *
 * @param {Bucket} bucket - The GCS bucket instance.
 * @param {string} directoryPath - The “directory” prefix to delete.
 * @param {RemoveDirOptions} [options] - Optional configuration.
 * @param {GCSDeleteFileOptions & {force?: boolean}} [options.deleteOptions] - Extra delete parameters.
 * @param {boolean} [options.ignoreMissing=true] - Whether to ignore an empty/missing prefix.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success: `Outcome.makeSuccess(true)` if deletion succeeds
 *   (or prefix absent and `ignoreMissing` is true).
 * - On failure: `Outcome.makeFailure(errStr)` if deletion fails
 *   or prefix absent and `ignoreMissing` is false.
 */
export async function removeDir (
  bucket: Bucket,
  directoryPath: string,
  options?: RemoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const {
    deleteOptions,
    ignoreMissing = true
  } = options ?? {}

  const prefix = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`

  try {
    // First check if anything exists when ignoreMissing is disabled.
    if (!ignoreMissing) {
      const [some] = await bucket.getFiles({ prefix, maxResults: 1 })
      if (some.length === 0) {
        return Outcome.makeFailure(`No objects found for prefix "${prefix}".`)
      }
    }

    // deleteFiles removes all matching objects in a single call.
    await bucket.deleteFiles({ prefix, ...deleteOptions })
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
