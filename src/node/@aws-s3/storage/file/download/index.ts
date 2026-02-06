import { type Readable } from 'node:stream'
import {
  type S3Client,
  GetObjectCommand,
  type GetObjectCommandInput
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

/**
 * Additional parameters forwarded to `GetObjectCommand`.
 * `Bucket` and `Key` are provided by this util.
 */
export type DownloadOptions = Omit<GetObjectCommandInput, 'Bucket' | 'Key'>

/**
 * Downloads a file from a specified Amazon S3 bucket.
 *
 * The function streams the object’s content back as a Node `Readable`.
 *
 * @param {S3Client} client       - The v3 S3 client instance.
 * @param {string}   bucketName   - The name of the S3 bucket.
 * @param {string}   sourcePath   - The key of the object to download.
 * @param {DownloadOptions} [options] - Extra parameters for the download.
 * @returns {Promise<Outcome.Either<Readable, string>>}
 * - On success:  `Outcome.makeSuccess(stream)` containing the file content.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function download (
  client: S3Client,
  bucketName: string,
  sourcePath: string,
  options?: DownloadOptions
): Promise<Outcome.Either<Readable, string>> {
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: sourcePath,
        ...options
      })
    )

    const stream = response.Body as Readable
    return Outcome.makeSuccess(stream)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
