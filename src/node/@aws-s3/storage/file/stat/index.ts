import {
  S3Client,
  HeadObjectCommand,
  HeadObjectCommandInput,
  HeadObjectCommandOutput
} from '@aws-sdk/client-s3'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export interface Stat {
  size?: number
  modifiedAt?: Date
  checksum?: string          // ETag without quotes
  contentType?: string
  metadata?: Record<string, string>
  storageClass?: string
  raw: HeadObjectCommandOutput
}

export type StatOptions = {
  headObjectOptions?: Omit<HeadObjectCommandInput, 'Bucket' | 'Key'>
}

/**
 * Retrieves metadata for a single S3 object.
 *
 * @param {S3Client} client – v3 S3 client.
 * @param {string}   bucket – Bucket name.
 * @param {string}   key    – Object key.
 * @param {StatOptions} [options] – Extra HeadObject params.
 * @returns {Promise<Outcome.Either<Stat, string>>}
 */
export async function stat (
  client: S3Client,
  bucket: string,
  key: string,
  options?: StatOptions
): Promise<Outcome.Either<Stat, string>> {
  const { headObjectOptions } = options ?? {}

  try {
    const res = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key, ...headObjectOptions })
    )

    const stat: Stat = {
      size: res.ContentLength,
      modifiedAt: res.LastModified,
      checksum: res.ETag?.replace(/"/g, ''),
      contentType: res.ContentType,
      metadata: res.Metadata,
      storageClass: res.StorageClass,
      raw: res
    }
    return Outcome.makeSuccess(stat)
  } catch (err: any) {
    const notFound =
      err.$metadata?.httpStatusCode === 404 || err.name === 'NotFound'
    if (notFound) return Outcome.makeFailure(`Object not found: ${key}`)
    return Outcome.makeFailure(unknownToString(err))
  }
}
