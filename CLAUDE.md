# lm-tools

## Git workflow

- Commit message shape: `<path/scope> - <lowercase description>`. Scope is the directory relevant to the change, without the `src/` prefix (e.g. `components/BeforeAfter`, `agnostic/html/deep-select`, `node/images`). Multiple scopes can be joined with `&` or comma-separated. The description after the dash is lowercase and terse — a few words, not a full punctuated sentence. This isn't always strictly enforced, but it's the preferred shape for new commits.
- Do not add a `Co-Authored-By: Claude` trailer to commits in this repo — use a plain commit message.
- Only run `git commit` when asked. Never run `git add`, `git push`, or `git pull` — the user handles staging, pushing, and pulling themselves.

## JSDoc

### General principles

- Document public exported symbols. Internal utilities and non-exported helpers do not require JSDoc.
- Prefer short, precise descriptions over exhaustive ones. One sentence is often enough.
- Do not restate what the TypeScript types already express. Focus on *why* and *when*, not *what*.

---

### Types and interfaces

Always document exported types and interfaces. Use `@property` tags for each property of complex object types.

```ts
/**
 * Represents a color in the RGBA color space.
 *
 * @property r - Red channel (0–255).
 * @property g - Green channel (0–255).
 * @property b - Blue channel (0–255).
 * @property [a] - Alpha channel (0–1), optional.
 */
export type Rgba = { r: number; g: number; b: number; a?: number }
```

For simple inline object types (e.g. options bags), use inline `/** ... */` comments on each property instead of `@property` tags:

```ts
export type FormatOptions = {
  /** Target width in pixels. */
  width?: number
  /** Target height in pixels. */
  height?: number
}
```

---

### Functions

Use `@param` and `@returns`. Omit type annotations in JSDoc tags — TypeScript already carries them.

```ts
/**
 * Restricts a number to lie within a specified range.
 *
 * @param num - The number to clamp.
 * @param bound1 - One end of the range.
 * @param bound2 - The other end of the range.
 * @returns The number constrained between the minimum and maximum of the two bounds.
 */
export function clamp(num: number, bound1: number, bound2: number): number
```

For async functions returning `Outcome.Either`, document the success and failure cases explicitly:

```ts
/**
 * Uploads a file stream to a GCS bucket.
 *
 * @param bucket - The target GCS bucket.
 * @param targetPath - Destination path inside the bucket.
 * @param fileStream - The file content to upload.
 * @returns
 * - On success: `Outcome.makeSuccess(true)`
 * - On failure: `Outcome.makeFailure(errorMessage)`
 */
```

For overloaded functions, give each signature its own JSDoc block — duplication is acceptable here.

For generic functions, use `@template` to describe the role of each type parameter:

```ts
/**
 * @template C - The input color type, preserved in the return type.
 */
```

---

### React components

Document the `Props` type, then the component itself. Always cross-reference with `@see {@link Props}`. If the component exposes CSS class names that consumers can target, list them under a `### CSS elements` heading inside the JSDoc.

```ts
/**
 * Props for the {@link Button} component.
 *
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = ...

/**
 * Base button component.
 *
 * Renders a native `<button>` element with scoped class names applied.
 *
 * ### CSS elements
 * - `root`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A styled native button element.
 */
export const Button: FunctionComponent<Props> = ...
```

---

### Behavioral notes

Use `@remarks` for non-obvious behavior, edge cases, or controlled vs. uncontrolled usage patterns. Keep it concise.

```ts
/**
 * @remarks
 * When `value` is provided, the component is fully controlled by the parent.
 * When omitted, it manages its own internal state (hybrid mode).
 */
```

Use `@throws` when a function can throw in documented, meaningful ways.

---

### Examples

`@example` is optional. Add one only when usage is non-obvious and a code snippet genuinely helps. Avoid mechanical examples that just repeat the function signature.

---

### What to avoid

- Do not add JSDoc to class methods unless the class itself is part of the public API.
- Do not use `@deprecated` without a migration path in the comment.
- Do not write `@example` blocks that merely echo the type signature.
- Do not include type annotations inside JSDoc tags (e.g. `@param {string} name`) — rely on TypeScript types instead.
