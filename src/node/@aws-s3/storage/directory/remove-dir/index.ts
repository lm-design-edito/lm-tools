import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type RemoveDirOptions = {
  /** Extra parameters forwarded to each `ListObjectsV2Command` call. */
  listObjectsOptions?:   Omit<ListObjectsV2CommandInput, 'Bucket' | 'Prefix'>
  /** Extra parameters forwarded to each `DeleteObjectsCommand` call. */
  deleteObjectsOptions?: Omit<DeleteObjectsCommandInput, 'Bucket' | 'Delete'>
  /**
   * If **true** (default) the function ignores the case where the prefix is
   * already empty / does not exist and simply resolves with success.  
   * If **false** and nothing is found, the function returns a failure.
   * @default true
   */
  ignoreMissing?: boolean
}

/**
 * Recursively deletes all objects under a directory prefix in an S3 bucket
 * using the AWS SDK v3 client. Handles pagination and the 1 000‑key limit of
 * `DeleteObjects`.
 *
 * @param {S3Client}  client           - The v3 S3 client instance.
 * @param {string}    bucketName       - The name of the S3 bucket.
 * @param {string}    directoryPath    - The “directory” prefix to delete.
 * @param {RemoveDirOptions} [options] - Optional listing/deletion configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success: `Outcome.makeSuccess(true)` – deletion succeeded, or prefix
 *   absent and `ignoreMissing` is true.  
 * - On failure: `Outcome.makeFailure(errStr)` if deletion fails, or prefix
 *   absent and `ignoreMissing` is false.
 */
export async function removeDir (
  client: S3Client,
  bucketName: string,
  directoryPath: string,
  options?: RemoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const {
    listObjectsOptions,
    deleteObjectsOptions,
    ignoreMissing = true
  } = options ?? {}

  const prefix = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`
  let continuationToken: string | undefined
  let anyFound = false

  try {
    do {
      const listResp = await client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          ...listObjectsOptions
        })
      )

      const keys = (listResp.Contents ?? []).map(o => o.Key!).filter(Boolean)
      if (keys.length) {
        anyFound = true

        // Delete in batches of ≤ 1 000 keys
        for (let i = 0; i < keys.length; i += 1000) {
          const chunk = keys.slice(i, i + 1000)
          await client.send(
            new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: { Objects: chunk.map(Key => ({ Key })) },
              ...deleteObjectsOptions
            })
          )
        }
      }

      continuationToken = listResp.IsTruncated ? listResp.NextContinuationToken : undefined
    } while (continuationToken)

    if (!anyFound && !ignoreMissing) {
      return Outcome.makeFailure(`No objects found for prefix "${prefix}".`)
    }

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
