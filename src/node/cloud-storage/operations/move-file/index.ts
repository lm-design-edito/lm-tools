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

type Returned = Outcome.Either<true, string>

export async function moveFile (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsMoveOptions): Promise<Returned>
export async function moveFile (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3MoveOptions): Promise<Returned>
export async function moveFile (client: FtpClient, sourcePath: string, targetPath: string, options?: FtpsMoveOptions): Promise<Returned>
export async function moveFile (client: SftpClient, sourcePath: string, targetPath: string, options?: SftpMoveOptions): Promise<Returned>
export async function moveFile (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsMoveOptions | S3MoveOptions | FtpsMoveOptions | SftpMoveOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsMove(client, sourcePath, targetPath, options as GcsMoveOptions)
  if (isS3ClientWithBucket(client)) return s3Move(client.client, client.bucketName, sourcePath, targetPath, options as S3MoveOptions)
  if (isFtpClient(client)) return ftpMove(client, sourcePath, targetPath)
  if (isSftpClient(client)) return sftpMove(client, sourcePath, targetPath)
  return Outcome.makeFailure('Invalid client type')
}
