import {
  type S3Client,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  CopyObjectCommand,
  type CopyObjectCommandInput,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type CopyDirOptions = {
  /** Extra parameters forwarded to each `ListObjectsV2Command`. `Bucket` and `Prefix` are supplied by this utility. */
  listObjectsOptions?: Omit<ListObjectsV2CommandInput, 'Bucket' | 'Prefix'>

  /** Extra parameters forwarded to each `CopyObjectCommand`. `Bucket`, `Key` and `CopySource` are supplied by this utility. */
  copyOptions?: Omit<CopyObjectCommandInput, 'Bucket' | 'Key' | 'CopySource'>

  /** If false (default), existing target files will be skipped (not overwritten). */
  overwrite?: boolean
}

/**
 * Recursively copies every object under `sourceDir` to the same relative path
 * beneath `targetDir` in a single S3 bucket (AWS SDK v3).
 *
 * @param {S3Client} client - The v3 S3 client instance.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} sourceDir - The source directory prefix to copy from.
 * @param {string} targetDir - The target directory prefix to copy to.
 * @param {CopyDirOptions} [options] - Optional copy‑behaviour configuration.
 * @param {Omit<ListObjectsV2CommandInput,'Bucket'|'Prefix'>} [options.listObjectsOptions] - Extra list parameters.
 * @param {Omit<CopyObjectCommandInput,'Bucket'|'Key'|'CopySource'>} [options.copyOptions] - Extra copy parameters.
 * @param {boolean} [options.overwrite=false] - Whether to overwrite existing files at target.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - Success: `Outcome.makeSuccess(true)` if every object is copied.
 * - Failure: `Outcome.makeFailure(errStr)` on error.
 */
export async function copyDir (
  client: S3Client,
  bucketName: string,
  sourceDir: string,
  targetDir: string,
  options?: CopyDirOptions
): Promise<Outcome.Either<true, string>> {
  const { listObjectsOptions, copyOptions, overwrite = false } = options ?? {}
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
            await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: dest }))
            // If headObject succeeds, file exists - skip copy
            continue
          } catch (err: any) {
            const code = err?.name ?? err?.$metadata?.httpStatusCode
            if (code !== 'NotFound' && code !== 404) {
              return Outcome.makeFailure(unknownToString(err))
            }
            // Not found, proceed with copy
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
