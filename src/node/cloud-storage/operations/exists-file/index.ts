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
import { exists as ftpExists } from '../../../ftps/file/exists/index.js'
import { exists as sftpExists } from '../../../sftp/file/exists/index.js'
import { type ExistsOptions as S3ExistsOptions, exists as s3Exists } from '../../../@aws-s3/storage/file/exists/index.js'
import { type ExistsOptions as GcsExistsOptions, exists as gcsExists } from '../../../@google-cloud/storage/file/exists/index.js'

/** Return type for file existence checks. */
type Returned = Outcome.Either<boolean, string>

/**
 * Checks whether a file exists in a Google Cloud Storage bucket.
 *
 * @param client              - The Google Cloud Storage bucket instance.
 * @param   path                 - The path of the file to check.
 * @param [options]    - Optional configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: GCSBucket, path: string, options?: GcsExistsOptions): Promise<Returned>
/**
 * Checks whether a file exists in an S3 bucket.
 *
 * @param client     - The S3 client with bucket configuration.
 * @param   path                 - The path of the file to check.
 * @param [options]    - Optional configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: S3ClientWithBucket, path: string, options?: S3ExistsOptions): Promise<Returned>
/**
 * Checks whether a file exists on an SFTP or FTP server.
 *
 * @param client             - The FTP or SFTP client instance.
 * @param   path                 - The path of the file to check.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: FtpClient | SftpClient, path: string): Promise<Returned>
/**
 * Checks whether a file exists in cloud storage.
 *
 * The function automatically dispatches to the appropriate implementation based on
 * the client type (Google Cloud Storage, S3, FTP, or SFTP).
 *
 * @param client              - The cloud storage client instance.
 * @param   path                 - The path of the file to check.
 * @param [options] - Optional configuration.
 * @returns
 * - On success:  `Outcome.makeSuccess(true)` if the file exists,
 *                `Outcome.makeSuccess(false)` if it does not.
 * - On failure:  `Outcome.makeFailure(errStr)` for unexpected errors.
 */
export async function existsFile (client: AnyClient, path: string, options?: GcsExistsOptions | S3ExistsOptions): Promise<Returned> {
  if (isGcsBucket(client)) return await gcsExists(client, path, options as GcsExistsOptions)
  if (isS3ClientWithBucket(client)) return await s3Exists(client.client, client.bucketName, path, options as S3ExistsOptions)
  if (isFtpClient(client)) return await ftpExists(client, path)
  if (isSftpClient(client)) return await sftpExists(client, path)
  return Outcome.makeFailure('Invalid client type')
}
