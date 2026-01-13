import { Bucket as GCSBucket } from '@google-cloud/storage'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import {
  AnyClient,
  isFtpClient,
  isGcsBucket,
  isS3ClientWithBucket,
  isSftpClient,
  S3ClientWithBucket
} from '../../clients/index.js'
import { RemoveOptions as FtpRemoveOptions, remove as ftpRemove } from '../../../ftps/file/remove/index.js'
import { RemoveOptions as SftpRemoveOptions, remove as sftpRemove } from '../../../sftp/file/remove/index.js'
import { RemoveOptions as S3RemoveOptions, remove as s3Remove } from '../../../@aws-s3/storage/file/remove/index.js'
import { RemoveOptions as GcsRemoveOptions, remove as gcsRemove } from '../../../@google-cloud/storage/file/remove/index.js'

/** Return type for remove file operations. */
type Returned = Outcome.Either<true, string>

/**
 * Removes a file from a Google Cloud Storage bucket.
 *
 * @param {GCSBucket} client               - The Google Cloud Storage bucket instance.
 * @param {string}   path                 - The file path to remove.
 * @param {GcsRemoveOptions} [options]     - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: GCSBucket, path: string, options?: GcsRemoveOptions): Promise<Returned>
/**
 * Removes a file from an S3 bucket.
 *
 * @param {S3ClientWithBucket} client      - The S3 client with bucket configuration.
 * @param {string}   path                 - The file path to remove.
 * @param {S3RemoveOptions} [options]      - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: S3ClientWithBucket, path: string, options?: S3RemoveOptions): Promise<Returned>
/**
 * Removes a file from an FTP server.
 *
 * @param {FtpClient} client               - The FTP client instance.
 * @param {string}   path                 - The file path to remove.
 * @param {FtpRemoveOptions} [options]     - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: FtpClient, path: string, options?: FtpRemoveOptions): Promise<Returned>
/**
 * Removes a file from an SFTP server.
 *
 * @param {SftpClient} client              - The SFTP client instance.
 * @param {string}   path                 - The file path to remove.
 * @param {SftpRemoveOptions} [options]    - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: SftpClient, path: string, options?: SftpRemoveOptions): Promise<Returned>
/**
 * Removes a file from cloud storage.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param {AnyClient} client               - The cloud storage client instance.
 * @param {string}   path                 - The file path to remove.
 * @param {GcsRemoveOptions | S3RemoveOptions | FtpRemoveOptions | SftpRemoveOptions} [options] - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: AnyClient, path: string, options?: GcsRemoveOptions | S3RemoveOptions | FtpRemoveOptions | SftpRemoveOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsRemove(client, path, options as GcsRemoveOptions)
  if (isS3ClientWithBucket(client)) return s3Remove(client.client, path, client.bucketName, options as S3RemoveOptions)
  if (isFtpClient(client)) return ftpRemove(client, path, options as FtpRemoveOptions)
  if (isSftpClient(client)) return sftpRemove(client, path, options as SftpRemoveOptions)
  return Outcome.makeFailure('Invalid client type')
}
