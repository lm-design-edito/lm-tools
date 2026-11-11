/**
 * Represents a successful outcome.
 *
 * @template Payload - The type of the success payload.
 * @property success - Always `true`.
 * @property payload - The success value.
 */
export type Success<Payload = unknown> = { success: true, payload: Payload }

/**
 * Represents a failed outcome.
 *
 * @template Error - The type of the error.
 * @property success - Always `false`.
 * @property error - The error value.
 */
export type Failure<Error = unknown> = { success: false, error: Error }

/**
 * Represents either a success or a failure outcome.
 *
 * @template Payload - Type of success payload.
 * @template Error - Type of error.
 */
export type Either<Payload = unknown, Error = unknown> = Success<Payload> | Failure<Error>

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guaranteed by the overload signatures above; the implementation signature can't express that link
    ? makeSuccess(payloadOrError as Payload)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guaranteed by the overload signatures above; the implementation signature can't express that link
    : makeFailure(payloadOrError as Error)
}

/**
 * Reads the payload of an outcome, falling back to a given value on a failure.
 *
 * @template Payload - The type of the success payload.
 * @template Fallback - The type of the value returned on a failure.
 * @param outcome - The outcome to read.
 * @param fallback - What to return when the outcome is a failure. Required, so
 * that a caller wanting the absent case says `undefined` at the call site.
 * @returns The payload on a success, `fallback` on a failure.
 */
export function getPayload<Payload, Fallback> (
  outcome: Either<Payload, unknown>,
  fallback: Fallback
): Payload | Fallback {
  return outcome.success ? outcome.payload : fallback
}

/**
 * Reads the error of an outcome, falling back to a given value on a success.
 *
 * @template Error - The type of the error.
 * @template Fallback - The type of the value returned on a success.
 * @param outcome - The outcome to read.
 * @param fallback - What to return when the outcome is a success, where there is
 * no error at all. Required, like `getPayload`'s.
 * @returns The error on a failure, `fallback` on a success.
 */
export function getError<Error, Fallback> (
  outcome: Either<unknown, Error>,
  fallback: Fallback
): Error | Fallback {
  return outcome.success ? fallback : outcome.error
}
