import { Client } from 'basic-ftp'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

export type RemoveOptions = {
  ignoreMissing?: boolean /* defaults to true */
}

/**
 * Removes a file from a specified FTP server.
 *
 * This function removes the file located at the given path on the FTP server.
 * The deletion process can be customized using optional delete options.
 * If the `ignoreMissing` option is true, it does not treat a missing file as an error.
 *
 * @param {Client} ftpClient - The basic-ftp client instance used to interact with the FTP server.
 * @param {string} targetPath - The path of the file to delete on the FTP server.
 * @param {RemoveOptions} [options] - Optional settings for configuring the deletion process.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) indicating the deletion was successful.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the deletion fails.
 */
export async function remove (
  ftpClient: Client,
  targetPath: string,
  options?: RemoveOptions
): Promise<Outcome.Either<true, string>> {
  const { ignoreMissing = true } = options ?? {}
  try {
    let fileExists = true
    try { await ftpClient.size(targetPath) }
    catch { fileExists = false }
    if (!fileExists) {
      if (ignoreMissing) { return Outcome.makeSuccess(true) }
      return Outcome.makeFailure(`File not found at ${targetPath}.`)
    }
    await ftpClient.remove(targetPath)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
