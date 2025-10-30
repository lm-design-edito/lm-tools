import { Readable } from 'node:stream'
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
import { DownloadOptions as FtpDownloadOptions, download as ftpDownload } from '../../../ftps/file/download/index.js'
import { DownloadOptions as SftpDownloadOptions, download as sftpDownload } from '../../../sftp/file/download/index.js'
import { DownloadOptions as S3DownloadOptions, download as s3Download } from '../../../@aws-s3/storage/file/download/index.js'
import { DownloadOptions as GcsDownloadOptions, download as gcsDownload } from '../../../@google-cloud/storage/file/download/index.js'

type Returned = Outcome.Either<Readable, string>

export async function downloadFile (client: GCSBucket, path: string, options?: GcsDownloadOptions): Promise<Returned>
export async function downloadFile (client: S3ClientWithBucket, path: string, options?: S3DownloadOptions): Promise<Returned>
export async function downloadFile (client: FtpClient, path: string, options?: FtpDownloadOptions): Promise<Returned>
export async function downloadFile (client: SftpClient, path: string, options?: SftpDownloadOptions): Promise<Returned>
export async function downloadFile (client: AnyClient, path: string, options?: GcsDownloadOptions | S3DownloadOptions | FtpDownloadOptions | SftpDownloadOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsDownload(client, path, options as GcsDownloadOptions)
  if (isS3ClientWithBucket(client)) return s3Download(client.client, client.bucketName, path, options as S3DownloadOptions)
  if (isFtpClient(client)) return ftpDownload(client, path, options as FtpDownloadOptions)
  if (isSftpClient(client)) return sftpDownload(client, path, options as SftpDownloadOptions)
  return Outcome.makeFailure('Invalid client type')
}
