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
import { removeDir as ftpRemoveDir, type RemoveDirOptions as FtpsRemoveDirOptions } from '../../../ftps/directory/remove-dir/index.js'
import { removeDir as sftpRemoveDir, type RemoveDirOptions as SftpRemoveDirOptions } from '../../../sftp/directory/remove-dir/index.js'
import { type RemoveDirOptions as S3RemoveDirOptions, removeDir as s3RemoveDir } from '../../../@aws-s3/storage/directory/remove-dir/index.js'
import { type RemoveDirOptions as GcsRemoveDirOptions, removeDir as gcsRemoveDir } from '../../../@google-cloud/storage/directory/remove-dir/index.js'

/** Return type for remove directory operations. */
type Returned = Outcome.Either<true, string>

/**
 * Removes a directory from a Google Cloud Storage bucket.
 *
 * @param client               - The Google Cloud Storage bucket instance.
 * @param   sourcePath           - The directory path to remove.
 * @param [options] - Optional remove configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: GCSBucket, sourcePath: string, options?: GcsRemoveDirOptions): Promise<Returned>
/**
 * Removes a directory from an S3 bucket.
 *
 * @param client      - The S3 client with bucket configuration.
 * @param   sourcePath           - The directory path to remove.
 * @param [options]   - Optional remove configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: S3ClientWithBucket, sourcePath: string, options?: S3RemoveDirOptions): Promise<Returned>
/**
 * Removes a directory from an FTP server.
 *
 * @param client               - The FTP client instance.
 * @param   sourcePath           - The directory path to remove.
 * @param [options] - Optional remove configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: FtpClient, sourcePath: string, options?: FtpsRemoveDirOptions): Promise<Returned>
/**
 * Removes a directory from an SFTP server.
 *
 * @param client              - The SFTP client instance.
 * @param   sourcePath           - The directory path to remove.
 * @param [options] - Optional remove configuration.
 * @returns
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
 * @param client               - The cloud storage client instance.
 * @param   sourcePath           - The directory path to remove.
 * @param [options] - Optional remove configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function removeDir (client: AnyClient, sourcePath: string, options?: GcsRemoveDirOptions | S3RemoveDirOptions | FtpsRemoveDirOptions | SftpRemoveDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return await gcsRemoveDir(client, sourcePath, options as GcsRemoveDirOptions)
  if (isS3ClientWithBucket(client)) return await s3RemoveDir(client.client, client.bucketName, sourcePath, options as S3RemoveDirOptions)
  if (isFtpClient(client)) return await ftpRemoveDir(client, sourcePath, options as FtpsRemoveDirOptions)
  if (isSftpClient(client)) return await sftpRemoveDir(client, sourcePath, options as SftpRemoveDirOptions)
  return Outcome.makeFailure('Invalid client type')
}
