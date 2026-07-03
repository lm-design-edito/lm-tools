/**
 * Represents a successful outcome.
 *
 * @template Payload - The type of the success payload.
 * @property success - Always `true`.
 * @property payload - The success value.
 */
export type Success<Payload = any> = { success: true, payload: Payload }

/**
 * Represents a failed outcome.
 *
 * @template Error - The type of the error.
 * @property success - Always `false`.
 * @property error - The error value.
 */
export type Failure<Error = any> = { success: false, error: Error }

/**
 * Represents either a success or a failure outcome.
 *
 * @template Payload - Type of success payload.
 * @template Error - Type of error.
 */
export type Either<Payload = any, Error = any> = Success<Payload> | Failure<Error>

/**
 * Creates a success outcome with the given payload.
 *
 * @template Payload
 * @param payload - The success value.
 * @returns A success outcome object.
 */
export function makeSuccess<Payload> (payload: Payload): Success<Payload> { return { success: true, payload } }

/**
 * Creates a failure outcome with the given error.
 *
 * @template Error
 * @param error - The error value.
 * @returns A failure outcome object.
 */
export function makeFailure<Error> (error: Error): Failure<Error> { return { success: false, error } }

/**
 * Creates either a success or failure outcome based on a boolean flag.
 *
 * @template Payload
 * @template Error
 * @param success - `true` to create a success, `false` to create a failure.
 * @param payloadOrError - The payload if success, or the error if failure.
 * @returns The resulting outcome.
 */
export function make<Payload> (
  success: true,
  payload: Payload
): Success<Payload>
export function make<Error> (
  success: false,
  error: Error
): Failure<Error>
export function make<Payload, Error> (
  success: boolean,
  payloadOrError: Payload | Error
): Success<Payload> | Failure<Error> {
  return success
    ? makeSuccess(payloadOrError as Payload)
    : makeFailure(payloadOrError as Error)
}
