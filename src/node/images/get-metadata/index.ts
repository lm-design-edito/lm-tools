import { Buffer } from 'node:buffer'
import sharp from 'sharp'

export async function getMetadata (imageInput: Buffer): Promise<sharp.Metadata>
export async function getMetadata (imageInput: sharp.Sharp): Promise<sharp.Metadata>
export async function getMetadata (imageInput: sharp.Sharp | Buffer): Promise<sharp.Metadata> {
  const sharpInstance: sharp.Sharp = Buffer.isBuffer(imageInput) ? sharp(imageInput) : imageInput
  return sharpInstance.metadata()
}
