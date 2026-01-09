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
import {
  copyDir as ftpCopyDir,
  CopyDirOptions as FtpsCopyDirOptions
} from '../../../ftps/directory/copy-dir/index.js'
import {
  copyDir as sftpCopyDir,
  CopyDirOptions as SftpCopyDirOptions
} from '../../../sftp/directory/copy-dir/index.js'
import {
  CopyDirOptions as S3CopyDirOptions,
  copyDir as s3CopyDir
} from '../../../@aws-s3/storage/directory/copy-dir/index.js'
import {
  CopyDirOptions as GcsCopyDirOptions,
  copyDir as gcsCopyDir
} from '../../../@google-cloud/storage/directory/copy-dir/index.js'

/** Return type for copy directory operations. */
type Returned = Outcome.Either<true, string>

/**
 * Recursively copies a directory from one path to another using a Google Cloud Storage bucket.
 *
 * @param {GCSBucket} client              - The Google Cloud Storage bucket instance.
 * @param {string}   sourcePath           - The source directory path to copy from.
 * @param {string}   targetPath           - The target directory path to copy to.
 * @param {GcsCopyDirOptions} [options]  - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsCopyDirOptions): Promise<Returned>
/**
 * Recursively copies a directory from one path to another using an S3 client.
 *
 * @param {S3ClientWithBucket} client    - The S3 client with bucket configuration.
 * @param {string}   sourcePath           - The source directory path to copy from.
 * @param {string}   targetPath           - The target directory path to copy to.
 * @param {S3CopyDirOptions} [options]    - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3CopyDirOptions): Promise<Returned>
/**
 * Recursively copies a directory from one path to another using an FTP client.
 *
 * @param {FtpClient} client              - The FTP client instance.
 * @param {string}   sourcePath           - The source directory path to copy from.
 * @param {string}   targetPath           - The target directory path to copy to.
 * @param {FtpsCopyDirOptions} [options]  - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsCopyDirOptions): Promise<Returned>
/**
 * Recursively copies a directory from one path to another using an SFTP client.
 *
 * @param {SftpClient} client             - The SFTP client instance.
 * @param {string}   sourcePath           - The source directory path to copy from.
 * @param {string}   targetPath           - The target directory path to copy to.
 * @param {SftpCopyDirOptions} [options]  - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: SftpClient, sourcePath: string, targetPath: string, options?: SftpCopyDirOptions): Promise<Returned>
/**
 * Recursively copies a directory from one path to another.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param {AnyClient} client              - The cloud storage client instance.
 * @param {string}   sourcePath           - The source directory path to copy from.
 * @param {string}   targetPath           - The target directory path to copy to.
 * @param {GcsCopyDirOptions | S3CopyDirOptions | FtpsCopyDirOptions | SftpCopyDirOptions} [options] - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsCopyDirOptions | S3CopyDirOptions | FtpsCopyDirOptions | SftpCopyDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsCopyDir(client, sourcePath, targetPath, options as GcsCopyDirOptions)
  if (isS3ClientWithBucket(client)) return s3CopyDir(client.client, client.bucketName, sourcePath, targetPath, options as S3CopyDirOptions)
  if (isFtpClient(client)) return ftpCopyDir(client, sourcePath, targetPath)
  if (isSftpClient(client)) return sftpCopyDir(client, sourcePath, targetPath)
  return Outcome.makeFailure('Invalid client type')
}
