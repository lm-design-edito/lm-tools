import * as inquirer from '@inquirer/prompts'

/**
 * Prompts the user with a yes/no confirmation in the terminal.
 *
 * @param {string} [message] - The message to display in the prompt. Defaults to "Continue?" if not provided.
 * @param {boolean} [throws=false] - If true, the function will throw an error when the user declines.
 * @returns {Promise<boolean>} - Resolves to `true` if the user confirms, `false` if the user declines and `throws` is false.
 *
 * @throws {Error} - Throws an error with message 'Aborted' if the user declines and `throws` is true.
 *
 * @example
 * const result = await promptContinue('Do you want to proceed?');
 * if (result) {
 *   console.log('User confirmed');
 * } else {
 *   console.log('User declined');
 * }
 */
export async function promptContinue (
  message?: string,
  throws: boolean = false
): Promise<boolean> {
  console.log('')
  const answer = await inquirer.confirm({
    message: message ?? 'Continue?',
    default: false
  })
  if (answer) return true
  if (throws) throw new Error('Aborted')
  return false
}
