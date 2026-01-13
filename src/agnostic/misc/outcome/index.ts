/**
 * Represents a successful outcome.
 *
 * @template Payload - The type of the success payload.
 * @property {true} success - Always `true`.
 * @property {Payload} payload - The success value.
 */
export type Success<Payload extends any = any> = { success: true, payload: Payload }
  
/**
 * Represents a failed outcome.
 *
 * @template Error - The type of the error.
 * @property {false} success - Always `false`.
 * @property {Error} error - The error value.
 */
export type Failure<Error extends any = any> = { success: false, error: Error }

/**
 * Represents either a success or a failure outcome.
 *
 * @template Payload - Type of success payload.
 * @template Error - Type of error.
 */
export type Either<Payload extends any = any, Error extends any = any> = Success<Payload> | Failure<Error>

/**
 * Creates a success outcome with the given payload.
 *
 * @template Payload
 * @param {Payload} payload - The success value.
 * @returns {Success<Payload>} A success outcome object.
 */
export function makeSuccess<Payload extends any> (payload: Payload): Success<Payload> { return { success: true, payload } }

/**
 * Creates a failure outcome with the given error.
 *
 * @template Error
 * @param {Error} error - The error value.
 * @returns {Failure<Error>} A failure outcome object.
 */
export function makeFailure<Error extends any> (error: Error): Failure<Error> { return { success: false, error } }

/**
 * Creates either a success or failure outcome based on a boolean flag.
 *
 * @template Payload
 * @template Error
 * @param {boolean} success - `true` to create a success, `false` to create a failure.
 * @param {Payload | Error} payloadOrError - The payload if success, or the error if failure.
 * @returns {Either<Payload, Error>} The resulting outcome.
 */
export function make<Payload extends any> (success: true, payload: Payload): Success<Payload>
export function make<Error extends any> (success: false, error: Error): Failure<Error>
export function make<Payload extends any, Error extends any> (success: boolean, payloadOrError: Payload | Error) {
  return success
    ? makeSuccess(payloadOrError as Payload)
    : makeFailure(payloadOrError as Error)
}
