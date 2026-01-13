import SftpClient from 'ssh2-sftp-client'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

export type RemoveOptions = {
  ignoreMissing?: boolean /* defaults to true */
}

/**
 * Deletes a file from a specified SFTP server.
 *
 * This function removes the file located at the given path on the SFTP server.
 * The deletion process can be customized using optional delete options.
 * If the `ignoreMissing` option is true, it does not treat a missing file as an error.
 *
 * @param {SftpClient} sftp - The ssh2-sftp-client instance used to interact with the SFTP server.
 * @param {string} targetPath - The path of the file to delete on the SFTP server.
 * @param {RemoveOptions} [options] - Optional settings for configuring the deletion process.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) indicating the deletion was successful.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the deletion fails.
 */
export async function remove (
  sftp: SftpClient,
  targetPath: string,
  options?: RemoveOptions
): Promise<Outcome.Either<true, string>> {
  const { ignoreMissing = true } = options ?? {}
  try {
    const exists = await sftp.exists(targetPath)
    if (!exists) {
      if (ignoreMissing) return Outcome.makeSuccess(true)
      return Outcome.makeFailure(`File not found at ${targetPath}.`)
    }
    await sftp.delete(targetPath)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
