/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- options is narrowed based on a runtime check of the separate `client` param; TS can't connect the two at compile time */
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
import {
  copyDir as ftpCopyDir,
  type CopyDirOptions as FtpsCopyDirOptions
} from '../../../ftps/directory/copy-dir/index.js'
import {
  copyDir as sftpCopyDir,
  type CopyDirOptions as SftpCopyDirOptions
} from '../../../sftp/directory/copy-dir/index.js'
import {
  type CopyDirOptions as S3CopyDirOptions,
  copyDir as s3CopyDir
} from '../../../@aws-s3/storage/directory/copy-dir/index.js'
import {
  type CopyDirOptions as GcsCopyDirOptions,
  copyDir as gcsCopyDir
} from '../../../@google-cloud/storage/directory/copy-dir/index.js'

/** Return type for copy directory operations. */
type Returned = Outcome.Either<true, string>

/**
 * Recursively copies a directory from one path to another using a Google Cloud Storage bucket.
 *
 * @param client              - The Google Cloud Storage bucket instance.
 * @param   sourcePath           - The source directory path to copy from.
 * @param   targetPath           - The target directory path to copy to.
 * @param [options]  - Optional copy configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsCopyDirOptions): Promise<Returned>
/**
 * Recursively copies a directory from one path to another using an S3 client.
 *
 * @param client    - The S3 client with bucket configuration.
 * @param   sourcePath           - The source directory path to copy from.
 * @param   targetPath           - The target directory path to copy to.
 * @param [options]    - Optional copy configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3CopyDirOptions): Promise<Returned>
/**
 * Recursively copies a directory from one path to another using an FTP client.
 *
 * @param client              - The FTP client instance.
 * @param   sourcePath           - The source directory path to copy from.
 * @param   targetPath           - The target directory path to copy to.
 * @param [options]  - Optional copy configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsCopyDirOptions): Promise<Returned>
/**
 * Recursively copies a directory from one path to another using an SFTP client.
 *
 * @param client             - The SFTP client instance.
 * @param   sourcePath           - The source directory path to copy from.
 * @param   targetPath           - The target directory path to copy to.
 * @param [options]  - Optional copy configuration.
 * @returns
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
 * @param client              - The cloud storage client instance.
 * @param   sourcePath           - The source directory path to copy from.
 * @param   targetPath           - The target directory path to copy to.
 * @param [options] - Optional copy configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyDir (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsCopyDirOptions | S3CopyDirOptions | FtpsCopyDirOptions | SftpCopyDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return await gcsCopyDir(client, sourcePath, targetPath, options as GcsCopyDirOptions)
  if (isS3ClientWithBucket(client)) return await s3CopyDir(client.client, client.bucketName, sourcePath, targetPath, options as S3CopyDirOptions)
  if (isFtpClient(client)) return await ftpCopyDir(client, sourcePath, targetPath)
  if (isSftpClient(client)) return await sftpCopyDir(client, sourcePath, targetPath)
  return Outcome.makeFailure('Invalid client type')
}
