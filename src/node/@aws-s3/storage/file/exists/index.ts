import {
  S3Client,
  HeadObjectCommand,
  HeadObjectCommandInput
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type ExistsOptions = {
  /**
   * Additional parameters forwarded to the underlying `HeadObjectCommand`.
   * `Bucket` and `Key` are supplied by this utility.
   */
  headObjectOptions?: Omit<HeadObjectCommandInput, 'Bucket' | 'Key'>
}

/**
 * Checks whether an object exists in a specified S3 bucket (AWS SDK v3).
 *
 * @param {S3Client} client          - The v3 S3 client instance.
 * @param {string}   bucketName      - The name of the S3 bucket.
 * @param {string}   sourcePath      - The key of the object to test.
 * @param {ExistsOptions} [options]  - Optional configuration.
 * @param {Omit<HeadObjectCommandInput,'Bucket'|'Key'>} [options.headObjectOptions] - Extra `HeadObject` params.
 * @returns {Promise<Outcome.Either<boolean, string>>}
 * - Success: `Outcome.makeSuccess(true)` if the object exists,
 *            `Outcome.makeSuccess(false)` if it does not.
 * - Failure: `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function exists (
  client: S3Client,
  bucketName: string,
  sourcePath: string,
  options?: ExistsOptions
): Promise<Outcome.Either<boolean, string>> {
  const { headObjectOptions } = options ?? {}

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: sourcePath,
        ...headObjectOptions
      })
    )
    return Outcome.makeSuccess(true)
  } catch (err: any) {
    const notFound =
      err.$metadata?.httpStatusCode === 404 ||
      err.name === 'NotFound' ||
      err.Code === 'NotFound' ||           // some SDKs emit Code
      err.Code === 'NoSuchKey'

    if (notFound) {
      return Outcome.makeSuccess(false)
    }

    return Outcome.makeFailure(unknownToString(err))
  }
}
