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
import { move as ftpMove, MoveOptions as FtpsMoveOptions } from '../../../ftps/file/move/index.js'
import { move as sftpMove, MoveOptions as SftpMoveOptions } from '../../../sftp/file/move/index.js'
import { MoveOptions as S3MoveOptions, move as s3Move } from '../../../@aws-s3/storage/file/move/index.js'
import { MoveOptions as GcsMoveOptions, move as gcsMove } from '../../../@google-cloud/storage/file/move/index.js'

/** Return type for move file operations. */
type Returned = Outcome.Either<true, string>

/**
 * Moves a file from one path to another using a Google Cloud Storage bucket.
 *
 * @param {GCSBucket} client               - The Google Cloud Storage bucket instance.
 * @param {string}   sourcePath           - The source file path to move from.
 * @param {string}   targetPath           - The target file path to move to.
 * @param {GcsMoveOptions} [options]       - Optional move configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveFile (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsMoveOptions): Promise<Returned>
/**
 * Moves a file from one path to another using an S3 client.
 *
 * @param {S3ClientWithBucket} client      - The S3 client with bucket configuration.
 * @param {string}   sourcePath           - The source file path to move from.
 * @param {string}   targetPath           - The target file path to move to.
 * @param {S3MoveOptions} [options]        - Optional move configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveFile (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3MoveOptions): Promise<Returned>
/**
 * Moves a file from one path to another using an FTP client.
 *
 * @param {FtpClient} client               - The FTP client instance.
 * @param {string}   sourcePath           - The source file path to move from.
 * @param {string}   targetPath           - The target file path to move to.
 * @param {FtpsMoveOptions} [options]      - Optional move configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveFile (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsMoveOptions): Promise<Returned>
/**
 * Moves a file from one path to another using an SFTP client.
 *
 * @param {SftpClient} client              - The SFTP client instance.
 * @param {string}   sourcePath           - The source file path to move from.
 * @param {string}   targetPath           - The target file path to move to.
 * @param {SftpMoveOptions} [options]      - Optional move configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveFile (client: SftpClient, sourcePath: string, targetPath: string, options?: SftpMoveOptions): Promise<Returned>
/**
 * Moves a file from one path to another.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param {AnyClient} client               - The cloud storage client instance.
 * @param {string}   sourcePath           - The source file path to move from.
 * @param {string}   targetPath           - The target file path to move to.
 * @param {GcsMoveOptions | S3MoveOptions | FtpsMoveOptions | SftpMoveOptions} [options] - Optional move configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function moveFile (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsMoveOptions | S3MoveOptions | FtpsMoveOptions | SftpMoveOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsMove(client, sourcePath, targetPath, options as GcsMoveOptions)
  if (isS3ClientWithBucket(client)) return s3Move(client.client, client.bucketName, sourcePath, targetPath, options as S3MoveOptions)
  if (isFtpClient(client)) return ftpMove(client, sourcePath, targetPath)
  if (isSftpClient(client)) return sftpMove(client, sourcePath, targetPath)
  return Outcome.makeFailure('Invalid client type')
}
