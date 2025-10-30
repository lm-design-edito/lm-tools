import {
  S3Client,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommandInput,
  DeleteObjectCommandInput
} from '@aws-sdk/client-s3'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type MoveOptions = {
  /** Extra parameters forwarded to `CopyObjectCommand` (`Bucket`, `Key`, `CopySource` are filled internally). */
  copyOptions?:   Omit<CopyObjectCommandInput,  'Bucket' | 'Key' | 'CopySource'>
  /** Extra parameters forwarded to `DeleteObjectCommand` (`Bucket`, `Key` are filled internally). */
  deleteOptions?: Omit<DeleteObjectCommandInput,'Bucket' | 'Key'>
  /**
   * If **false** (default) and `targetPath` already exists, the move aborts
   * with an error.
   * @default false
   */
  overwrite?: boolean
}

/**
 * Moves an object from one key to another within the same S3 bucket (AWS SDK v3).
 *
 * The function copies the object from `sourcePath` to `targetPath` and, upon
 * successful copy, deletes the original object.
 *
 * @param {S3Client} client - The S3 client instance.
 * @param {string}   bucketName - The name of the bucket.
 * @param {string}   sourcePath - The source object's key.
 * @param {string}   targetPath - The destination object's key.
 * @param {MoveOptions} [options] - Optional copy/delete behaviour.
 * @param {Omit<CopyObjectCommandInput,'Bucket'|'Key'|'CopySource'>} [options.copyOptions]   - Extra copy params.
 * @param {Omit<DeleteObjectCommandInput,'Bucket'|'Key'>}            [options.deleteOptions] - Extra delete params.
 * @param {boolean} [options.overwrite=false] - Whether to overwrite an existing `targetPath`.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - Success: `Outcome.makeSuccess(true)`
 * - Failure: `Outcome.makeFailure(errStr)`
 */
export async function move (
  client: S3Client,
  bucketName: string,
  sourcePath: string,
  targetPath: string,
  options?: MoveOptions
): Promise<Outcome.Either<true, string>> {
  const {
    copyOptions,
    deleteOptions,
    overwrite = false
  } = options ?? {}

  try {
    // Abort early if destination exists and overwrite is disabled
    if (!overwrite) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: targetPath }))
        return Outcome.makeFailure(`Object already exists at ${targetPath}.`)
      } catch (err: any) {
        const notFound =
          err.$metadata?.httpStatusCode === 404 ||
          err.name === 'NotFound' ||
          err.Code === 'NotFound' ||
          err.Code === 'NoSuchKey'
        if (!notFound) {
          return Outcome.makeFailure(unknownToString(err))
        }
        // If not found, proceed with copy
      }
    }

    // Copy to the new key
    await client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        Key: targetPath,
        CopySource: `${bucketName}/${sourcePath}`,
        ...copyOptions
      })
    )

    // Delete the original key
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: sourcePath,
        ...deleteOptions
      })
    )

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
