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
import { copy as ftpCopy, CopyOptions as FtpsCopyOptions } from '../../../ftps/file/copy/index.js'
import { copy as sftpCopy, CopyOptions as SftpCopyOptions } from '../../../sftp/file/copy/index.js'
import { CopyOptions as S3CopyOptions, copy as s3Copy } from '../../../@aws-s3/storage/file/copy/index.js'
import { CopyOptions as GcsCopyOptions, copy as gcsCopy } from '../../../@google-cloud/storage/file/copy/index.js'

/** Return type for copy file operations. */
type Returned = Outcome.Either<true, string>

/**
 * Copies a file from one path to another using a Google Cloud Storage bucket.
 *
 * @param {GCSBucket} client              - The Google Cloud Storage bucket instance.
 * @param {string}   sourcePath           - The source file path to copy from.
 * @param {string}   targetPath           - The target file path to copy to.
 * @param {GcsCopyOptions} [options]      - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsCopyOptions): Promise<Returned>
/**
 * Copies a file from one path to another using an S3 client.
 *
 * @param {S3ClientWithBucket} client     - The S3 client with bucket configuration.
 * @param {string}   sourcePath           - The source file path to copy from.
 * @param {string}   targetPath           - The target file path to copy to.
 * @param {S3CopyOptions} [options]       - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3CopyOptions): Promise<Returned>
/**
 * Copies a file from one path to another using an FTP client.
 *
 * @param {FtpClient} client              - The FTP client instance.
 * @param {string}   sourcePath           - The source file path to copy from.
 * @param {string}   targetPath           - The target file path to copy to.
 * @param {FtpsCopyOptions} [options]      - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsCopyOptions): Promise<Returned>
/**
 * Copies a file from one path to another using an SFTP client.
 *
 * @param {SftpClient} client             - The SFTP client instance.
 * @param {string}   sourcePath           - The source file path to copy from.
 * @param {string}   targetPath           - The target file path to copy to.
 * @param {SftpCopyOptions} [options]     - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: SftpClient, sourcePath: string, targetPath: string, options?: SftpCopyOptions): Promise<Returned>
/**
 * Copies a file from one path to another.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param {AnyClient} client              - The cloud storage client instance.
 * @param {string}   sourcePath           - The source file path to copy from.
 * @param {string}   targetPath           - The target file path to copy to.
 * @param {GcsCopyOptions | S3CopyOptions | FtpsCopyOptions | SftpCopyOptions} [options] - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsCopyOptions | S3CopyOptions | FtpsCopyOptions | SftpCopyOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsCopy(client, sourcePath, targetPath, options as GcsCopyOptions)
  if (isS3ClientWithBucket(client)) return s3Copy(client.client, client.bucketName, sourcePath, targetPath, options as S3CopyOptions)
  if (isFtpClient(client)) return ftpCopy(client, sourcePath, targetPath, options as FtpsCopyOptions)
  if (isSftpClient(client)) return sftpCopy(client, sourcePath, targetPath, options as SftpCopyOptions)
  return Outcome.makeFailure('Invalid client type')
}
