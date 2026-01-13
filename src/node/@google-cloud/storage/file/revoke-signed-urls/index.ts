import { Bucket } from '@google-cloud/storage'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { download, DownloadOptions } from '../download/index.js'
import { remove, RemoveOptions } from '../remove/index.js'
import { upload, UploadOptions } from '../upload/index.js'

export type RevokeSignedUrlsOptions = {
  downloadOptions?: DownloadOptions
  removeOptions?: RemoveOptions
  uploadOptions?: UploadOptions
}

/**
 * Revokes the signed URLs for a file in Google Cloud Storage by downloading the file,
 * deleting it, and re-uploading it to effectively invalidate any previously generated signed URLs.
 *
 * This function first attempts to download the file from the bucket, then removes the file,
 * and finally re-uploads the file to the same path. The re-upload effectively revokes any signed URLs that 
 * were generated for the file, as they are tied to the file's existence and content.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket containing the file.
 * @param {string} targetPath - The path of the file for which the signed URLs are to be revoked.
 * @param {RevokeSignedUrlsOptions} [options] - Optional configuration options for the file operations.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(true)` if the file has been successfully re-uploaded after deletion.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if any of the steps (download, remove, or upload) fail.
 */
export async function revokeSignedUrls (
  bucket: Bucket,
  targetPath: string,
  options?: RevokeSignedUrlsOptions
): Promise<Outcome.Either<true, string>> {
  const { downloadOptions, removeOptions, uploadOptions } = options ?? {} 
  const downloadAttempt = await download(bucket, targetPath, downloadOptions)
  if (!downloadAttempt.success) return downloadAttempt
  const deletionAttempt = await remove(bucket, targetPath, removeOptions)
  if (!deletionAttempt.success) return deletionAttempt
  const downloaded = downloadAttempt.payload
  const reuploadAttempt = await upload(bucket, targetPath, downloaded, uploadOptions)
  if (!reuploadAttempt.success) return reuploadAttempt
  return Outcome.makeSuccess(true)
}
