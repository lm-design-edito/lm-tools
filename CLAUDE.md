# lm-tools

Shared conventions — commits, code style, JSX, import order — live in the root
[`../CLAUDE.md`](../CLAUDE.md) and apply here. This file only adds what is specific
to this repo.

Formatting is enforced by `eslint-config-love` (see `eslint.config.js`). Run
`npx eslint <files>` before considering a change done.

Commit scope is the directory relevant to the change, without the `src/` prefix
(e.g. `components/BeforeAfter`, `agnostic/html/deep-select`, `node/images`).

## Demo

The per-component demo app under `demo/` is **on pause**. Don't spend effort keeping
it in sync with component changes — touch it only when a change stops it from
compiling (`npx tsc --project demo/src/tsconfig.json --noEmit`).

## Module layout

**A module is a folder, not a file.** Prefer `<something>/index.ts` to
`<something>.ts`, every time. The count says it is already the rule — 261 `index.ts`,
30 `index.tsx`, and a handful of outliers (`public-classnames.ts`, `store.ts`,
`cssColorsMap.ts`, which is not even kebab-case) that are debts rather than
precedents. Folder name kebab-case, exported symbol its camelCase form.

**Two filenames are public, and only two.** The publish step generates the package's
`exports` map by globbing `**/index.js` and `**/types.js` — nothing else gets an entry,
so nothing else can be imported from outside, whatever it holds. A symbol a consumer
must reach therefore lives in one of those two files. This has already cost a
publication: `isInstruction` was written in a `utils.ts`, and lm-link could not import
it.

- **`index.ts`** — the public entry. Functions, hooks, components.
- **`types.ts`** — exported types and the constants that are vocabulary: a verb list, a
  modifier set. A `as const` array rather than a bare union whenever something outside
  will need the values at runtime, since a type has nothing to hand a validator.

**`utils.ts` and `data.ts` are tolerated, sparingly.** Only when the content is
genuinely minimal, and only when the sibling `index.ts` is its **single** consumer — they
are a way of keeping an entry point readable, not a third public surface. The moment two
folders want the same helper, it moves to a folder of its own.

**No convenience re-exports** from `index.ts` — each symbol is imported from the file
that owns it, `types.js` included. Components are the exception: their `Props` stays
exported from `index.tsx`, which is where consumers look for it.

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

- A controlled field only snaps back if something re-renders — Preact restores it
  from the diff where React restores it from the event — so a parent that rejects an
  input without changing state leaves the typed characters on screen.

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
- **The root class carries a modifier for every state the component holds.** A
  consumer styles from the outside, with no access to the state — so anything the
  component knows about itself and that could change how it looks has to surface
  as a modifier: open / closed, loading / loaded / failed, empty / filled,
  controlled / uncontrolled, measured or not, which way it is scrolling. A component
  with internal state and a bare `c()` root is the thing to look for.
  - Name the state, not its negation, unless both sides are styled — `--clipped`
    alone, but `--play-on` / `--play-off` together, because a player styles the two.
  - A value that isn't a state doesn't belong here: a ratio, a size, a timecode go
    to a custom property and a `data-` attribute. A modifier answers yes or no, or
    names one case out of a few.
- Type as `FunctionComponent<Props>`, don't annotate the arrow's return. A generic
  component can't use it: type it as a generic arrow returning `ReactNode`.
- The stylesheet is `styles.module.css`, and it holds **only what the component's own
  JavaScript needs to work** — the geometry it measures, the positioning it depends
  on. Everything else, including what makes the component *look* like what it is, is
  the consumer's business and belongs in their stylesheet. This is already the shape
  of the library: 23 of the 26 stylesheets are empty, and the three that aren't
  (`Scrllgngn`, `Gallery`, `Paginator`) are exactly those whose JS reads the geometry
  — a measured probe, an observed snap, a fixed marker. `BeforeAfter` ships none and
  needs a consumer sheet to clip anything at all; that is intended, not an oversight.
- Public custom properties and `data-` attributes are **written out in full, one
  literal per line** — `'--lm-drawer-content-width'`, not a name built from the
  prefix. They are the component's public API: a consumer greps for the exact
  string, and it must exist in the source they read. Same reason the JSDoc lists
  them literally.
- **A twin exists only when the conversion isn't expressible in CSS.** A length
  carries its `px` under the bare name and the plain number under a `-raw` twin,
  because `100px` can't be turned back into `100` in a stylesheet. A unitless value
  needs no twin: `calc(var(--r) * 100%)`, `* 1turn`, `* 1px` cover every unit in one
  multiplication. So no `-percent`, no `-deg`, no `-px` variant of a ratio.
- **Every unitless 0–1 value ends in `-ratio`** — `-scrolled-y-ratio`,
  `-progression-ratio` — even when the stem already reads as a ratio. The suffix is
  mechanical on purpose: it removes the case-by-case call about whether the name is
  self-describing, and it keeps a ratio from being mistaken for the length that often
  shares its stem (`--lm-scroll-listener-scroll-y` is px, `-window-scrolled-y-ratio`
  is not). Never name a variable after a unit it doesn't carry.
- **A `data-` attribute and a custom property are not alternatives**, and the same
  value belongs in both whenever both are reachable. A custom property feeds
  `calc()` and any property that takes a value; an attribute feeds
  `content: attr(data-width)` and attribute selectors, which no custom property can
  do. So duplication between the two is never a reason to drop either — the question
  is only whether a stylesheet can reach the value that way at all.
- An object holding only custom properties needs an explicit `Record<string, string>`
  annotation — `style` rejects a literal that shares no property with `CSSProperties`.
- When every value comes from the same measurement, guard once on that measurement
  rather than per value.
- `--PRIVATE-<name>` is what the component's own stylesheet reads — unprefixed,
  outside the API. Safe only because the component sets it itself, so **emit it
  unconditionally**: a gap lets an ancestor's value inherit through.
- Point de vigilance, pas règle stricte : devant une **prop hors bornes**, préférer
  corriger la valeur *et* avertir, plutôt que jeter ou corriger en silence. Jeter tue
  le montage pour un simple réglage ; corriger sans rien dire déguise un bug de
  l'appelant en problème d'affichage, qu'on ira chercher ailleurs.

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
