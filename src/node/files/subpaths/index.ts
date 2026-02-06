/* eslint-disable @typescript-eslint/no-throw-literal */

import { type Stats, promises as fs } from 'node:fs'
import path from 'node:path'
import { matchesSome as stringMatchesSome } from '../../../agnostic/strings/matches/index.js'

/** Type of child entry in a directory. */
export type ChildType = 'file' | 'directory' | 'symlink'

export type ChildDetails = {
  /** The type of the child entry. */ type: ChildType
  /** Whether the child entry is hidden (starts with '.'). */ hidden: boolean
  /** The real path of the child entry (resolved if it's a symlink). */ realPath: string
}

/* List context */

export type ListContext = {
  /** Current recursion depth. */ depth?: number
  /** Cached lstat result for the current path. */ lstats?: Stats | null
  /** Root path from which the listing started. */ rootPath?: string | null
}

export const defaultListContext: Required<ListContext> = {
  depth: 0,
  lstats: null,
  rootPath: null
}

/**
 * Fills missing properties in a list context with default values.
 *
 * @param {ListContext} input - The partial list context to fill.
 * @returns {Required<ListContext>} A complete list context with all properties set.
 */
export const fillListContext = (input: ListContext): Required<ListContext> => {
  return {
    ...defaultListContext,
    ...input
  }
}

/* List options */

export type ListOptions = {
  /** Whether to include directories in the results. @default true */ directories?: boolean
  /** Whether to include files in the results. @default true */ files?: boolean
  /** Whether to include symlinks in the results. @default true */ symlinks?: boolean
  /** Whether to include hidden files/directories (starting with '.'). @default true */ hidden?: boolean
  /** Whether to follow symlinks and include their contents. @default false */ followSimlinks?: boolean
  /** Whether to deduplicate paths when following symlinks. @default false */ dedupeSimlinksContents?: boolean
  /** Maximum recursion depth. @default Infinity */ maxDepth?: number
  /** Whether to return relative paths instead of absolute paths. @default false */ returnRelative?: boolean
  /** Patterns to exclude from the results. */ exclude?: RegExp | string | Array<RegExp | string> | null
  /** Patterns to include in the results (takes precedence over exclude). */ include?: RegExp | string | Array<RegExp | string> | null
  /** Custom filter function to further refine results. */ filter?: ((path: string, details: ChildDetails) => boolean | Promise<boolean>)
}

export const defaultListOptions: Required<ListOptions> = {
  directories: true,
  files: true,
  symlinks: true,
  hidden: true,
  followSimlinks: false,
  dedupeSimlinksContents: false,
  maxDepth: Infinity,
  returnRelative: false,
  exclude: null,
  include: null,
  filter: () => true
}

/**
 * Fills missing properties in list options with default values.
 *
 * @param {ListOptions} input - The partial list options to fill.
 * @returns {Required<ListOptions>} A complete list options object with all properties set.
 */
export const fillOptions = (input: ListOptions): Required<ListOptions> => {
  return {
    ...defaultListOptions,
    ...input
  }
}

/**
 * Lists all subpaths under a given directory path.
 *
 * The function recursively traverses the directory tree and returns all matching
 * files, directories, and symlinks based on the provided options.
 *
 * @param inputPath - The root directory path to list subpaths from.
 * @param [options] - Optional configuration for filtering and behavior. See `ListOptions` for details.
 * @returns Array of subpaths (absolute or relative based on `returnRelative` option).
 */
export async function list (...args: Parameters<typeof listAbsoluteSubpaths>): Promise<string[]> {
  const [inputPath, _options] = args
  const options = fillOptions(_options ?? {})
  const subpaths = await listAbsoluteSubpaths(...args)
  return options.returnRelative
    ? subpaths.map(subpath => path.relative(inputPath, subpath))
    : subpaths
}

/**
 * Internal function that lists absolute subpaths recursively.
 *
 * @param {string} inputPath              - The directory path to list.
 * @param {ListOptions} [_options]        - Optional configuration.
 * @param {ListContext} [__private_context] - Internal recursion context.
 * @returns {Promise<string[]>} Array of absolute subpaths.
 */
async function listAbsoluteSubpaths (
  inputPath: string,
  _options: ListOptions = {},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __private_context: ListContext = {}
): Promise<string[]> {
  const options = fillOptions(_options)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _private_context = fillListContext(__private_context)
  if (_private_context.rootPath === null) { _private_context.rootPath = inputPath }
  const subpaths: string[] = []
  if (_private_context.depth > options.maxDepth) return subpaths
  try {
    const pathStat = _private_context.lstats ?? await fs.lstat(inputPath)
    if (!pathStat.isDirectory()) return subpaths
  } catch (err) {
    return subpaths
  }
  const childrenRelPaths = await fs.readdir(inputPath)
  await Promise.all(childrenRelPaths.map(async childRelPath => {
    const childAbsPath = path.join(inputPath, childRelPath)
    const childRelFromRootPath = path.relative(_private_context.rootPath ?? inputPath, childAbsPath)
    const childLstats = await fs.lstat(childAbsPath)
    try {
      const isDirectory = childLstats.isDirectory()
      const isSymlink = childLstats.isSymbolicLink()
      const isFile = !isDirectory && !isSymlink
      const isHidden = path.basename(childAbsPath).startsWith('.')
      const type = isDirectory ? 'directory' : (isSymlink ? 'symlink' : 'file')
      if (isDirectory && !options.directories) throw true
      if (isSymlink && !options.symlinks) throw false
      if (isFile && !options.files) throw false
      if (isHidden && !options.hidden) throw false
      const realPath = isSymlink
        ? await fs.realpath(childAbsPath)
        : childAbsPath
      const childPathForFilters = options.returnRelative ? childRelFromRootPath : childAbsPath
      const isInExclude = stringMatchesSome(childPathForFilters, options.exclude ?? [])
      const isInInclude = stringMatchesSome(childPathForFilters, options.include ?? [])
      if (isInExclude && !isInInclude) throw false
      const isInFilter = await options.filter(childPathForFilters, { type, hidden: isHidden, realPath })
      if (!isInFilter) throw true
      if (isSymlink) {
        if (!options.followSimlinks) subpaths.push(childAbsPath)
        else {
          const childSubpaths = await listAbsoluteSubpaths(realPath, options, {
            ..._private_context,
            depth: _private_context.depth + 1
          })
          subpaths.push(realPath, ...childSubpaths)
        }
      } else {
        if (isDirectory) {
          const childSubpaths = await listAbsoluteSubpaths(childAbsPath, options, {
            ..._private_context,
            depth: _private_context.depth + 1,
            lstats: childLstats
          })
          subpaths.push(childAbsPath, ...childSubpaths)
        } else {
          subpaths.push(childAbsPath)
        }
      }
    } catch (err: unknown) {
      if (typeof err !== 'boolean') throw new Error('This try/catch block should only throw booleans')
      const shouldDiveDeeper = err
      if (!shouldDiveDeeper) return []
      const childSubpaths = await listAbsoluteSubpaths(childAbsPath, options, {
        ..._private_context,
        depth: _private_context.depth + 1,
        lstats: childLstats
      })
      subpaths.push(...childSubpaths)
    }
  }))

  return options.dedupeSimlinksContents
    ? Array.from(new Set(subpaths))
    : subpaths
}
