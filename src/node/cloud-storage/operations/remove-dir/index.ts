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
import { removeDir as ftpRemoveDir, RemoveDirOptions as FtpsRemoveDirOptions } from '../../../ftps/directory/remove-dir/index.js'
import { removeDir as sftpRemoveDir, RemoveDirOptions as SftpRemoveDirOptions } from '../../../sftp/directory/remove-dir/index.js'
import { RemoveDirOptions as S3RemoveDirOptions, removeDir as s3RemoveDir } from '../../../@aws-s3/storage/directory/remove-dir/index.js'
import { RemoveDirOptions as GcsRemoveDirOptions, removeDir as gcsRemoveDir } from '../../../@google-cloud/storage/directory/remove-dir/index.js'

type Returned = Outcome.Either<true, string>

export async function removeDir (client: GCSBucket, sourcePath: string, options?: GcsRemoveDirOptions): Promise<Returned>
export async function removeDir (client: S3ClientWithBucket, sourcePath: string, options?: S3RemoveDirOptions): Promise<Returned>
export async function removeDir (client: FtpClient, sourcePath: string, options?: FtpsRemoveDirOptions): Promise<Returned>
export async function removeDir (client: SftpClient, sourcePath: string, options?: SftpRemoveDirOptions): Promise<Returned>
export async function removeDir (client: AnyClient, sourcePath: string, options?: GcsRemoveDirOptions | S3RemoveDirOptions | FtpsRemoveDirOptions | SftpRemoveDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsRemoveDir(client, sourcePath, options as GcsRemoveDirOptions)
  if (isS3ClientWithBucket(client)) return s3RemoveDir(client.client, client.bucketName, sourcePath, options as S3RemoveDirOptions)
  if (isFtpClient(client)) return ftpRemoveDir(client, sourcePath, options as FtpsRemoveDirOptions)
  if (isSftpClient(client)) return sftpRemoveDir(client, sourcePath, options as SftpRemoveDirOptions)
  return Outcome.makeFailure('Invalid client type')
}
