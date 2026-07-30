import {
  type S3Client,
  HeadObjectCommand,
  type HeadObjectCommandInput
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import { deepGetProperty } from '../../../../../agnostic/objects/deep-get-property/index.js';

export type ExistsOptions = {
  /**
   * Additional parameters forwarded to the underlying `HeadObjectCommand`.
   * `Bucket` and `Key` are supplied by this utility.
   */
  headObjectOptions?: Omit<HeadObjectCommandInput, 'Bucket' | 'Key'>
}

/**
 * Checks whether an object exists in a specified S3 bucket (AWS SDK v3).
 *
 * @param client          - The v3 S3 client instance.
 * @param   bucketName      - The name of the S3 bucket.
 * @param   sourcePath      - The key of the object to test.
 * @param [options]  - Optional configuration.
 * @param [options.headObjectOptions] - Extra `HeadObject` params.
 * @returns
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
    await client.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: sourcePath,
      ...headObjectOptions
    }))
    return Outcome.makeSuccess(true)
  } catch (err: unknown) {
    const name = deepGetProperty(err, 'name')
    const Code = deepGetProperty(err, 'Code')
    const httpStatusCode = deepGetProperty(err, '$metadata.httpStatusCode')
    const notFound = httpStatusCode === 404
      || name === 'NotFound'
      || Code === 'NotFound' // some SDKs emit Code
      || Code === 'NoSuchKey'
    if (notFound) return Outcome.makeSuccess(false)
    return Outcome.makeFailure(unknownToString(err))
  }
}
