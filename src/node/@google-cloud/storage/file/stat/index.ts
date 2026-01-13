import {
  Bucket,
  FileOptions,
  GetFileMetadataOptions,
  FileMetadata
} from '@google-cloud/storage'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

/** Provider‑agnostic view + strongly‑typed raw metadata */
export interface Stat {
  size?: number
  modifiedAt?: Date
  checksum?: string            // md5Hash (base64) or crc32c(hex)
  contentType?: string
  metadata?: Record<string, string | number | boolean | null>
  storageClass?: string
  raw: FileMetadata
}

export type StatOptions = {
  fileOptions?: FileOptions
  getMetadataOptions?: GetFileMetadataOptions
}

/**
 * Retrieves metadata for a single GCS object.
 *
 * @param {Bucket} bucket – GCS bucket.
 * @param {string} path  – Object path.
 * @param {StatOptions} [options] – Extra getMetadata options.
 * @returns {Promise<Outcome.Either<Stat, string>>}
 */
export async function stat (
  bucket: Bucket,
  path: string,
  options?: StatOptions
): Promise<Outcome.Either<Stat, string>> {
  const { fileOptions, getMetadataOptions } = options ?? {}

  try {
    const [meta] = await bucket
      .file(path, fileOptions)
      .getMetadata(getMetadataOptions)

    const res: Stat = {
      size: meta.size ? Number(meta.size) : undefined,
      modifiedAt: meta.updated ? new Date(meta.updated) : undefined,
      checksum: meta.md5Hash ?? meta.crc32c,
      contentType: meta.contentType,
      metadata: meta.metadata,
      storageClass: meta.storageClass,
      raw: meta
    }
    return Outcome.makeSuccess(res)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
