import { isInDirectory as isInDirectoryFunc } from './is-in-directory/index.js'
import { ReadWriteEditorFunc as ReadWriteEditorFuncType, readWrite as readWriteFunc } from './read-write/index.js'
import { Subpaths as SubpathsNamespace } from './subpaths/index.js'

// Is in directory
export const isInDirectory = isInDirectoryFunc
  
// Read / write
export type ReadWriteEditorFunc = ReadWriteEditorFuncType
export const readWrite = readWriteFunc

// Subpaths
export import Subpaths = SubpathsNamespace
