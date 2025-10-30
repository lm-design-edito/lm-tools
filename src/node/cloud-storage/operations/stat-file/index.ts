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
import { Stat as FtpStat, stat as ftpStat } from '../../../ftps/file/stat/index.js'
import { Stat as SftpStat, stat as sftpStat } from '../../../sftp/file/stat/index.js'
import { Stat as S3Stat, StatOptions as S3StatOptions, stat as s3Stat } from '../../../@aws-s3/storage/file/stat/index.js'
import { Stat as GcsStat, StatOptions as GcsStatOptions, stat as gcsStat } from '../../../@google-cloud/storage/file/stat/index.js'

type Returned<K extends FtpStat | SftpStat | S3Stat | GcsStat> = Outcome.Either<K, string>

export async function statFile (client: GCSBucket, path: string, options?: GcsStatOptions): Promise<Returned<GcsStat>>
export async function statFile (client: S3ClientWithBucket, path: string, options?: S3StatOptions): Promise<Returned<S3Stat>>
export async function statFile (client: FtpClient, path: string): Promise<Returned<FtpStat>>
export async function statFile (client: SftpClient, path: string): Promise<Returned<SftpStat>>
export async function statFile (client: AnyClient, path: string, options?: GcsStatOptions | S3StatOptions): Promise<Returned<GcsStat | S3Stat | FtpStat | SftpStat>> {
  if (isGcsBucket(client)) return gcsStat(client, path, options as GcsStatOptions)
  if (isS3ClientWithBucket(client)) return s3Stat(client.client, path, client.bucketName, options as S3StatOptions)
  if (isFtpClient(client)) return ftpStat(client, path)
  if (isSftpClient(client)) return sftpStat(client, path)
  return Outcome.makeFailure('Invalid client type')
}
