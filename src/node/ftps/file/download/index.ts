import { type Readable, PassThrough } from 'node:stream'
import { type Client } from 'basic-ftp'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

export type DownloadOptions = {
  startAt?: number
}

/**
 * Downloads a file from a specified FTP server.
 *
 * This function downloads a file from the given FTP server at the specified source path,
 * returning the file content as a Readable stream. The download process can be customized
 * using optional download options.
 *
 * @param {Client} ftpClient - The basic-ftp client instance used to interact with the FTP server.
 * @param {string} sourcePath - The path of the file to be downloaded from the FTP server.
 * @param {DownloadOptions} [options] - Optional settings for configuring the download process.
 * @param {number} [options.startAt] - The byte offset at which to start downloading the file.
 * @returns {Promise<Outcome.Either<Readable, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(stream) containing the downloaded file's content as a Readable stream.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the download fails.
 */
export async function download (
  ftpClient: Client,
  sourcePath: string,
  options?: DownloadOptions
): Promise<Outcome.Either<Readable, string>> {
  const { startAt } = options ?? {}
  const stream = new PassThrough()
  try {
    await ftpClient.downloadTo(stream, sourcePath, startAt)
    return Outcome.makeSuccess(stream)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
