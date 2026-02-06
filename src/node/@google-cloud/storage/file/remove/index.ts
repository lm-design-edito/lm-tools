import { type Bucket, type FileOptions, type DeleteFileOptions as GCSDeleteFileOptions } from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'

export type RemoveOptions = {
  fileOptions?: FileOptions
  deleteOptions?: GCSDeleteFileOptions
  ignoreMissing?: boolean /* defaults to true */
}

/**
 * Removes a file from a specified Google Cloud Storage bucket.
 *
 * This function deletes the object located at `targetPath` in the given bucket.
 * The operation can be customized using optional `fileOptions` (to reference the object)
 * and `deleteOptions` (to influence GCS deletion behaviour).
 * If the `ignoreMissing` option is **true**, the function treats a missing object as a
 * successful outcome instead of returning an error.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket instance.
 * @param {string} targetPath - The path of the file to remove in the bucket.
 * @param {RemoveOptions} [options] - Optional settings for configuring the removal process.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an Outcome.Either.
 * - On success: `Outcome.makeSuccess(true)` indicating the removal was successful.
 * - On failure:  `Outcome.makeFailure(errStr)` with an error message if the removal fails.
 */
export async function remove (
  bucket: Bucket,
  targetPath: string,
  options?: RemoveOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, deleteOptions, ignoreMissing = true } = options ?? {}
  try {
    const file = bucket.file(targetPath, fileOptions)
    const [exists] = await file.exists()
    if (!exists) {
      if (ignoreMissing) return Outcome.makeSuccess(true)
      return Outcome.makeFailure(`File not found at ${targetPath}.`)
    }
    await file.delete(deleteOptions)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
