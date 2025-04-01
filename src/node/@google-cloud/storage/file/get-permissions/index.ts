import { Bucket, FileOptions, GetAclOptions } from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../../agnostic/misc/outcome'

export type GetPermissionsOptions = {
  fileOptions?: FileOptions
  getAclOptions?: GetAclOptions
}

/**
 * Retrieves the access control list (ACL) for a file in Google Cloud Storage.
 *
 * This function fetches the ACL settings of a given file to determine the permissions assigned to different users or roles.
 *
 * @param {string} sourcePath - The path of the file whose permissions need to be retrieved.
 * @param {Bucket} bucket - The Google Cloud Storage bucket containing the file.
 * @param {GetPermissionsOptions} [options] - Optional configuration options for the file and ACL retrieval.
 * @returns {Promise<Outcome.Either<any, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(acl)` containing the file's ACL settings.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the ACL retrieval fails.
 */
export async function getPermissions (
  sourcePath: string,
  bucket: Bucket,
  options?: GetPermissionsOptions
): Promise<Outcome.Either<any, string>> {
  const { fileOptions, getAclOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    const [acl] = await file.acl.get(getAclOptions)
    return Outcome.makeSuccess(acl)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
