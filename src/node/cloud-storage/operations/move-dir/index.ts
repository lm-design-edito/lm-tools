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
import { moveDir as ftpMoveDir, type MoveDirOptions as FtpsMoveDirOptions } from '../../../ftps/directory/move-dir/index.js'
import { moveDir as sftpMoveDir, type MoveDirOptions as SftpMoveDirOptions } from '../../../sftp/directory/move-dir/index.js'
import { type MoveDirOptions as S3MoveDirOptions, moveDir as s3MoveDir } from '../../../@aws-s3/storage/directory/move-dir/index.js'
import { type MoveDirOptions as GcsMoveDirOptions, moveDir as gcsMoveDir } from '../../../@google-cloud/storage/directory/move-dir/index.js'

/** Return type for move directory operations. */
type Returned = Outcome.Either<true, string>

/**
 * Moves a directory from one path to another using a Google Cloud Storage bucket.
 *
 * @param client               - The Google Cloud Storage bucket instance.
 * @param   sourcePath           - The source directory path to move from.
 * @param   targetPath           - The target directory path to move to.
 * @param [options]    - Optional move configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveDir (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsMoveDirOptions): Promise<Returned>
/**
 * Moves a directory from one path to another using an S3 client.
 *
 * @param client      - The S3 client with bucket configuration.
 * @param   sourcePath           - The source directory path to move from.
 * @param   targetPath           - The target directory path to move to.
 * @param [options]     - Optional move configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveDir (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3MoveDirOptions): Promise<Returned>
/**
 * Moves a directory from one path to another using an FTP client.
 *
 * @param client               - The FTP client instance.
 * @param   sourcePath           - The source directory path to move from.
 * @param   targetPath           - The target directory path to move to.
 * @param [options]   - Optional move configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveDir (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsMoveDirOptions): Promise<Returned>
/**
 * Moves a directory from one path to another using an SFTP client.
 *
 * @param client              - The SFTP client instance.
 * @param   sourcePath           - The source directory path to move from.
 * @param   targetPath           - The target directory path to move to.
 * @param [options]   - Optional move configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveDir (client: SftpClient, sourcePath: string, targetPath: string, options?: SftpMoveDirOptions): Promise<Returned>
/**
 * Moves a directory from one path to another.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param client               - The cloud storage client instance.
 * @param   sourcePath           - The source directory path to move from.
 * @param   targetPath           - The target directory path to move to.
 * @param [options] - Optional move configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveDir (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsMoveDirOptions | S3MoveDirOptions | FtpsMoveDirOptions | SftpMoveDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return await gcsMoveDir(client, sourcePath, targetPath, options as GcsMoveDirOptions)
  if (isS3ClientWithBucket(client)) return await s3MoveDir(client.client, client.bucketName, sourcePath, targetPath, options as S3MoveDirOptions)
  if (isFtpClient(client)) return await ftpMoveDir(client, sourcePath, targetPath, options)
  if (isSftpClient(client)) return await sftpMoveDir(client, sourcePath, targetPath, options)
  return Outcome.makeFailure('Invalid client type')
}
