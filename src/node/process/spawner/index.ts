import {
  spawn,
  spawnSync,
  type SpawnOptions,
  type SpawnSyncOptions
} from 'node:child_process'
import ansiRegex from 'ansi-regex'
import chalk from 'chalk'
import * as Outcome from '../../../agnostic/misc/outcome/index.js'
import { styles } from '../../../agnostic/misc/logs/styles/index.js'
import { unknownToString } from '../../../agnostic/errors/unknown-to-string/index.js'

type Output = {
  stdout: string
  stderr: string
  err: unknown
}

export async function spawner (
  label: string | null,
  command: string, args: string[],
  argsPrintFormat?: (args: string[]) => string[],
  throwOnError?: boolean,
  options?: SpawnOptions
) {
  return new Promise<Outcome.Either<Output, Output>>((resolve, reject) => {
    if (label !== null) console.log('\n' + styles.info(label) + '\n')
    const printableArgs = argsPrintFormat !== undefined ? argsPrintFormat(args) : args
    console.log(styles.light(`> ${command} ${printableArgs.join(' ')}\n`))
    const prcss = spawn(command, args, { stdio: 'pipe', ...options })
    let stdout = ''
    let stderr = ''
    let err: unknown = null
    prcss.stdout?.on('data', data => {
      stdout += data.toString()
      console.log(styles.light(data.toString().replace(ansiRegex(), '').trim()))
    })
    prcss.stderr?.on('data', data => {
      stderr += data.toString()
      console.log(styles.warning(data.toString().replace(ansiRegex(), '').trim()))
    })
    prcss.on('error', e => {
      err = e
      console.log(styles.error(unknownToString(err).replace(ansiRegex(), '').trim()))
    })
    prcss.on('close', code => {
      if (code !== 0 && throwOnError === true) reject(stderr + '\n' + stdout)
      else if (code !== 0) return resolve(Outcome.makeFailure({ stdout, stderr, err }))
      else return resolve(Outcome.makeSuccess({ stdout, stderr, err }))
    })
  })
}

export function spawnerSync (
  label: string | null,
  command: string, args: string[],
  argsPrintFormat?: (args: string[]) => string[],
  throwOnError?: boolean,
  options?: SpawnSyncOptions
) {
  if (label !== null) console.log('\n' + styles.info(label) + '\n')
  const printableArgs = argsPrintFormat !== undefined ? argsPrintFormat(args) : args
  console.log(styles.light(`> ${command} ${printableArgs.join(' ')}\n`))
  const result = spawnSync(command, args, { stdio: 'pipe', encoding: 'utf8', ...options })
  const stderr = result.stderr?.toString().trim()
  const stdout = result.stdout?.toString().trim()
  const err = result.error
  if (err !== undefined) {
    console.log(styles.light(chalk.italic('err:\n')))
    console.log(styles.error(unknownToString(err).replace(ansiRegex(), '')))
    console.log('')
  }
  if (stderr) {
    console.log(styles.light(chalk.italic('stderr:\n')))
    console.log(styles.warning(stderr.replace(ansiRegex(), '')))
    console.log('')
  }
  if (stdout) {
    console.log(styles.light(chalk.italic('stdout:\n')))
    console.log(styles.light(stdout.replace(ansiRegex(), '')))
    console.log('')
  }
  if (result.status !== 0 && throwOnError === true) throw new Error(stderr + '\n' + stdout)
  else if (result.status !== 0) return Outcome.makeFailure({ stdout, stderr, err })
  return Outcome.makeSuccess({ stdout, stderr, err })
}
