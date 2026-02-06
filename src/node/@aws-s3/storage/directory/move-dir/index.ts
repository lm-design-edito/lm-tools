import {
  type S3Client,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  CopyObjectCommand,
  type CopyObjectCommandInput,
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type MoveDirOptions = {
  /** Extra parameters forwarded to every `ListObjectsV2Command` call. */
  listObjectsOptions?: Omit<ListObjectsV2CommandInput, 'Bucket' | 'Prefix'>
  /** Extra parameters forwarded to every `CopyObjectCommand` (`Bucket`, `Key`, `CopySource` are supplied internally). */
  copyOptions?: Omit<CopyObjectCommandInput, 'Bucket' | 'Key' | 'CopySource'>
  /** Extra parameters forwarded to every `DeleteObjectCommand` (`Bucket`, `Key` are supplied internally). */
  deleteOptions?: Omit<DeleteObjectCommandInput, 'Bucket' | 'Key'>
  /**
   * If **false** (default) and *any* destination key already exists, the move
   * operation aborts with an error.
   * @default false
   */
  overwrite?: boolean
}

/**
 * Recursively moves every object under `sourceDir` to the corresponding path
 * under `targetDir` within the same S3 bucket (AWS SDK v3).
 *
 * Behaviour when `overwrite` is **false** (default): abort if *any* destination
 * key already exists.
 *
 * @param {S3Client} client      - The v3 S3 client instance.
 * @param {string}   bucketName  - The name of the S3 bucket.
 * @param {string}   sourceDir   - The source directory prefix to move from.
 * @param {string}   targetDir   - The target directory prefix to move to.
 * @param {MoveDirOptions} [options] - Optional configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success: `Outcome.makeSuccess(true)`.
 * - On failure: `Outcome.makeFailure(errStr)`.
 */
export async function moveDir (
  client: S3Client,
  bucketName: string,
  sourceDir: string,
  targetDir: string,
  options?: MoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const {
    listObjectsOptions,
    copyOptions,
    deleteOptions,
    overwrite = false
  } = options ?? {}

  const from = sourceDir.endsWith('/') ? sourceDir : `${sourceDir}/`
  const to = targetDir.endsWith('/') ? targetDir : `${targetDir}/`

  try {
    let token: string | undefined
    do {
      const listResp = await client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: from,
          ContinuationToken: token,
          ...listObjectsOptions
        })
      )

      for (const obj of listResp.Contents ?? []) {
        if (obj.Key === undefined) continue
        const rel = obj.Key.substring(from.length)
        const dest = `${to}${rel}`

        if (!overwrite) {
          try {
            await client.send(
              new HeadObjectCommand({ Bucket: bucketName, Key: dest })
            )
            throw new Error(`Object already exists at ${dest}.`)
          } catch (err: any) {
            if (err.$metadata?.httpStatusCode !== 404 && err.name !== 'NotFound')
              throw err
          }
        }

        await client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            Key: dest,
            CopySource: `${bucketName}/${obj.Key}`,
            ...copyOptions
          })
        )

        await client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: obj.Key,
            ...deleteOptions
          })
        )
      }

      token = listResp.IsTruncated === true
        ? listResp.NextContinuationToken
        : undefined
    } while (token !== undefined)

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
