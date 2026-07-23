/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- options is narrowed based on a runtime check of the separate `client` param; TS can't connect the two at compile time */
import { type Readable } from 'node:stream'
import { type Bucket as GCSBucket } from '@google-cloud/storage'
import { type Client as FtpClient } from 'basic-ftp'
import type SftpClient from 'ssh2-sftp-client'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import {
  type AnyClient,
  isFtpClient,
  isGcsBucket,
  isS3ClientWithBucket,
  isSftpClient,
  type S3ClientWithBucket
} from '../../clients/index.js'
import { type UploadOptions as FtpUploadOptions, upload as ftpUpload } from '../../../ftps/file/upload/index.js'
import { type UploadOptions as SftpUploadOptions, upload as sftpUpload } from '../../../sftp/file/upload/index.js'
import { type UploadOptions as S3UploadOptions, upload as s3Upload } from '../../../@aws-s3/storage/file/upload/index.js'
import { type UploadOptions as GcsUploadOptions, upload as gcsUpload } from '../../../@google-cloud/storage/file/upload/index.js'

/** Return type for upload file operations. */
type Returned = Outcome.Either<true, string>

/**
 * Uploads a file stream to a Google Cloud Storage bucket.
 *
 * @param fileStream           - The file content as a stream.
 * @param   path                 - The path to upload the file to.
 * @param client              - The Google Cloud Storage bucket instance.
 * @param [options]     - Optional upload configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function uploadFile (fileStream: Readable, path: string, client: GCSBucket, options?: GcsUploadOptions): Promise<Returned>
/**
 * Uploads a file stream to an S3 bucket.
 *
 * @param fileStream           - The file content as a stream.
 * @param   path                 - The path to upload the file to.
 * @param client     - The S3 client with bucket configuration.
 * @param [options]      - Optional upload configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function uploadFile (fileStream: Readable, path: string, client: S3ClientWithBucket, options?: S3UploadOptions): Promise<Returned>
/**
 * Uploads a file stream to an FTP server.
 *
 * @param fileStream           - The file content as a stream.
 * @param   path                 - The path to upload the file to.
 * @param client              - The FTP client instance.
 * @param [options]     - Optional upload configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function uploadFile (fileStream: Readable, path: string, client: FtpClient, options?: FtpUploadOptions): Promise<Returned>
/**
 * Uploads a file stream to an SFTP server.
 *
 * @param fileStream           - The file content as a stream.
 * @param   path                 - The path to upload the file to.
 * @param client             - The SFTP client instance.
 * @param [options]   - Optional upload configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function uploadFile (fileStream: Readable, path: string, client: SftpClient, options?: SftpUploadOptions): Promise<Returned>
/**
 * Uploads a file stream to cloud storage.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param fileStream           - The file content as a stream.
 * @param   path                 - The path to upload the file to.
 * @param client              - The cloud storage client instance.
 * @param [options] - Optional upload configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function uploadFile (fileStream: Readable, path: string, client: AnyClient, options?: GcsUploadOptions | S3UploadOptions | FtpUploadOptions | SftpUploadOptions): Promise<Returned> {
  if (isGcsBucket(client)) return await gcsUpload(client, path, fileStream, options as GcsUploadOptions)
  if (isS3ClientWithBucket(client)) return await s3Upload(client.client, client.bucketName, path, fileStream, options as S3UploadOptions)
  if (isFtpClient(client)) return await ftpUpload(client, path, fileStream, options as FtpUploadOptions)
  if (isSftpClient(client)) return await sftpUpload(client, path, fileStream, options as SftpUploadOptions)
  return Outcome.makeFailure('Invalid client type')
}
