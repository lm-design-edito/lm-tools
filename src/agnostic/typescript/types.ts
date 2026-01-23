/**
 * Converts `undefined` to `null` in a type, while preserving other types.
 * 
 * @template T - The type to transform
 * @returns If T extends `undefined`, returns `null`, otherwise returns T
 * 
 * @example
 * ```ts
 * type Example1 = NullIfUndefined<string | undefined>; // string | null
 * type Example2 = NullIfUndefined<number>; // number
 * type Example3 = NullIfUndefined<undefined>; // null
 * ```
 */
export type NullIfUndefined<T> = T extends undefined ? null : T

/**
 * Makes specific keys of a type required, while keeping other keys optional.
 * 
 * @template T - The base type
 * @template K - The keys of T that should be required
 * @returns A new type where keys K are required and other keys remain as they were
 * 
 * @example
 * ```ts
 * interface User {
 *   name?: string;
 *   age?: number;
 *   email?: string;
 * }
 * 
 * type UserWithRequiredName = RequireKeys<User, 'name'>;
 * // { name: string; age?: number; email?: string; }
 * 
 * type UserWithRequiredNameAndEmail = RequireKeys<User, 'name' | 'email'>;
 * // { name: string; age?: number; email: string; }
 * ```
 */
export type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * Utility type that extracts the resolved type of a Promise, or returns the type itself if not a Promise.
 */
export type UnwrapPromise<PromiseOrNot> = PromiseOrNot extends Promise<infer Resolved> ? Resolved : PromiseOrNot
