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
import {
  copyDir as ftpCopyDir,
  CopyDirOptions as FtpsCopyDirOptions
} from '../../../ftps/directory/copy-dir/index.js'
import {
  copyDir as sftpCopyDir,
  CopyDirOptions as SftpCopyDirOptions
} from '../../../sftp/directory/copy-dir/index.js'
import {
  CopyDirOptions as S3CopyDirOptions,
  copyDir as s3CopyDir
} from '../../../@aws-s3/storage/directory/copy-dir/index.js'
import {
  CopyDirOptions as GcsCopyDirOptions,
  copyDir as gcsCopyDir
} from '../../../@google-cloud/storage/directory/copy-dir/index.js'

type Returned = Outcome.Either<true, string>

export async function copyDir (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsCopyDirOptions): Promise<Returned>
export async function copyDir (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3CopyDirOptions): Promise<Returned>
export async function copyDir (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsCopyDirOptions): Promise<Returned>
export async function copyDir (client: SftpClient, sourcePath: string, targetPath: string, options?: SftpCopyDirOptions): Promise<Returned>
export async function copyDir (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsCopyDirOptions | S3CopyDirOptions | FtpsCopyDirOptions | SftpCopyDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsCopyDir(client, sourcePath, targetPath, options as GcsCopyDirOptions)
  if (isS3ClientWithBucket(client)) return s3CopyDir(client.client, client.bucketName, sourcePath, targetPath, options as S3CopyDirOptions)
  if (isFtpClient(client)) return ftpCopyDir(client, sourcePath, targetPath)
  if (isSftpClient(client)) return sftpCopyDir(client, sourcePath, targetPath)
  return Outcome.makeFailure('Invalid client type')
}
