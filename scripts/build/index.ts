import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { camelCase } from 'change-case'
import { SRC, COMPONENTS, AGNOSTIC, NODE, LIB } from '../_config/index.js'
import * as Subpaths from '../../src/node/files/subpaths/index.js'

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Build
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

spawnSync('rm', ['-rf', LIB])
spawnSync('cp', ['-r', SRC, LIB])

const toDeleteInLib = await Subpaths.list(LIB, {
  files: true,
  symlinks: false,
  hidden: true,
  followSimlinks: false,
  dedupeSimlinksContents: false,
  maxDepth: 100,
  returnRelative: true,
  filter: async file => {
    if (path.basename(file).startsWith('.')) return true
    if (file.endsWith('.ts')) return true
    if (file.endsWith('.tsx')) return true
    if (file.endsWith('.DS_Store')) return true
    if (file.endsWith('tsconfig.json')) return true
    return false
  }
})

await Promise.all(toDeleteInLib.map(async f => fs.unlink(path.join(LIB, f))))

for (const dir of [AGNOSTIC, NODE, COMPONENTS]) {
  const p = spawn('tsc', ['-p', path.join(dir, 'tsconfig.json')], { stdio: 'pipe' })
  p.stdout?.on('data', data => console.log(data.toString().trim()))
  p.stderr?.on('data', data => console.log(data.toString().trim()))
  p.on('error', e => console.log(e))
  await new Promise(res => p.on('close', res))
}

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

console.log('')
console.log('Done.\n')
