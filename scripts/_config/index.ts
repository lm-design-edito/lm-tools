import process from 'node:process'
import path from 'node:path'
import fs from 'node:fs/promises'

// ROOT
export const CWD = process.cwd()
export const PKG_JSON = path.join(CWD, 'package.json')
export const LIB = path.join(CWD, 'lib')
export const SRC = path.join(CWD, 'src')

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
