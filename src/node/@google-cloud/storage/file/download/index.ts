import { Readable } from 'node:stream'
import { Bucket, FileOptions, DownloadOptions as GCSFileDownloadOptions } from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'

export type DownloadOptions = {
  fileOptions?: FileOptions
  downloadOptions?: GCSFileDownloadOptions
}

/**
 * Downloads a file from a specified Google Cloud Storage bucket.
 *
 * This function downloads a file from the given bucket and path, returning the file content as a `Readable`.
 * The download process can be customized using optional `fileOptions` and `downloadOptions`.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket object from which to download the file.
 * @param {string} sourcePath - The path of the file to be downloaded in the bucket.
 * @param {DownloadOptions} [options] - Optional configuration options for the download.
 * @returns {Promise<Outcome.Either<Readable, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(stream)` containing the downloaded file's content as a `Readable`.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the download fails.
 */
export async function download (
  bucket: Bucket,
  sourcePath: string,
  options?: DownloadOptions 
): Promise<Outcome.Either<Readable, string>> {
  const { fileOptions, downloadOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    const stream = file.createReadStream(downloadOptions)
    stream.on('error', (err) => { throw err })
    return Outcome.makeSuccess(stream)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
