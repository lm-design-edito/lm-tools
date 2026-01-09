import { Bucket as GCSBucket } from '@google-cloud/storage'
import { S3Client } from '@aws-sdk/client-s3'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'

export type S3ClientWithBucket = {
  /** The name of the S3 bucket. */
  bucketName: string
  /** The AWS S3 client instance. */
  client: S3Client
}

/** Union type representing any supported cloud storage client. */
export type AnyClient = GCSBucket | S3ClientWithBucket | FtpClient | SftpClient

/**
 * Type guard to check if a client is a Google Cloud Storage bucket.
 *
 * @param {AnyClient} client - The client to check.
 * @returns {boolean} `true` if the client is a `GCSBucket`, `false` otherwise.
 */
export const isGcsBucket = (client: AnyClient): client is GCSBucket => client instanceof GCSBucket

/**
 * Type guard to check if a client is an S3 client with bucket configuration.
 *
 * @param {AnyClient} client - The client to check.
 * @returns {boolean} `true` if the client is an `S3ClientWithBucket`, `false` otherwise.
 */
export const isS3ClientWithBucket = (client: AnyClient): client is S3ClientWithBucket =>
  ('bucketName' in client)
  && typeof client.bucketName === 'string'
  && ('client' in client)
  && client.client instanceof S3Client

/**
 * Type guard to check if a client is an FTP client.
 *
 * @param {AnyClient} client - The client to check.
 * @returns {boolean} `true` if the client is an `FtpClient`, `false` otherwise.
 */
export const isFtpClient = (client: AnyClient): client is FtpClient => client instanceof FtpClient

/**
 * Type guard to check if a client is an SFTP client.
 *
 * @param {AnyClient} client - The client to check.
 * @returns {boolean} `true` if the client is an `SftpClient`, `false` otherwise.
 */
export const isSftpClient = (client: AnyClient): client is SftpClient => client instanceof SftpClient
