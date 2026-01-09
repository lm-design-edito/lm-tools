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
import { removeDir as ftpRemoveDir, RemoveDirOptions as FtpsRemoveDirOptions } from '../../../ftps/directory/remove-dir/index.js'
import { removeDir as sftpRemoveDir, RemoveDirOptions as SftpRemoveDirOptions } from '../../../sftp/directory/remove-dir/index.js'
import { RemoveDirOptions as S3RemoveDirOptions, removeDir as s3RemoveDir } from '../../../@aws-s3/storage/directory/remove-dir/index.js'
import { RemoveDirOptions as GcsRemoveDirOptions, removeDir as gcsRemoveDir } from '../../../@google-cloud/storage/directory/remove-dir/index.js'

/** Return type for remove directory operations. */
type Returned = Outcome.Either<true, string>

/**
 * Removes a directory from a Google Cloud Storage bucket.
 *
 * @param {GCSBucket} client               - The Google Cloud Storage bucket instance.
 * @param {string}   sourcePath           - The directory path to remove.
 * @param {GcsRemoveDirOptions} [options] - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: GCSBucket, sourcePath: string, options?: GcsRemoveDirOptions): Promise<Returned>
/**
 * Removes a directory from an S3 bucket.
 *
 * @param {S3ClientWithBucket} client      - The S3 client with bucket configuration.
 * @param {string}   sourcePath           - The directory path to remove.
 * @param {S3RemoveDirOptions} [options]   - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: S3ClientWithBucket, sourcePath: string, options?: S3RemoveDirOptions): Promise<Returned>
/**
 * Removes a directory from an FTP server.
 *
 * @param {FtpClient} client               - The FTP client instance.
 * @param {string}   sourcePath           - The directory path to remove.
 * @param {FtpsRemoveDirOptions} [options] - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: FtpClient, sourcePath: string, options?: FtpsRemoveDirOptions): Promise<Returned>
/**
 * Removes a directory from an SFTP server.
 *
 * @param {SftpClient} client              - The SFTP client instance.
 * @param {string}   sourcePath           - The directory path to remove.
 * @param {SftpRemoveDirOptions} [options] - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: SftpClient, sourcePath: string, options?: SftpRemoveDirOptions): Promise<Returned>
/**
 * Removes a directory from cloud storage.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param {AnyClient} client               - The cloud storage client instance.
 * @param {string}   sourcePath           - The directory path to remove.
 * @param {GcsRemoveDirOptions | S3RemoveDirOptions | FtpsRemoveDirOptions | SftpRemoveDirOptions} [options] - Optional remove configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: AnyClient, sourcePath: string, options?: GcsRemoveDirOptions | S3RemoveDirOptions | FtpsRemoveDirOptions | SftpRemoveDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsRemoveDir(client, sourcePath, options as GcsRemoveDirOptions)
  if (isS3ClientWithBucket(client)) return s3RemoveDir(client.client, client.bucketName, sourcePath, options as S3RemoveDirOptions)
  if (isFtpClient(client)) return ftpRemoveDir(client, sourcePath, options as FtpsRemoveDirOptions)
  if (isSftpClient(client)) return sftpRemoveDir(client, sourcePath, options as SftpRemoveDirOptions)
  return Outcome.makeFailure('Invalid client type')
}
