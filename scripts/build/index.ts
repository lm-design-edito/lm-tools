import { exec } from 'node:child_process'
import fs, { glob } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { camelCase } from 'change-case'
import esbuild from 'esbuild'
import { COMPONENTS, AGNOSTIC, NODE, LIB } from '../_config/index.js'
import * as Subpaths from '../../src/node/files/subpaths/index.js'

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Build
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const ROOT_DIRS = [COMPONENTS, AGNOSTIC, NODE]
const entryPoints = (await Promise.all(ROOT_DIRS.map(async dirPath => {
  return await Subpaths.list(dirPath, {
    directories: false,
    files: true,
    symlinks: false,
    hidden: false,
    followSimlinks: false,
    dedupeSimlinksContents: false,
    maxDepth: 100,
    returnRelative: false,
    filter: async path => {
      if (path.endsWith('.test.ts')) return false
      if (path.endsWith('.test.tsx')) return false
      if (path.endsWith('.test.js')) return false
      if (path.endsWith('.test.jsx')) return false
      return path.endsWith('index.ts')
        || path.endsWith('index.tsx')
        || path.endsWith('types.ts')
        || path.endsWith('types.tsx')
    }
  })
}))).flat()

console.log(entryPoints)

await new Promise((resolve, reject) => {
  esbuild.build({
    entryPoints,
    entryNames: '[dir]/[name]',
    chunkNames: 'chunks/[name]-[hash]',
    assetNames: 'assets/[name]-[hash]',
    outdir: LIB,
    bundle: true,
    minify: false,
    splitting: true,
    platform: 'node',
    sourcemap: false,
    format: 'esm',
    target: ['esnext'],
    external: ['*'],
    logLevel: 'info'
  }).then(() => {
    resolve(true)
  }).catch(err => {
    console.error(err)
    reject(err)
    process.exit(1)
  })
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Generate re-export files
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const everyDirBuilt = [LIB, ...await Subpaths.list(LIB, {
  directories: true,
  files: false,
  symlinks: false,
  followSimlinks: false,
  hidden: false,
  dedupeSimlinksContents: true,
  maxDepth: 100,
  returnRelative: false
})]

await Promise.all(everyDirBuilt.reverse().map(async dirpath => {
  const childrenFiles = await Subpaths.list(dirpath, {
    directories: false,
    files: true,
    symlinks: false,
    followSimlinks: false,
    hidden: false,
    dedupeSimlinksContents: true,
    maxDepth: 0,
    returnRelative: false
  })
  const childrenDirs = await Subpaths.list(dirpath, {
    directories: true,
    files: false,
    symlinks: false,
    followSimlinks: false,
    hidden: false,
    dedupeSimlinksContents: true,
    maxDepth: 0,
    returnRelative: false
  })
  const hasIndexJs = childrenFiles.some(file => file.endsWith('/index.js'))
  if (hasIndexJs) return true
  let reExportJsFileContents = ''
  let reExportDTsFileContents = ''
  await Promise.all(childrenDirs.map(async chiDir => {
    const childName = path.basename(chiDir)
    const childNameCamelCase = camelCase(childName)
    reExportJsFileContents += `export * as ${childNameCamelCase} from './${childName}/index.js'\n`
    reExportDTsFileContents += `export * as ${childNameCamelCase} from './${childName}/index.js'\n`
  }))
  if (reExportJsFileContents === '') { reExportJsFileContents = 'export {}\n' }
  if (reExportDTsFileContents === '') { reExportDTsFileContents = 'export {}\n' }
  await fs.writeFile(path.join(dirpath, 'index.js'), `${reExportJsFileContents}`, { encoding: 'utf-8' })
  await fs.writeFile(path.join(dirpath, 'index.d.ts'), `${reExportDTsFileContents}`, { encoding: 'utf-8' })
  console.log(`Created ${path.relative(LIB, dirpath)}/index.js`)
  console.log(`Created ${path.relative(LIB, dirpath)}/index.d.ts`)
  return true
}))

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Create type declarations
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

await new Promise(resolve => {
  const commands = [
    'npx tsc --jsx react-jsx -p src/agnostic/tsconfig.json --emitDeclarationOnly',
    'npx tsc --jsx react-jsx -p src/components/tsconfig.json --emitDeclarationOnly',
    'npx tsc --jsx react-jsx -p src/node/tsconfig.json --emitDeclarationOnly'
  ]
  exec(commands.join(' && '), (err, stdout, stderr) => {
    if (err !== null) console.error(err)
    if (stdout !== '') console.log(stdout)
    if (stderr !== '') console.log(stderr)
    resolve(true)
    console.log('Type declarations created')
  })
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Copy styles.module.css files
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const cssModulesFilesIterable = glob(`**/styles.module.css`, { cwd: COMPONENTS })
for await (const cssModuleRelPath of cssModulesFilesIterable) {
  await fs.cp(
    path.join(COMPONENTS, cssModuleRelPath),
    path.join(LIB, 'components', cssModuleRelPath),
    { recursive: true }
  )
}

console.log('')
console.log('Done.\n')
