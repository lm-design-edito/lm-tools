// ──────────────────────────────────────────────────────────────────────────────
// copy.ts — AWS SDK v3
// ──────────────────────────────────────────────────────────────────────────────

import {
  S3Client,
  CopyObjectCommand,
  CopyObjectCommandInput,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type CopyOptions = {
  /**
   * Additional parameters forwarded to the underlying `CopyObjectCommand`.
   * `Bucket`, `Key`, and `CopySource` are set by this utility.
   */
  copyOptions?: Omit<CopyObjectCommandInput, 'Bucket' | 'Key' | 'CopySource'>
  /**
   * If `false` (default) and `targetPath` already exists, the copy aborts
   * with an error.
   * @default false
   */
  overwrite?: boolean
}

/**
 * Copies an object from one key to another within the same S3 bucket.
 *
 * @param {S3Client} client            - The v3 S3 client instance.
 * @param {string}   bucketName        - The name of the S3 bucket.
 * @param {string}   sourcePath        - The key of the source object.
 * @param {string}   targetPath        - The key where the object will be copied.
 * @param {CopyOptions} [options]      - Optional copy configuration.
 * @param {Omit<CopyObjectCommandInput,'Bucket'|'Key'|'CopySource'>} [options.copyOptions] - Extra copy params.
 * @param {boolean} [options.overwrite=false] - Whether to overwrite an existing object.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copy (
  client: S3Client,
  bucketName: string,
  sourcePath: string,
  targetPath: string,
  options?: CopyOptions
): Promise<Outcome.Either<true, string>> {
  const {
    copyOptions,
    overwrite = false
  } = options ?? {}

  try {
    if (!overwrite) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: targetPath }))
        return Outcome.makeFailure(`Object already exists at ${targetPath}.`)
      } catch (err: any) {
        const notFound = err.$metadata?.httpStatusCode === 404 || err.name === 'NotFound'
        if (!notFound) throw err          // propagate unexpected errors
      }
    }

    await client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        Key: targetPath,
        CopySource: `${bucketName}/${sourcePath}`,
        ...copyOptions
      })
    )

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
