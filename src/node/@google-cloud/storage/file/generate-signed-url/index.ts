import { Bucket, FileOptions, GetSignedUrlConfig } from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'

export type GenerateSignedUrlOptions = {
  fileOptions?: FileOptions
  getSignedUrlOptions?: Omit<GetSignedUrlConfig, 'action' | 'expires'>
}

/**
 * Generates a signed URL that provides temporary access to a file in Google Cloud Storage.
 *
 * This function generates a signed URL for the file located at `sourcePath` in the given bucket. The signed URL 
 * allows users to perform an action on the file (e.g., `read`, `write`) for a limited time as defined by the `expiresOn` parameter.
 * The behavior can be customized using optional `fileOptions` and `getSignedUrlOptions`.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket object containing the file.
 * @param {string} sourcePath - The path of the file for which the signed URL is being generated.
 * @param {GetSignedUrlConfig['action']} action - The action allowed by the signed URL (e.g., 'read', 'write', 'delete').
 * @param {GetSignedUrlConfig['expires']} expiresOn - The expiration time of the signed URL, after which it is no longer valid.
 * @param {GenerateSignedUrlOptions} [options] - Optional configuration options for generating the signed URL.
 * @returns {Promise<Outcome.Either<string, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(url)` containing the generated signed URL.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the signed URL generation fails.
 */
export async function generateSignedUrl (
  bucket: Bucket,
  sourcePath: string,
  action: GetSignedUrlConfig['action'],
  expiresOn: GetSignedUrlConfig['expires'],
  options?: GenerateSignedUrlOptions
): Promise<Outcome.Either<string, string>> {
  const { fileOptions, getSignedUrlOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    const [url] = await file.getSignedUrl({
      action,
      expires: expiresOn,
      ...getSignedUrlOptions
    })
    return Outcome.makeSuccess(url);
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
