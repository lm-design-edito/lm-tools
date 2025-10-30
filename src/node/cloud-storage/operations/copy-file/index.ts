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
import { copy as ftpCopy, CopyOptions as FtpsCopyOptions } from '../../../ftps/file/copy/index.js'
import { copy as sftpCopy, CopyOptions as SftpCopyOptions } from '../../../sftp/file/copy/index.js'
import { CopyOptions as S3CopyOptions, copy as s3Copy } from '../../../@aws-s3/storage/file/copy/index.js'
import { CopyOptions as GcsCopyOptions, copy as gcsCopy } from '../../../@google-cloud/storage/file/copy/index.js'

type Returned = Outcome.Either<true, string>

export async function copyFile (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsCopyOptions): Promise<Returned>
export async function copyFile (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3CopyOptions): Promise<Returned>
export async function copyFile (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsCopyOptions): Promise<Returned>
export async function copyFile (client: SftpClient, sourcePath: string, targetPath: string, options?: SftpCopyOptions): Promise<Returned>
export async function copyFile (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsCopyOptions | S3CopyOptions | FtpsCopyOptions | SftpCopyOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsCopy(client, sourcePath, targetPath, options as GcsCopyOptions)
  if (isS3ClientWithBucket(client)) return s3Copy(client.client, client.bucketName, sourcePath, targetPath, options as S3CopyOptions)
  if (isFtpClient(client)) return ftpCopy(client, sourcePath, targetPath, options as FtpsCopyOptions)
  if (isSftpClient(client)) return sftpCopy(client, sourcePath, targetPath, options as SftpCopyOptions)
  return Outcome.makeFailure('Invalid client type')
}
