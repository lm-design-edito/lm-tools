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
import { moveDir as ftpMoveDir, MoveDirOptions as FtpsMoveDirOptions } from '../../../ftps/directory/move-dir/index.js'
import { moveDir as sftpMoveDir, MoveDirOptions as SftpMoveDirOptions } from '../../../sftp/directory/move-dir/index.js'
import { MoveDirOptions as S3MoveDirOptions, moveDir as s3MoveDir } from '../../../@aws-s3/storage/directory/move-dir/index.js'
import { MoveDirOptions as GcsMoveDirOptions, moveDir as gcsMoveDir } from '../../../@google-cloud/storage/directory/move-dir/index.js'

type Returned = Outcome.Either<true, string>

export async function moveDir (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsMoveDirOptions): Promise<Returned>
export async function moveDir (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3MoveDirOptions): Promise<Returned>
export async function moveDir (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsMoveDirOptions): Promise<Returned>
export async function moveDir (client: SftpClient, sourcePath: string, targetPath: string, options?: SftpMoveDirOptions): Promise<Returned>
export async function moveDir (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsMoveDirOptions | S3MoveDirOptions | FtpsMoveDirOptions | SftpMoveDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsMoveDir(client, sourcePath, targetPath, options as GcsMoveDirOptions)
  if (isS3ClientWithBucket(client)) return s3MoveDir(client.client, client.bucketName, sourcePath, targetPath, options as S3MoveDirOptions)
  if (isFtpClient(client)) return ftpMoveDir(client, sourcePath, targetPath, options as FtpsMoveDirOptions)
  if (isSftpClient(client)) return sftpMoveDir(client, sourcePath, targetPath, options as SftpMoveDirOptions)
  return Outcome.makeFailure('Invalid client type')
}
