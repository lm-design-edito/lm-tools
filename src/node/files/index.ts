import { isInDirectory as isInDirectoryFunc } from './is-in-directory/index.js'
import {
  type EditorFunc as ReadWriteEditorFuncType,
  type Options as ReadWriteOptionsType,
  type Replacements as ReadWriteReplacementsType,
  readWrite as readWriteFunc
} from './read-write/index.js'
import { Subpaths as SubpathsNamespace } from './subpaths/index.js'

// [WIP] probably get rid of those re-exporting files

// Is in directory
export const isInDirectory = isInDirectoryFunc
  
// Read / write
export type ReadWriteEditorFunc = ReadWriteEditorFuncType
export type ReadWriteOptions = ReadWriteOptionsType
export type ReadWriteReplacements = ReadWriteReplacementsType
export const readWrite = readWriteFunc

// Subpaths
export import Subpaths = SubpathsNamespace
