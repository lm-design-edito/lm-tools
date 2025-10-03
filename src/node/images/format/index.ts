import sharp from 'sharp'
import zod from 'zod'
import { clamp } from '../../../agnostic/numbers/clamp'
import { Outcome } from '../../../agnostic/misc/outcome'
import { isSharpColor } from '../transform/utils'

/* * * * * * * * * * * * * * * 
 * TYPES
 * * * * * * * * * * * * * * */
export type ImageFileType = keyof sharp.FormatEnum

export type FormatCommonOptions = {
  width?: number
  height?: number
  fit?: sharp.ResizeOptions['fit']
  position?: number | string
  background?: sharp.Color
  kernel?: keyof sharp.KernelEnum
  withoutEnlargement?: boolean
  withoutReduction?: boolean
  fastShrinkOnLoad?: boolean
}
export type FormatJpgOptions = FormatCommonOptions & { quality?: number }
export type FormatPngOptions = FormatCommonOptions & {
  quality?: number
  compressionLevel?: sharp.PngOptions['compressionLevel']
}
export type FormatWebpOptions = FormatCommonOptions & { quality?: number }
export type FormatAvifOptions = FormatCommonOptions & { quality?: number }
export type FormatTiffOptions = FormatCommonOptions & {
  quality?: number
  compression?: sharp.TiffOptions['compression']
}
export type FormatHeifOptions = FormatCommonOptions & { quality?: number }
export type FormatKeepOptions = FormatCommonOptions
export type FormatOptions = FormatJpgOptions | FormatPngOptions | FormatWebpOptions | FormatAvifOptions | FormatTiffOptions | FormatHeifOptions

/* * * * * * * * * * * * * * * 
 * SCHEMAS
 * * * * * * * * * * * * * * */

const formatCommonOptionsSchema = zod.object({
  width: zod.number().optional(),
  height: zod.number().optional(),
  fit: zod.enum(['contain', 'cover', 'fill', 'inside', 'outside']).optional(),
  position: zod.union([zod.number(), zod.string()]).optional(),
  background: zod.custom<sharp.Color>((val) => isSharpColor(val)).optional(),
  kernel: zod.enum(['nearest', 'cubic', 'mitchell', 'lanczos2', 'lanczos3']).optional(),
  withoutEnlargement: zod.boolean().optional(),
  withoutReduction: zod.boolean().optional(),
  fastShrinkOnLoad: zod.boolean().optional()
})
const formatJpgOptionsSchema = formatCommonOptionsSchema.extend({ quality: zod.number().optional() })
const formatPngOptionsSchema = formatCommonOptionsSchema.extend({
  quality: zod.number().optional(),
  compressionLevel: zod.number().min(0).max(9).optional()
})
const formatWebpOptionsSchema = formatCommonOptionsSchema.extend({ quality: zod.number().optional() })
const formatAvifOptionsSchema = formatCommonOptionsSchema.extend({ quality: zod.number().optional() })
const formatTiffOptionsSchema = formatCommonOptionsSchema.extend({
  quality: zod.number().optional(),
  compression: zod.enum(['none', 'jpeg', 'deflate', 'packbits', 'ccittfax4', 'lzw', 'webp', 'zstd', 'jp2k']).optional()
})
const formatHeifOptionsSchema = formatCommonOptionsSchema.extend({ quality: zod.number().optional() })
const formatKeepOptionsSchema = formatCommonOptionsSchema
const formatOptionsSchema = zod.union([
  formatJpgOptionsSchema,
  formatPngOptionsSchema,
  formatWebpOptionsSchema,
  formatAvifOptionsSchema,
  formatTiffOptionsSchema,
  formatHeifOptionsSchema,
  formatKeepOptionsSchema
])

/* * * * * * * * * * * * * * * 
 * TYPECHECKS
 * * * * * * * * * * * * * * */

export const isFormatCommonOptions = (options: unknown): options is FormatCommonOptions => formatCommonOptionsSchema.safeParse(options).success
export const isFormatJpgOptions = (options: unknown): options is FormatJpgOptions => formatJpgOptionsSchema.safeParse(options).success
export const isFormatPngOptions = (options: unknown): options is FormatPngOptions => formatPngOptionsSchema.safeParse(options).success
export const isFormatWebpOptions = (options: unknown): options is FormatWebpOptions => formatWebpOptionsSchema.safeParse(options).success
export const isFormatAvifOptions = (options: unknown): options is FormatAvifOptions => formatAvifOptionsSchema.safeParse(options).success
export const isFormatTiffOptions = (options: unknown): options is FormatTiffOptions => formatTiffOptionsSchema.safeParse(options).success
export const isFormatHeifOptions = (options: unknown): options is FormatHeifOptions => formatHeifOptionsSchema.safeParse(options).success
export const isFormatKeepOptions = (options: unknown): options is FormatKeepOptions => formatKeepOptionsSchema.safeParse(options).success
export const isFormatOptions = (options: unknown): options is FormatOptions => formatOptionsSchema.safeParse(options).success

/* * * * * * * * * * * * * * * 
 * FUNCTIONS
 * * * * * * * * * * * * * * */

export async function format (input: Buffer, type: 'jpg' | 'jpeg', options: FormatJpgOptions): Promise<Outcome.Either<Buffer, string>>
export async function format (input: Buffer, type: 'png', options: FormatPngOptions): Promise<Outcome.Either<Buffer, string>>
export async function format (input: Buffer, type: 'webp', options: FormatWebpOptions): Promise<Outcome.Either<Buffer, string>>
export async function format (input: Buffer, type: 'avif', options: FormatAvifOptions): Promise<Outcome.Either<Buffer, string>>
export async function format (input: Buffer, type: 'tiff', options: FormatTiffOptions): Promise<Outcome.Either<Buffer, string>>
export async function format (input: Buffer, type: 'heif', options: FormatHeifOptions): Promise<Outcome.Either<Buffer, string>>
export async function format (input: Buffer, type: string, options: FormatKeepOptions): Promise<Outcome.Either<Buffer, string>>
export async function format (input: Buffer, options: FormatKeepOptions): Promise<Outcome.Either<Buffer, string>>
export async function format (
  input: Buffer,
  typeOrOptions: string | FormatKeepOptions,
  options?: FormatOptions
): Promise<Outcome.Either<Buffer, string>> {
  const sharpInstance = sharp(input)
  if (typeof typeOrOptions !== 'string') return Outcome.makeSuccess(await sharpInstance.resize(typeOrOptions).toBuffer())
  const type = typeOrOptions
  if (type === 'jpg' || type === 'jpeg') return Outcome.makeSuccess(await sharpInstance.resize(options).jpeg(options as FormatJpgOptions).toBuffer())
  if (type === 'png') return Outcome.makeSuccess(await sharpInstance.resize(options).png(options as FormatPngOptions).toBuffer())
  if (type === 'webp') return Outcome.makeSuccess(await sharpInstance.resize(options).webp(options as FormatWebpOptions).toBuffer())
  if (type === 'avif') return Outcome.makeSuccess(await sharpInstance.resize(options).avif(options as FormatAvifOptions).toBuffer())
  if (type === 'tiff') return Outcome.makeSuccess(await sharpInstance.resize(options).tiff(options as FormatTiffOptions).toBuffer())
  if (type === 'heif') return Outcome.makeSuccess(await sharpInstance.resize(options).heif(options as FormatHeifOptions).toBuffer())
  return Outcome.makeFailure(`Invalid image format: ${type}`)
}

// [WIP] not sure about clamp values
export const toWidth = async (input: Buffer, width: number): Promise<Buffer> => sharp(input).resize({ width }).toBuffer()
export const toHeight = async (input: Buffer, height: number): Promise<Buffer> => sharp(input).resize({ height }).toBuffer()
export const toJpg = async (input: Buffer, quality?: number): Promise<Buffer> => sharp(input).jpeg({ quality: clamp(quality ?? 100, 1, 100) }).toBuffer()
export const toPng = async (input: Buffer, quality?: number, compressionLevel?: sharp.PngOptions['compressionLevel']): Promise<Buffer> => sharp(input).png({ quality: clamp(quality ?? 100, 1, 100), compressionLevel }).toBuffer()
export const toWebp = async (input: Buffer, quality?: number): Promise<Buffer> => sharp(input).webp({ quality: clamp(quality ?? 100, 1, 100) }).toBuffer()
export const toAvif = async (input: Buffer, quality?: number): Promise<Buffer> => sharp(input).avif({ quality: clamp(quality ?? 100, 1, 100) }).toBuffer()
export const toTiff = async (input: Buffer, quality?: number, compression?: sharp.TiffOptions['compression']): Promise<Buffer> => sharp(input).tiff({ quality: clamp(quality ?? 100, 1, 100), compression }).toBuffer()
export const toHeif = async (input: Buffer, quality?: number): Promise<Buffer> => sharp(input).heif({ quality: clamp(quality ?? 100, 1, 100) }).toBuffer()
