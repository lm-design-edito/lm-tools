import {
  Bucket,
  BucketMetadata,
  GetBucketMetadataOptions as GCSGetBucketMetadataOptions
} from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'

export type GetBucketMetadataOptions = GCSGetBucketMetadataOptions

/**
 * Retrieves metadata for a Google Cloud Storage bucket.
 *
 * This function calls the Google Cloud Storage API to get information about the bucket,
 * such as its location, storage class, and other configuration details.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket object.
 * @param {GetBucketMetadataOptions} [options] - Optional configuration options to pass to the `getMetadata` method.
 * @returns {Promise<Outcome.Either<BucketMetadata, string>>} A promise that resolves to an `Outcome.Either`. 
 * - On success: `Outcome.makeSuccess(metadata)` with the bucket metadata.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message.
 *
 * @throws {Error} Throws an error if the metadata retrieval fails (e.g., network issues, incorrect permissions).
 */
export async function getMetadata (
  bucket: Bucket,
  options?: GetBucketMetadataOptions
): Promise<Outcome.Either<BucketMetadata, string>> {
  try {
    const [metadata] = await bucket.getMetadata(options)
    return Outcome.makeSuccess(metadata)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
