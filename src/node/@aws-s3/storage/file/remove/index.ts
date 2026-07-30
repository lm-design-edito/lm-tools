import {
  type S3Client,
  HeadObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import { deepGetProperty } from '../../../../../agnostic/objects/deep-get-property/index.js';

export type RemoveOptions = {
  ignoreMissing?: boolean // defaults to true
}

/**
 * Removes a file from a specified Amazon S3 bucket (AWS SDK v3).
 *
 * If `ignoreMissing` is true (default), a missing object is considered success.
 *
 * @param s3 - The AWS S3 client instance.
 * @param bucketName - The name of the bucket.
 * @param targetPath - The key of the object to delete.
 * @param [options] - Optional settings.
 * @returns
 */
export async function remove (
  s3: S3Client,
  bucketName: string,
  targetPath: string,
  options?: RemoveOptions
): Promise<Outcome.Either<true, string>> {
  const { ignoreMissing = true } = options ?? {}

  try {
    // Check if object exists, respecting ignoreMissing
    try {
      await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: targetPath }))
    } catch (err: unknown) {
      const name = deepGetProperty(err, 'name')
      const Code = deepGetProperty(err, 'Code')
      const _code = deepGetProperty(err, 'code')
      const code = name ?? Code ?? _code
      if (code === 'NotFound'
        || code === 'NoSuchKey'
        || code === 'NotFoundException') return ignoreMissing
        ? Outcome.makeSuccess(true)
        : Outcome.makeFailure(`File not found at ${targetPath}.`)
      return Outcome.makeFailure(unknownToString(err))
    }

    // Delete the object
    await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: targetPath }))
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
