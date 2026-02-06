import {
  type Bucket,
  type FileOptions,
  type SetFileMetadataOptions
} from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'

export type UpdateFileMetadataOptions = {
  fileOptions?: FileOptions
  metadataOptions?: SetFileMetadataOptions
}

/**
 * Updates the metadata of a file in a Google Cloud Storage bucket.
 *
 * This function allows updating the metadata of a file located at `targetPath` in the given bucket.
 * The metadata is updated according to the provided `metadata` object, which contains the new metadata key-value pairs.
 * It can be customized using optional `fileOptions` and `metadataOptions` to control the update behavior.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket object containing the file whose metadata is being updated.
 * @param {string} targetPath - The path of the file whose metadata is to be updated.
 * @param {Record<string, any>} metadata - The metadata object containing key-value pairs to be set on the file.
 * @param {UpdateFileMetadataOptions} [options] - Optional configuration options for the metadata update operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(true)` indicating the metadata was successfully updated.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the metadata update operation fails.
 *
 * @throws {Error} Throws an error if the metadata update operation fails (e.g., file not found, insufficient permissions, etc.).
 */
export async function updateFileMetadata (
  bucket: Bucket,
  targetPath: string,
  metadata: Record<string, any>,
  options?: UpdateFileMetadataOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, metadataOptions } = options ?? {}
  try {
    const file = bucket.file(targetPath, fileOptions)
    await file.setMetadata(metadata, metadataOptions)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
