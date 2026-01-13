import { Bucket, FileOptions, FileExistsOptions as GCSFileExistsOptions } from '@google-cloud/storage'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type ExistsOptions = {
  fileOptions?: FileOptions
  existsOptions?: GCSFileExistsOptions
}

/**
 * Checks if a file exists in the specified bucket.
 * 
 * This function verifies whether a file at the given `sourcePath` exists in the bucket. It can be configured with options to customize the behavior of the check.
 * 
 * @param {Bucket} bucket - The GCS bucket to check for the file existence.
 * @param {string} sourcePath - The path of the file to check within the bucket.
 * @param {ExistsOptions} [options] - Optional configuration for the file existence check.
 * @param {FileOptions} [options.fileOptions] - Additional options for the file, such as custom metadata or ACL settings.
 * @param {ExistsOptions} [options.existsOptions] - Options for controlling the `exists` method (if any).
 * @returns {Promise<Outcome.Either<boolean, string>>} - Returns either a success with `true` or `false` indicating whether the file exists, or a failure with an error message.
 */
export async function exists (
  bucket: Bucket,
  sourcePath: string,
  options?: ExistsOptions 
): Promise<Outcome.Either<boolean, string>> {
  const { fileOptions, existsOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    const [exists] = await file.exists(existsOptions)
    return Outcome.makeSuccess(exists)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
