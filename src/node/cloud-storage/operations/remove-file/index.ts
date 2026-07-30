import type { Bucket as GCSBucket } from '@google-cloud/storage'
import type { Client as FtpClient } from 'basic-ftp'
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
import { type RemoveOptions as FtpRemoveOptions, remove as ftpRemove } from '../../../ftps/file/remove/index.js'
import { type RemoveOptions as SftpRemoveOptions, remove as sftpRemove } from '../../../sftp/file/remove/index.js'
import { type RemoveOptions as S3RemoveOptions, remove as s3Remove } from '../../../@aws-s3/storage/file/remove/index.js'
import { type RemoveOptions as GcsRemoveOptions, remove as gcsRemove } from '../../../@google-cloud/storage/file/remove/index.js'

/** Return type for remove file operations. */
type Returned = Outcome.Either<true, string>

/**
 * Removes a file from a Google Cloud Storage bucket.
 *
 * @param client               - The Google Cloud Storage bucket instance.
 * @param   path                 - The file path to remove.
 * @param [options]     - Optional remove configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: GCSBucket, path: string, options?: GcsRemoveOptions): Promise<Returned>
/**
 * Removes a file from an S3 bucket.
 *
 * @param client      - The S3 client with bucket configuration.
 * @param   path                 - The file path to remove.
 * @param [options]      - Optional remove configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: S3ClientWithBucket, path: string, options?: S3RemoveOptions): Promise<Returned>
/**
 * Removes a file from an FTP server.
 *
 * @param client               - The FTP client instance.
 * @param   path                 - The file path to remove.
 * @param [options]     - Optional remove configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: FtpClient, path: string, options?: FtpRemoveOptions): Promise<Returned>
/**
 * Removes a file from an SFTP server.
 *
 * @param client              - The SFTP client instance.
 * @param   path                 - The file path to remove.
 * @param [options]    - Optional remove configuration.
 * @returns
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
 * @param client               - The cloud storage client instance.
 * @param   path                 - The file path to remove.
 * @param [options] - Optional remove configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeFile (client: AnyClient, path: string, options?: GcsRemoveOptions | S3RemoveOptions | FtpRemoveOptions | SftpRemoveOptions): Promise<Returned> {
  if (isGcsBucket(client)) return await gcsRemove(client, path, options)
  if (isS3ClientWithBucket(client)) return await s3Remove(client.client, path, client.bucketName, options)
  if (isFtpClient(client)) return await ftpRemove(client, path, options)
  if (isSftpClient(client)) return await sftpRemove(client, path, options)
  return Outcome.makeFailure('Invalid client type')
}
