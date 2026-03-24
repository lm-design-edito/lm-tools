import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// [WIP] All this is kindof wrong, import.meta.url will be resolved
// from the file that imports this config.
export const THIS = fileURLToPath(import.meta.url)
export const SCRIPTS = path.join(THIS, '../..')
export const TEMP = path.join(SCRIPTS, '..')
export const ROOT = path.join(TEMP, '..')

// ROOT
export const PKG_JSON = path.join(ROOT, 'package.json')
export const LIB = path.join(ROOT, 'lib')
export const SRC = path.join(ROOT, 'src')

// Lib
export const LIB_INDEX = path.join(LIB, 'index.js')
export const LIB_PKG_JSON = path.join(LIB, 'package.json')

// Src
export const COMPONENTS = path.join(SRC, 'components')
export const AGNOSTIC = path.join(SRC, 'agnostic')
export const NODE = path.join(SRC, 'node')

// Deps
export const externalDeps: string[] = Object.keys(JSON.parse(
  await fs.readFile(
    PKG_JSON,
    { encoding: 'utf-8' }
  )
).dependencies)
