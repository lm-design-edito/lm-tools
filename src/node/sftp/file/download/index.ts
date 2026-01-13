import { Readable } from 'node:stream'
import { ClientErrorExtensions, ReadStreamOptions } from 'ssh2'
import Client from 'ssh2-sftp-client'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

export type DownloadOptions = ReadStreamOptions

/**
 * Downloads a file from a specified SFTP server.
 *
 * This function downloads a file from the given SFTP server at the specified source path,
 * returning the file content as a Readable stream. The download process can be customized
 * using optional download options.
 *
 * @param {Client} sftp - The ssh2-sftp-client instance used to interact with the SFTP server.
 * @param {string} sourcePath - The path of the file to be downloaded from the SFTP server.
 * @param {DownloadOptions} [options] - Optional settings for configuring the download process.
 * @returns {Promise<Outcome.Either<Readable, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(stream) containing the downloaded file's content as a Readable stream.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the download fails.
 */
export async function download (
  sftp: Client,
  sourcePath: string,
  options?: DownloadOptions
): Promise<Outcome.Either<Readable, string>> {
  try {
    const stream = sftp.createReadStream(sourcePath, options)
    stream.on('error', (err: Error & ClientErrorExtensions) => { throw err })
    return Outcome.makeSuccess(stream)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
