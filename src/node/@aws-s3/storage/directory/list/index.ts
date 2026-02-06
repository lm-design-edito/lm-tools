import {
  type S3Client,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

/** Extra parameters forwarded to each `ListObjectsV2Command`. */
export type ListOptions = Omit<ListObjectsV2CommandInput, 'Bucket' | 'Prefix' | 'Delimiter'>

/**
 * Lists all direct‑child object keys under a given directory prefix in an S3
 * bucket (AWS SDK v3). The listing is **non‑recursive**.
 *
 * @param {S3Client} client         - The v3 S3 client used to list objects.
 * @param {string}   bucketName     - The name of the S3 bucket.
 * @param {string}   directoryPath  - The directory prefix to list.
 * @param {ListOptions} [options]   - Additional parameters for `ListObjectsV2`.
 * @returns {Promise<Outcome.Either<string[], string>>}
 * - Success: `Outcome.makeSuccess(keys)` where `keys` is an array of object keys.
 * - Failure: `Outcome.makeFailure(errStr)` if the list operation fails.
 */
export async function list (
  client: S3Client,
  bucketName: string,
  directoryPath: string,
  options?: ListOptions
): Promise<Outcome.Either<string[], string>> {
  const prefix = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`

  try {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        Delimiter: '/',
        ...options
      })
    )

    const keys = (response.Contents ?? [])
      .map(obj => obj.Key)
      .filter((e): e is string => e !== undefined)

    return Outcome.makeSuccess(keys)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
