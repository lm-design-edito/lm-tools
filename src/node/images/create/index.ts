import sharp from 'sharp'
import { toCreateOptions } from '../utils/index.js'
import type { CreateOptions } from '../types.js'

/**
 * Creates a new image using Sharp with the specified options.
 *
 * @param options - Image creation options. See `CreateOptions` for details.
 * @returns A Sharp instance ready for further image operations.
 */
export async function create (options: CreateOptions): Promise<sharp.Sharp> {
  return sharp({ create: toCreateOptions(options) })
}
