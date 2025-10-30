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
import { RemoveOptions as FtpRemoveOptions, remove as ftpRemove } from '../../../ftps/file/remove/index.js'
import { RemoveOptions as SftpRemoveOptions, remove as sftpRemove } from '../../../sftp/file/remove/index.js'
import { RemoveOptions as S3RemoveOptions, remove as s3Remove } from '../../../@aws-s3/storage/file/remove/index.js'
import { RemoveOptions as GcsRemoveOptions, remove as gcsRemove } from '../../../@google-cloud/storage/file/remove/index.js'

type Returned = Outcome.Either<true, string>

export async function removeFile (client: GCSBucket, path: string, options?: GcsRemoveOptions): Promise<Returned>
export async function removeFile (client: S3ClientWithBucket, path: string, options?: S3RemoveOptions): Promise<Returned>
export async function removeFile (client: FtpClient, path: string, options?: FtpRemoveOptions): Promise<Returned>
export async function removeFile (client: SftpClient, path: string, options?: SftpRemoveOptions): Promise<Returned>
export async function removeFile (client: AnyClient, path: string, options?: GcsRemoveOptions | S3RemoveOptions | FtpRemoveOptions | SftpRemoveOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsRemove(client, path, options as GcsRemoveOptions)
  if (isS3ClientWithBucket(client)) return s3Remove(client.client, path, client.bucketName, options as S3RemoveOptions)
  if (isFtpClient(client)) return ftpRemove(client, path, options as FtpRemoveOptions)
  if (isSftpClient(client)) return sftpRemove(client, path, options as SftpRemoveOptions)
  return Outcome.makeFailure('Invalid client type')
}
