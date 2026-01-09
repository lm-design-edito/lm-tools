import { Readable } from 'node:stream'
import { Bucket as GCSBucket } from '@google-cloud/storage'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'
import { Outcome } from '../../../../agnostic/misc/outcome/index.js'
import {
  AnyClient,
  isFtpClient,
  isGcsBucket,
  isS3ClientWithBucket,
  isSftpClient,
  S3ClientWithBucket
} from '../../clients/index.js'
import { DownloadOptions as FtpDownloadOptions, download as ftpDownload } from '../../../ftps/file/download/index.js'
import { DownloadOptions as SftpDownloadOptions, download as sftpDownload } from '../../../sftp/file/download/index.js'
import { DownloadOptions as S3DownloadOptions, download as s3Download } from '../../../@aws-s3/storage/file/download/index.js'
import { DownloadOptions as GcsDownloadOptions, download as gcsDownload } from '../../../@google-cloud/storage/file/download/index.js'

/** Return type for download file operations. */
type Returned = Outcome.Either<Readable, string>

/**
 * Downloads a file from a Google Cloud Storage bucket.
 *
 * The function streams the file's content back as a Node `Readable`.
 *
 * @param {GCSBucket} client              - The Google Cloud Storage bucket instance.
 * @param {string}   path                 - The path of the file to download.
 * @param {GcsDownloadOptions} [options] - Optional download configuration.
 * @returns {Promise<Outcome.Either<Readable, string>>}
 * - On success:  `Outcome.makeSuccess(stream)` containing the file content.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function downloadFile (client: GCSBucket, path: string, options?: GcsDownloadOptions): Promise<Returned>
/**
 * Downloads a file from an S3 bucket.
 *
 * The function streams the file's content back as a Node `Readable`.
 *
 * @param {S3ClientWithBucket} client     - The S3 client with bucket configuration.
 * @param {string}   path                 - The path of the file to download.
 * @param {S3DownloadOptions} [options]   - Optional download configuration.
 * @returns {Promise<Outcome.Either<Readable, string>>}
 * - On success:  `Outcome.makeSuccess(stream)` containing the file content.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function downloadFile (client: S3ClientWithBucket, path: string, options?: S3DownloadOptions): Promise<Returned>
/**
 * Downloads a file from an FTP server.
 *
 * The function streams the file's content back as a Node `Readable`.
 *
 * @param {FtpClient} client              - The FTP client instance.
 * @param {string}   path                 - The path of the file to download.
 * @param {FtpDownloadOptions} [options]  - Optional download configuration.
 * @returns {Promise<Outcome.Either<Readable, string>>}
 * - On success:  `Outcome.makeSuccess(stream)` containing the file content.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function downloadFile (client: FtpClient, path: string, options?: FtpDownloadOptions): Promise<Returned>
/**
 * Downloads a file from an SFTP server.
 *
 * The function streams the file's content back as a Node `Readable`.
 *
 * @param {SftpClient} client              - The SFTP client instance.
 * @param {string}   path                  - The path of the file to download.
 * @param {SftpDownloadOptions} [options] - Optional download configuration.
 * @returns {Promise<Outcome.Either<Readable, string>>}
 * - On success:  `Outcome.makeSuccess(stream)` containing the file content.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function downloadFile (client: SftpClient, path: string, options?: SftpDownloadOptions): Promise<Returned>
/**
 * Downloads a file from cloud storage.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP) and streams the file's
 * content back as a Node `Readable`.
 *
 * @param {AnyClient} client               - The cloud storage client instance.
 * @param {string}   path                  - The path of the file to download.
 * @param {GcsDownloadOptions | S3DownloadOptions | FtpDownloadOptions | SftpDownloadOptions} [options] - Optional download configuration.
 * @returns {Promise<Outcome.Either<Readable, string>>}
 * - On success:  `Outcome.makeSuccess(stream)` containing the file content.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function downloadFile (client: AnyClient, path: string, options?: GcsDownloadOptions | S3DownloadOptions | FtpDownloadOptions | SftpDownloadOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsDownload(client, path, options as GcsDownloadOptions)
  if (isS3ClientWithBucket(client)) return s3Download(client.client, client.bucketName, path, options as S3DownloadOptions)
  if (isFtpClient(client)) return ftpDownload(client, path, options as FtpDownloadOptions)
  if (isSftpClient(client)) return sftpDownload(client, path, options as SftpDownloadOptions)
  return Outcome.makeFailure('Invalid client type')
}
