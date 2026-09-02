# lm-tools

Shared conventions — commits, code style, JSX, import order — live in the root
[`../CLAUDE.md`](../CLAUDE.md) and apply here. This file only adds what is specific
to this repo.

Formatting is enforced by `eslint-config-love` (see `eslint.config.js`). Run
`npx eslint <files>` before considering a change done.

Commit scope is the directory relevant to the change, without the `src/` prefix
(e.g. `components/BeforeAfter`, `agnostic/html/deep-select`, `node/images`).

## Module layout

- A utility is a folder whose entry point is `index.ts`. Folder name kebab-case,
  exported symbol its camelCase form.
- When `index.ts` grows, split into siblings: `types.ts` (exported types, the
  domain vocabulary), `utils.ts` (constants, tables, internal helpers), and an
  `index.ts` left with only the public entry function.
- **No convenience re-exports** from `index.ts` — each symbol is imported from the
  file that owns it. Components are the exception: their `Props` stays exported
  from `index.tsx`, which is where consumers look for it.

## JSDoc

This is the one repo whose functions are consumed from other projects, so the
tooltip an IDE shows at the call site *is* the documentation. Write for that
reader.

- Document exported symbols. Internal helpers don't need it.
- One precise sentence beats an exhaustive paragraph. Say *why* and *when*, never
  restate what the types already say, and never repeat a type inside a tag
  (`@param {string} name`).
- Functions: `@param` / `@returns`. Overloads get one block each — duplication is
  fine here. Generics get `@template` per type parameter.
- Types: `@property` per field on complex object types; a short `/** … */` above
  each field for simple option bags.
- Components: document `Props`, then the component, cross-referenced with
  `@see {@link Props}`. List the class names consumers can target under a
  `### CSS elements` heading inside the block.
- `@remarks` for non-obvious behaviour — edge cases, controlled vs uncontrolled.
  `@throws` when a throw is part of the contract.
- `@example` only when usage is genuinely non-obvious. One that echoes the
  signature is worse than none.
- For an `Outcome.Either`, spell out both branches:
  ```ts
  /**
   * @returns
   * - On success: `Outcome.makeSuccess(true)`
   * - On failure: `Outcome.makeFailure(errorMessage)`
   */
  ```

## Components

Consumed almost exclusively **under Preact**, though they typecheck against React
types. When the two disagree, Preact wins.

> **To revisit:** `Input`, `Select` and `Textarea` used to re-assign `target.value`
> right after `onChange`, forcing the DOM back to the controlled value. Removed as
> redundant — React restores controlled inputs by itself — but never checked against
> Preact. If a controlled field whose parent *rejects* the input keeps showing the
> typed characters, that block is why. Check `npm run demo:preact` first.

### Naming

- Symbol is the folder name, suffixed with `Component` **only** to dodge a DOM global
  (`IntersectionObserverComponent`); `ScrollListener`, `Video`, `Drawer` stay bare.
- Controlled variant is prefixed: `ControlledVideo`.
- Props type always exported as `Props`, in both files. Never `ControlledProps`.
- Uncontrolled initial value is always `default<Something>`, never `initial…`.

### Handlers

One flat `on…` prop per callback — no `stateHandlers {}` / `actionHandlers {}` bags,
and one handler per state item even when there are six, as on `Video`.

- **Actions** — past participle, fired **before** the component reacts, carrying the
  value **as it was**: `onTimelineClicked`.
- **State** — past participle, fired **after**, carrying the **new** value:
  `onRatioChanged`. Dispatch with `useChangeDispatch`.
- The past participle marks the component's own semantics; a prop that merely
  forwards a native handler keeps its native name (`onChange` on `Input`).
- Both modes: action handlers always fire, only the state update is guarded by the
  controlled check. State handlers always fire, and **never on mount**.

### Controlled / uncontrolled

The `index.tsx` + `index.controlled.tsx` split is a readability tool, not an
obligation. Split when the controlled layer reads on its own (`Video`,
`BeforeAfter`); keep one hybrid file when the wrapper is a few lines (`Input`,
`Drawer`, `Gallery`). Uncontrolled-only is fine when the structure imposes it — say
so in the JSDoc.

### Rendering

- Root class is `c()`; `c(null, { … })` only when modifiers follow.
- Type as `FunctionComponent<Props>`, don't annotate the arrow's return. A generic
  component can't use it: type it as a generic arrow returning `ReactNode`.
- The stylesheet is `styles.module.css`.
- Public custom properties are namespaced under the public class name and built with
  `toCssVars`: the bare name carries the ready-to-use `px` length, the `-raw` twin the
  plain number for `calc()`. Never name a variable after a unit it doesn't carry.
- `--PRIVATE-<name>` is what the component's own stylesheet reads — unprefixed,
  outside the API. Safe only because the component sets it itself, so **emit it
  unconditionally**: a gap lets an ancestor's value inherit through.

## Tests

Vitest. A single module with `npx vitest run <path>`, everything with
`npm run tests`. Component tests are disabled for now.

- `index.test.ts` sits next to the `index.ts` it exercises, and is excluded from
  `lint:src` and from the build.
- `import { describe, it, expect } from 'vitest'` explicitly. `it`, never `test`.
- Import through the public path a consumer would use, `.js` extension included.
- One top-level `describe` per exported symbol, named exactly after it; nest
  `describe` blocks per family of behaviour.
- Each `it` states a behaviour, not a mechanic: `it('steps back a Gregorian year
  for dates before the new year')`, not `it('works')`.
- Prefer concrete fixtures — a known historical date documents itself where an
  arbitrary one doesn't.
- `toMatchObject` to assert a whole shape at once; a targeted `toBe` when one
  field carries the meaning.
- Cover the edge cases the logic actually has — boundaries, union branches,
  roll-overs — not just the happy path.
