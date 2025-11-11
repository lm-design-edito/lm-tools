import sharp from 'sharp'
import { toCreateOptions } from '../utils/index.js'
import type { CreateOptions } from '../types.js'

export async function create (options: CreateOptions): Promise<sharp.Sharp> {
  return sharp({ create: toCreateOptions(options) })
}
