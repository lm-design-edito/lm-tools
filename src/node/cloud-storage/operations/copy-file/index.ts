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
import { copy as ftpCopy, type CopyOptions as FtpsCopyOptions } from '../../../ftps/file/copy/index.js'
import { copy as sftpCopy, type CopyOptions as SftpCopyOptions } from '../../../sftp/file/copy/index.js'
import { type CopyOptions as S3CopyOptions, copy as s3Copy } from '../../../@aws-s3/storage/file/copy/index.js'
import { type CopyOptions as GcsCopyOptions, copy as gcsCopy } from '../../../@google-cloud/storage/file/copy/index.js'

/** Return type for copy file operations. */
type Returned = Outcome.Either<true, string>

/**
 * Copies a file from one path to another using a Google Cloud Storage bucket.
 *
 * @param client              - The Google Cloud Storage bucket instance.
 * @param   sourcePath           - The source file path to copy from.
 * @param   targetPath           - The target file path to copy to.
 * @param [options]      - Optional copy configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsCopyOptions): Promise<Returned>
/**
 * Copies a file from one path to another using an S3 client.
 *
 * @param client     - The S3 client with bucket configuration.
 * @param   sourcePath           - The source file path to copy from.
 * @param   targetPath           - The target file path to copy to.
 * @param [options]       - Optional copy configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3CopyOptions): Promise<Returned>
/**
 * Copies a file from one path to another using an FTP client.
 *
 * @param client              - The FTP client instance.
 * @param   sourcePath           - The source file path to copy from.
 * @param   targetPath           - The target file path to copy to.
 * @param [options]      - Optional copy configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsCopyOptions): Promise<Returned>
/**
 * Copies a file from one path to another using an SFTP client.
 *
 * @param client             - The SFTP client instance.
 * @param   sourcePath           - The source file path to copy from.
 * @param   targetPath           - The target file path to copy to.
 * @param [options]     - Optional copy configuration.
 * @returns
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
 * @param client              - The cloud storage client instance.
 * @param   sourcePath           - The source file path to copy from.
 * @param   targetPath           - The target file path to copy to.
 * @param [options] - Optional copy configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copyFile (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsCopyOptions | S3CopyOptions | FtpsCopyOptions | SftpCopyOptions): Promise<Returned> {
  if (isGcsBucket(client)) return await gcsCopy(client, sourcePath, targetPath, options as GcsCopyOptions)
  if (isS3ClientWithBucket(client)) return await s3Copy(client.client, client.bucketName, sourcePath, targetPath, options as S3CopyOptions)
  if (isFtpClient(client)) return await ftpCopy(client, sourcePath, targetPath, options)
  if (isSftpClient(client)) return await sftpCopy(client, sourcePath, targetPath, options)
  return Outcome.makeFailure('Invalid client type')
}
