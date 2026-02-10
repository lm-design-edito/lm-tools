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

type ThisOptions = {
  argsPrintFormat?: (args: string[]) => string[]
  throwOnError?: boolean
}

/**
 * Options for the asynchronous `spawner` function.
 *
 * Extends Node.js `SpawnOptions` with additional behaviors specific to this utility.
 *
 * - `argsPrintFormat`: Optional function used to transform the command arguments
 *   before they are printed to the console (does not affect execution).
 * - `throwOnError`: If `true`, the function throws when the spawned process exits
 *   with a non-zero status instead of returning a failure outcome.
 */
export type Options = SpawnOptions & ThisOptions

/**
 * Options for the synchronous `spawnerSync` function.
 *
 * Extends Node.js `SpawnSyncOptions` with additional behaviors specific to this utility.
 *
 * - `argsPrintFormat`: Optional function used to transform the command arguments
 *   before they are printed to the console (does not affect execution).
 * - `throwOnError`: If `true`, the function throws when the spawned process exits
 *   with a non-zero status instead of returning a failure outcome.
 */
export type SyncOptions = SpawnSyncOptions & ThisOptions

/**
 * Spawns a child process asynchronously and logs its execution and output.
 *
 * Stdout and stderr are streamed, logged in real time, and collected.
 * The result is returned as an `Outcome.Either`, representing success or failure.
 *
 * @param label - Optional label printed before execution to visually group logs.
 * @param command - The command to execute.
 * @param args - Arguments passed to the command.
 * @param options - Optional spawn configuration and utility-specific options:
 *   - `argsPrintFormat`: Function to format arguments for logging.
 *   - `throwOnError`: If `true`, rejects on non-zero exit code instead of resolving a failure.
 * @returns A promise resolving to an `Outcome.Either`:
 *   - success: `{ stdout, stderr, err }` when the command exits with code `0`
 *   - failure: `{ stdout, stderr, err }` when the command exits with a non-zero code
 */
export async function spawner (
  label: string | null,
  command: string,
  args: string[],
  options?: Options
): Promise<Outcome.Either<Output, Output>> {
  return await new Promise<Outcome.Either<Output, Output>>((resolve, reject) => {
    if (label !== null) console.log('\n' + styles.info(label) + '\n')
    const printableArgs = options?.argsPrintFormat !== undefined
      ? options.argsPrintFormat(args)
      : args
    console.log(styles.light(`> ${command} ${printableArgs.join(' ')}\n`))
    const prcss = spawn(command, args, { stdio: 'pipe', ...options })
    let stdout = ''
    let stderr = ''
    let err: unknown = null
    prcss.stdout?.on('data', data => {
      const strData = unknownToString(data)
      stdout += strData
      console.log(styles.light(strData.replace(ansiRegex(), '').trim()))
    })
    prcss.stderr?.on('data', data => {
      const strData = unknownToString(data)
      stderr += strData
      console.log(styles.warning(strData.replace(ansiRegex(), '').trim()))
    })
    prcss.on('error', e => {
      err = e
      console.log(styles.error(unknownToString(err).replace(ansiRegex(), '').trim()))
    })
    prcss.on('close', code => {
      if (code !== 0 && options?.throwOnError === true) reject(new Error(stderr + '\n' + stdout))
      else if (code !== 0) return resolve(Outcome.makeFailure({ stdout, stderr, err }))
      else return resolve(Outcome.makeSuccess({ stdout, stderr, err }))
    })
  })
}

/**
 * Spawns a child process synchronously and logs its execution and output.
 *
 * Stdout, stderr, and execution errors are logged after the process completes.
 * The result is returned as an `Outcome.Either`, representing success or failure.
 *
 * @param label - Optional label printed before execution to visually group logs.
 * @param command - The command to execute.
 * @param args - Arguments passed to the command.
 * @param options - Optional spawn configuration and utility-specific options:
 *   - `argsPrintFormat`: Function to format arguments for logging.
 *   - `throwOnError`: If `true`, throws on non-zero exit code instead of returning a failure.
 * @returns An `Outcome.Either`:
 *   - success: `{ stdout, stderr, err }` when the command exits with code `0`
 *   - failure: `{ stdout, stderr, err }` when the command exits with a non-zero code
 * @throws Error if `throwOnError` is `true` and the process exits with a non-zero status
 */
export function spawnerSync (
  label: string | null,
  command: string,
  args: string[],
  options?: SyncOptions
): Outcome.Either<Output, Output> {
  if (label !== null) console.log('\n' + styles.info(label) + '\n')
  const printableArgs = options?.argsPrintFormat !== undefined
    ? options.argsPrintFormat(args)
    : args
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
  if (stderr !== '') {
    console.log(styles.light(chalk.italic('stderr:\n')))
    console.log(styles.warning(stderr.replace(ansiRegex(), '')))
    console.log('')
  }
  if (stdout !== '') {
    console.log(styles.light(chalk.italic('stdout:\n')))
    console.log(styles.light(stdout.replace(ansiRegex(), '')))
    console.log('')
  }
  if (result.status !== 0 && options?.throwOnError === true) throw new Error(stderr + '\n' + stdout)
  else if (result.status !== 0) return Outcome.makeFailure({ stdout, stderr, err })
  return Outcome.makeSuccess({ stdout, stderr, err })
}
