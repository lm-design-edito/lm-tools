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
import { exists as ftpExists } from '../../../ftps/file/exists/index.js'
import { exists as sftpExists } from '../../../sftp/file/exists/index.js'
import { ExistsOptions as S3ExistsOptions, exists as s3Exists } from '../../../@aws-s3/storage/file/exists/index.js'
import { ExistsOptions as GcsExistsOptions, exists as gcsExists } from '../../../@google-cloud/storage/file/exists/index.js'

/** Return type for file existence checks. */
type Returned = Outcome.Either<boolean, string>

/**
 * Checks whether a file exists in a Google Cloud Storage bucket.
 *
 * @param {GCSBucket} client              - The Google Cloud Storage bucket instance.
 * @param {string}   path                 - The path of the file to check.
 * @param {GcsExistsOptions} [options]    - Optional configuration.
 * @returns {Promise<Outcome.Either<boolean, string>>}
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: GCSBucket, path: string, options?: GcsExistsOptions): Promise<Returned>
/**
 * Checks whether a file exists in an S3 bucket.
 *
 * @param {S3ClientWithBucket} client     - The S3 client with bucket configuration.
 * @param {string}   path                 - The path of the file to check.
 * @param {S3ExistsOptions} [options]    - Optional configuration.
 * @returns {Promise<Outcome.Either<boolean, string>>}
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: S3ClientWithBucket, path: string, options?: S3ExistsOptions): Promise<Returned>
/**
 * Checks whether a file exists on an FTP server.
 *
 * @param {FtpClient} client              - The FTP client instance.
 * @param {string}   path                 - The path of the file to check.
 * @returns {Promise<Outcome.Either<boolean, string>>}
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: FtpClient, path: string): Promise<Returned>
/**
 * Checks whether a file exists on an SFTP server.
 *
 * @param {SftpClient} client             - The SFTP client instance.
 * @param {string}   path                 - The path of the file to check.
 * @returns {Promise<Outcome.Either<boolean, string>>}
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: SftpClient, path: string): Promise<Returned>
/**
 * Checks whether a file exists in cloud storage.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param {AnyClient} client              - The cloud storage client instance.
 * @param {string}   path                 - The path of the file to check.
 * @param {GcsExistsOptions | S3ExistsOptions} [options] - Optional configuration.
 * @returns {Promise<Outcome.Either<boolean, string>>}
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: AnyClient, path: string, options?: GcsExistsOptions | S3ExistsOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsExists(client, path, options as GcsExistsOptions)
  if (isS3ClientWithBucket(client)) return s3Exists(client.client, client.bucketName, path, options as S3ExistsOptions)
  if (isFtpClient(client)) return ftpExists(client, path)
  if (isSftpClient(client)) return sftpExists(client, path)
  return Outcome.makeFailure('Invalid client type')
}
