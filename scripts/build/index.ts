import process from 'node:process'
import { promises as fs } from 'node:fs'
import { exec } from 'node:child_process'
import path from 'node:path'
import esbuild from 'esbuild'
import camelCase from 'camelcase'
import { COMPONENTS, AGNOSTIC, BROWSER, NODE, LIB } from '../_config/index.js'
import { findFirstDuplicate } from '../_utils/index.js'
import { Files } from '~/node/files/index.js'

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Build
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */
const rootDirs = [COMPONENTS, AGNOSTIC, BROWSER, NODE]
const entryPoints = (await Promise.all(rootDirs.map(async dirPath => {
  return await Files.Subpaths.list(dirPath, {
    directories: true,
    files: false,
    symlinks: false,
    hidden: false,
    followSimlinks: false,
    dedupeSimlinksContents: false,
    maxDepth: 100,
    returnRelative: false,
    filter: async (path: string) => {
      const children = await fs.readdir(path)
      return children.includes('index.ts')
    }
  })
}))).flat()

await new Promise((resolve, reject) => {
  esbuild.build({
    entryPoints,
    entryNames: '[dir]/[name]/index',
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
    external: ['chalk', 'jsdom', 'react', 'react-dom']
  }).then(() => {
    console.log('Build completed')
    resolve(true)
  }).catch(err => {
    console.error(err)
    reject(err)
    process.exit(1)
  })
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Create type declarations
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

await new Promise(resolve => {
  exec('npx tsc --jsx react-jsx -p src/tsconfig.json --emitDeclarationOnly', (err, stdout, stderr) => {
    if (err !== null) console.error(err)
    if (stdout !== '') console.log(stdout)
    if (stderr !== '') console.log(stderr)
    resolve(true)
    console.log('Type declarations created')
  })
})

console.log('')
console.log('Done.\n')
