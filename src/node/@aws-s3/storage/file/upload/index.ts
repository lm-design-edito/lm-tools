import { Readable } from 'node:stream'
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommandInput
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type UploadOptions = {
  fileMetadata?: Partial<PutObjectCommandInput>
  uploadSettings?: ConstructorParameters<typeof Upload>[0] // UploadOptions from lib-storage
  overwrite?: boolean /* defaults to false */
}

/**
 * Uploads a file stream to a specified Amazon S3 bucket using AWS SDK v3.
 *
 * If `overwrite` is false and the target file exists, upload is aborted.
 *
 * @param {S3Client} s3 - The AWS S3 v3 client instance.
 * @param {string} bucketName - The S3 bucket name.
 * @param {string} targetPath - The key to upload the file to.
 * @param {Readable} fileStream - The file content as a stream.
 * @param {UploadOptions} [options] - Optional configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 */
export async function upload(
  s3: S3Client,
  bucketName: string,
  targetPath: string,
  fileStream: Readable,
  options?: UploadOptions
): Promise<Outcome.Either<true, string>> {
  const {
    uploadSettings,
    fileMetadata,
    overwrite = false
  } = options ?? {}

  if (!overwrite) {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: targetPath
      })
      await s3.send(headCommand)
      // If no error, object exists
      return Outcome.makeFailure(`File already exists at ${targetPath}.`)
    } catch (err: any) {
      const code = err?.name ?? err?.$metadata?.httpStatusCode
      if (code !== 'NotFound' && code !== 404) {
        return Outcome.makeFailure(unknownToString(err))
      }
      // Object not found, proceed with upload
    }
  }

  const params: PutObjectCommandInput = {
    ...fileMetadata,
    Bucket: bucketName,
    Key: targetPath,
    Body: fileStream
  }

  try {
    const upload = new Upload({
      client: s3,
      params,
      ...uploadSettings
    })

    await upload.done()
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
