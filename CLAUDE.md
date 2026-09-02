# lm-tools

Shared conventions — commits, code style, JSX, import order — live in the root
[`../CLAUDE.md`](../CLAUDE.md) and apply here. This file only adds what is specific
to this repo.

Formatting is enforced by `eslint-config-love` (see `eslint.config.js`). Run
`npx eslint <files>` before considering a change done.

Commit scope is the directory relevant to the change, without the `src/` prefix
(e.g. `components/BeforeAfter`, `agnostic/html/deep-select`, `node/images`).

## Module layout

- Each utility is a folder whose entry point is `index.ts`. The folder name is the util name (kebab-case); the exported symbol is its camelCase form.
- When `index.ts` grows, split concerns into sibling files:
  - `types.ts` — exported types, interfaces and enums (the domain vocabulary).
  - `utils.ts` — constants, lookup tables and internal helper functions.
  - `index.ts` — keeps only the public entry function(s), importing what it needs from `./types.js` / `./utils.js`.
- **Do not add convenience re-exports** from `index.ts`. Consumers import each symbol from the file that owns it (the entry function from the module, types and enums from `./types`).

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

## Components

### Target renderer

The components typecheck against React types and the test setup covers both
renderers, but **in practice they are consumed almost exclusively under Preact**.
When React and Preact disagree on a behaviour, Preact is the one that matters.

**To revisit:** `Input`, `Select` and `Textarea` used to re-assign `target.value`
by hand right after `onChange`, forcing the DOM back to the controlled value.
It was removed as redundant — React restores controlled inputs on its own — but
that reasoning was never checked against Preact. If a controlled field whose
parent *rejects* the input keeps showing the typed characters, that block is why.
Check it in `npm run demo:preact` before assuming it was dead code.

### Naming

- Component symbol is the folder name. Suffix it with `Component` **only** to avoid a collision with a DOM global (`IntersectionObserverComponent`, `ResizeObserverComponent`, `EventListenerComponent`, `ShadowRootComponent`). `ScrollListener`, `Video`, `Drawer` etc. stay bare.
- A controlled variant is prefixed: `ControlledVideo`, `ControlledBeforeAfter`, `ControlledSequencer`, `ControlledListLoader`.
- Every props type is exported as `Props`, in both `index.tsx` and `index.controlled.tsx`. Never `ControlledProps`.
- The uncontrolled initial value is always `default<Something>` (`defaultValue`, `defaultRatio`, `defaultIsOpened`, `defaultActive`). Never `initial…` or `init…`.

### Handlers

One flat `on…` prop per callback. No `stateHandlers {}` / `actionHandlers {}` bags.

- **Actions** — past participle, fired **before** the component reacts, carrying the value **as it was**: `onPlayButtonClicked`, `onTimelineClicked`, `onDividerDragged`.
- **State** — past participle, fired **after** the change, carrying the **new** value: `onRatioChanged`, `onIsPlayingChanged`, `onVolumeChanged`.
- The past participle is what separates a component's own semantics from a DOM passthrough. A prop that simply forwards a native handler keeps its native name (`onChange` on `Input`, `onEvent` on `EventListenerComponent`).
- One handler per state item, always — no aggregate `onStateChanged` even on the components carrying six of them, such as `Video`.

The contract, in both controlled and uncontrolled mode:

- action handlers always fire — only the internal state update is guarded by the controlled check;
- state handlers always fire, and **never on mount**.

### Controlled / uncontrolled

The `index.tsx` + `index.controlled.tsx` split is a readability tool, not an obligation. Split when the controlled layer is substantial enough to read on its own (`Video`, `BeforeAfter`, `Sequencer`, `ListLoader`); keep a single hybrid file when the wrapper is a handful of lines (`Input`, `Select`, `Textarea`, `Drawer`, `Disclaimer`, `Theatre`, `Gallery`).

### Rendering

- Root class is `c()`. `c(null, { … })` only when modifiers follow. Never `c(null, {})`.
- Type the component as `FunctionComponent<Props>` and **do not** annotate the arrow's return — the type already carries it. A generic component cannot use `FunctionComponent`; type it as a generic arrow returning `ReactNode`.
- The stylesheet is `styles.module.css`.
- Public custom properties are namespaced under the public class name and built with `toCssVars`. A measurement is exposed twice: the bare name carries the ready-to-use `px` length, the `-raw` twin the plain number for `calc()`. Never name a variable after a unit it does not carry.
- `--PRIVATE-<name>` is a custom property the component's own `styles.module.css` reads, deliberately unprefixed and outside the public API. It is safe because the component sets it itself, so nothing can shadow it by inheritance — provided it is emitted unconditionally.

## Tests

Tests run on **Vitest**. Run a single module's tests with `npx vitest run <path>`, or the whole suite with `npm run tests`.

### Conventions

- A test file lives next to the code it covers and is named `index.test.ts` (matching the `index.ts` it exercises). Test files are excluded from `lint:src` and from the build.
- Always import the primitives explicitly: `import { describe, it, expect } from 'vitest'`. Use `it`, never `test`.
- Import the code under test through the same public path a consumer would use, with the `.js` extension: the entry function from `./index.js`, types and enums from `./types.js`.

### Structure

- A top-level `describe` per exported symbol, named exactly after it.
- Group related behaviors under nested `describe` blocks (e.g. `'regular days'`, `'complementary days'`, `'year handling'`).
- Each `it` states a behavior, not a mechanic: `it('steps back a Gregorian year for dates before the new year')`, not `it('works')`.

```ts
import { describe, it, expect } from 'vitest'
import { toFrenchRepublican } from './index.js'
import { RepublicanMonth } from './types.js'

describe('toFrenchRepublican', () => {
  it('converts a well-known historical date (18 Brumaire an VIII)', () => {
    const result = toFrenchRepublican(new Date(1799, 10, 9))
    expect(result.formatted).toBe('18 Brumaire an VIII')
    expect(result.monthName).toBe(RepublicanMonth.BRUMAIRE)
  })

  describe('complementary days', () => {
    it('nulls out the month fields', () => { /* ... */ })
  })
})
```

### What to assert

- Prefer concrete, meaningful fixtures over synthetic ones — a known historical date reads better than an arbitrary one, and doubles as documentation.
- Use `toMatchObject` to assert the shape of a returned object in one go; use targeted `expect(...).toBe(...)` when a single field carries the meaning of the test.
- Cover the edge cases the logic actually has (boundaries, discriminated-union branches, leap/sextile years, roll-overs), not just the happy path.
