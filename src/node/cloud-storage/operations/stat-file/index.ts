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
import { type Stat as FtpStat, stat as ftpStat } from '../../../ftps/file/stat/index.js'
import { type Stat as SftpStat, stat as sftpStat } from '../../../sftp/file/stat/index.js'
import { type Stat as S3Stat, type StatOptions as S3StatOptions, stat as s3Stat } from '../../../@aws-s3/storage/file/stat/index.js'
import { type Stat as GcsStat, type StatOptions as GcsStatOptions, stat as gcsStat } from '../../../@google-cloud/storage/file/stat/index.js'

/** Return type for stat file operations. */
type Returned<K extends FtpStat | SftpStat | S3Stat | GcsStat> = Outcome.Either<K, string>

/**
 * Retrieves metadata for a file in a Google Cloud Storage bucket.
 *
 * @param {GCSBucket} client              - The Google Cloud Storage bucket instance.
 * @param {string}   path                 - The file path to stat.
 * @param {GcsStatOptions} [options]       - Optional stat configuration.
 * @returns {Promise<Outcome.Either<GcsStat, string>>}
 * - On success:  `Outcome.makeSuccess(stat)` containing file metadata.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function statFile (client: GCSBucket, path: string, options?: GcsStatOptions): Promise<Returned<GcsStat>>
/**
 * Retrieves metadata for a file in an S3 bucket.
 *
 * @param {S3ClientWithBucket} client      - The S3 client with bucket configuration.
 * @param {string}   path                 - The file path to stat.
 * @param {S3StatOptions} [options]        - Optional stat configuration.
 * @returns {Promise<Outcome.Either<S3Stat, string>>}
 * - On success:  `Outcome.makeSuccess(stat)` containing file metadata.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function statFile (client: S3ClientWithBucket, path: string, options?: S3StatOptions): Promise<Returned<S3Stat>>
/**
 * Retrieves metadata for a file on an FTP server.
 *
 * @param {FtpClient} client              - The FTP client instance.
 * @param {string}   path                 - The file path to stat.
 * @returns {Promise<Outcome.Either<FtpStat, string>>}
 * - On success:  `Outcome.makeSuccess(stat)` containing file metadata.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function statFile (client: FtpClient, path: string): Promise<Returned<FtpStat>>
/**
 * Retrieves metadata for a file on an SFTP server.
 *
 * @param {SftpClient} client             - The SFTP client instance.
 * @param {string}   path                 - The file path to stat.
 * @returns {Promise<Outcome.Either<SftpStat, string>>}
 * - On success:  `Outcome.makeSuccess(stat)` containing file metadata.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function statFile (client: SftpClient, path: string): Promise<Returned<SftpStat>>
/**
 * Retrieves metadata for a file in cloud storage.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param {AnyClient} client              - The cloud storage client instance.
 * @param {string}   path                 - The file path to stat.
 * @param {GcsStatOptions | S3StatOptions} [options] - Optional stat configuration.
 * @returns {Promise<Outcome.Either<GcsStat | S3Stat | FtpStat | SftpStat, string>>}
 * - On success:  `Outcome.makeSuccess(stat)` containing file metadata.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function statFile (client: AnyClient, path: string, options?: GcsStatOptions | S3StatOptions): Promise<Returned<GcsStat | S3Stat | FtpStat | SftpStat>> {
  if (isGcsBucket(client)) return await gcsStat(client, path, options as GcsStatOptions)
  if (isS3ClientWithBucket(client)) return await s3Stat(client.client, path, client.bucketName, options as S3StatOptions)
  if (isFtpClient(client)) return await ftpStat(client, path)
  if (isSftpClient(client)) return await sftpStat(client, path)
  return Outcome.makeFailure('Invalid client type')
}
