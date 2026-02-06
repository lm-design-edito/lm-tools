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
import { list as ftpList } from '../../../ftps/directory/list/index.js'
import { list as sftpList } from '../../../sftp/directory/list/index.js'
import { type ListOptions as S3ListOptions, list as s3List } from '../../../@aws-s3/storage/directory/list/index.js'
import { type ListOptions as GcsListOptions, list as gcsList } from '../../../@google-cloud/storage/directory/list/index.js'

/** Return type for list directory operations. */
type Returned = Outcome.Either<string[], string>

/**
 * Lists the contents of a directory in a Google Cloud Storage bucket.
 *
 * @param {GCSBucket} client              - The Google Cloud Storage bucket instance.
 * @param {string}   path                 - The directory path to list.
 * @param {GcsListOptions} [options]      - Optional list configuration.
 * @returns {Promise<Outcome.Either<string[], string>>}
 * - On success:  `Outcome.makeSuccess(paths)` containing an array of file/directory paths.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function listDir (client: GCSBucket, path: string, options?: GcsListOptions): Promise<Returned>
/**
 * Lists the contents of a directory in an S3 bucket.
 *
 * @param {S3ClientWithBucket} client     - The S3 client with bucket configuration.
 * @param {string}   path                 - The directory path to list.
 * @param {S3ListOptions} [options]        - Optional list configuration.
 * @returns {Promise<Outcome.Either<string[], string>>}
 * - On success:  `Outcome.makeSuccess(paths)` containing an array of file/directory paths.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function listDir (client: S3ClientWithBucket, path: string, options?: S3ListOptions): Promise<Returned>
/**
 * Lists the contents of a directory on an FTP server.
 *
 * @param {FtpClient} client               - The FTP client instance.
 * @param {string}   path                 - The directory path to list.
 * @returns {Promise<Outcome.Either<string[], string>>}
 * - On success:  `Outcome.makeSuccess(paths)` containing an array of file/directory paths.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function listDir (client: FtpClient, path: string): Promise<Returned>
/**
 * Lists the contents of a directory on an SFTP server.
 *
 * @param {SftpClient} client              - The SFTP client instance.
 * @param {string}   path                 - The directory path to list.
 * @returns {Promise<Outcome.Either<string[], string>>}
 * - On success:  `Outcome.makeSuccess(paths)` containing an array of file/directory paths.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function listDir (client: SftpClient, path: string): Promise<Returned>
/**
 * Lists the contents of a directory in cloud storage.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param {AnyClient} client               - The cloud storage client instance.
 * @param {string}   path                 - The directory path to list.
 * @param {GcsListOptions | S3ListOptions} [options] - Optional list configuration.
 * @returns {Promise<Outcome.Either<string[], string>>}
 * - On success:  `Outcome.makeSuccess(paths)` containing an array of file/directory paths.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function listDir (client: AnyClient, path: string, options?: GcsListOptions | S3ListOptions): Promise<Returned> {
  if (isGcsBucket(client)) return await gcsList(client, path, options as GcsListOptions)
  if (isS3ClientWithBucket(client)) return await s3List(client.client, client.bucketName, path, options as S3ListOptions)
  if (isFtpClient(client)) return await ftpList(client, path)
  if (isSftpClient(client)) return await sftpList(client, path)
  return Outcome.makeFailure('Invalid client type')
}
