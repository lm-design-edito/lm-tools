import * as Outcome from '../../misc/outcome/index.js'

/**
 * Runs a function and turns a throw into a value, so the caller decides what a
 * failure means instead of guarding the call site.
 *
 * @template Payload - What `run` returns when it does not throw.
 * @param run - The function to run.
 * @returns
 * - On success: `Outcome.makeSuccess(returnedValue)`
 * - On failure: `Outcome.makeFailure(thrownValue)`, the thrown value being
 *   `unknown` since anything can be thrown.
 */
export function tryCatch<Payload> (run: () => Payload): Outcome.Either<Payload, unknown> {
  try {
    return Outcome.makeSuccess(run())
  } catch (error) {
    return Outcome.makeFailure(error)
  }
}
