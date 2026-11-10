# Changelog

Notable changes to `@design-edito/tools`, newest first. Versions follow
[semver](https://semver.org/), loosely: the package is still `0.x`, so a patch
may carry a breaking change as long as the release says so.

Each entry names the module it touches, by the path a consumer imports. Changes
that never reach the published package — the demo app, the README, repo
tooling — are left out.

Sections before `0.5.44` were reconstructed after the fact from the commits
between two version bumps, so they describe what shipped rather than what was
planned. Every version is tagged `v<version>` except `0.5.3`, `0.5.4` and
`0.5.5`, whose tags were never created.

## [0.5.44] — unreleased

### Added

- **`agnostic/misc/crossenv/suspect-client`** — a new module exporting
  `suspectClient()`, which suspects the client's operating system, rendering
  engine and browser brand, each as a `Suspicion` carrying how it was reached
  (`probed`, `declared`, `parsed`, `inferred`) and the evidence behind it. A
  field is `null` whenever no positive evidence was found: absence never
  promotes the other branch. iPhone and iPad both resolve to `iOS`, an iPad
  sending a desktop user agent is caught through `maxTouchPoints`, and an
  in-app WebKit webview is left unknown rather than reported as Safari.
  Intended for analytics, store links and known-bug workarounds — not for
  deciding whether a feature works, which stays a job for feature detection.
- **`agnostic/misc/crossenv/types.js`** — `MinimalNavigator`, holding the three
  identity fields client detection reads (`userAgent`, `vendor`,
  `maxTouchPoints`), and an optional `navigator` on `MinimalWindow`. Optional on
  purpose: an injected window may legitimately omit it.
- The published package now carries its `README.md` and this `CHANGELOG.md`.
  Neither was copied into the publishable tree before, so the package page had
  no readme at all.

### Fixed

- **`agnostic/misc/crossenv/detect-runtime`** — `detectRuntime()` no longer
  throws in a browser bundle that defines no global `process`. Every runtime
  marker is now read behind `typeof`, the only form that survives an undeclared
  identifier; `?.` does not catch one.
- **`agnostic/misc/crossenv/detect-runtime`** — Cloudflare Workers are detected
  through their documented `navigator.userAgent`, in place of a
  `self.addEventListener && Headers` test that any browser also satisfied.
- **`agnostic/misc/crossenv/detect-runtime`** — AWS Lambda is detected through
  `process.env.AWS_LAMBDA_FUNCTION_NAME`, in place of a global `AWS` that the
  Lambda runtime does not define.

### Changed

- **`agnostic/misc/crossenv/detect-runtime`** — runtimes are tested from the most
  specific to the most general: Electron, AWS Lambda, Deno, React Native,
  Cloudflare Workers, Node, browser. Several are supersets of others, so the
  previous order left some unreachable. **An Electron renderer now returns
  `ELECTRON` where it returned `NODE`**, and Deno returns `DENO` rather than
  `NODE` now that it ships a `process` shim. No type changes.
- **`agnostic/misc/crossenv/detect-runtime`** — Node requires an actual version
  string, so a browser bundle shimming a bare `process` no longer reads as Node.

## [0.5.43] — 2026-11-06

### Changed

- **`agnostic/html/deep-select`** — selects by running `querySelectorAll` per
  root instead of walking the tree.
- **`agnostic/html/watch-selection`** — serial polls, set diffing, and a root to
  scope them.
- **`agnostic/time/dates/read-date`** — a weekday scopes to the week a step
  named, and an offset in weeks names a week too.

### Added

- Tests for `agnostic/html/deep-select` and `agnostic/html/watch-selection`, both
  over a deep shadow tree.

## [0.5.42] — 2026-11-03

### Added

- **`agnostic/time/dates/partial-date`** — a date whose parts may be unknown, and
  what it derives from them.

### Changed

- **`agnostic/time/dates/format-date`** — reads a partial date, and drops a group
  it cannot fill.
- **`agnostic/time/dates/read-date`** — the year leads, and a date needs no
  separator.
- **`styles`** — the shadow tokens hold a value, not a declaration.

## [0.5.41] — 2026-11-02

### Added

- **`styles`** — the token layer, taken out of lm-link.

## [0.5.40] — 2026-11-01

The commands and visibility rebuild: around a hundred commits, grouped here by
subject.

### Removed

- **`components/ListLoader` and `components/JsonEditor` left the library**, with
  their entries in `components/public-classnames`.
- **`components/utils/viewport-behaviours`** — the module is gone, and with it
  the `behavioursSuspended` prop and the `kind` field. `Video`, `Sequencer` and
  `ScrollListener` dropped it.
- **`components/Video`** — `data-surrendered`, and refs are no longer taken as
  props.

### Added

- **`components/utils/commands`** — a commands layer: `parse`, `format`,
  `sendCommands` and its `sendCommand` util, `useCommands` taking an action
  table, a private bus instead of `window`, an internal event name, arguments as
  one comma-separated list, force and send limits in the grammar, and the
  surrender ledger. Verbs landed on `Video` (nine of them), `Lightbox`,
  `Gallery`, `Sequencer`, `Disclaimer`, `Drawer`, `BeforeAfter` and
  `ScrollTracker`.
- **`components/utils/comp-id`** — every component takes a `compId`, given or
  generated, and publishes it on its root. `WithCompId` lives in its own types
  file.
- **`components/utils/visibility` and `components/utils/intersection`** — two
  separate concepts: `useVisibility` settles the intersection over its delays,
  one language for intersection observation, and visibility triggers send a
  component's commands. Triggers reached the five remaining senders, then the
  eight send-only components, plus `Scrllgngn` and `Paginator`.
- **`components/utils/disclosure`** — a withheld subtree neither answers nor
  sends. `Video` will not play, `Sequencer`'s tempo waits and `Lightbox` will not
  open from under a standing disclaimer.
- **`agnostic/time/dates/read-date`** — a date read the way it is spoken:
  weekdays reading the way the operator after them points, counting inside a
  named period, `after` / `before` / `from` / `of` read right to left, digits,
  a clock to the millisecond, a half, the named days of the year, the ends of a
  period, and where the week opens left to the caller.
- **`agnostic/time/dates/parse-date`** — a `formatDate` template read backwards.
- **`agnostic/time/dates/calendar-names`** — month and weekday names, read from
  `Intl` once rather than once per call.
- **`agnostic/time/duration/parse-duration`** — a suffixed duration read into
  milliseconds, forgiving spaces and commas, with a month and year option; its
  suffix vocabulary lives in `types`.
- **`agnostic/strings/split-first`** — split at the first separator, keep the
  rest.
- **`agnostic/arrays/integers-between`** — the range util, out of `ListLoader`.
- **`agnostic/@react/types`** — standalone props types beside the wrappers, and
  `WithClassName`.
- **`components/Scrllgngn`** — `trackScroll` asks for the measurements without a
  handler.

### Changed

- **`components/ScrollListener` is renamed `ScrollTracker`**, with its class, its
  custom properties and the vocabulary its verbs never had.
- **`agnostic/time/dates/infer-date` is renamed `read-date`**, and `inferDate`
  becomes `readDate`.
- **`components/BeforeAfter`** — the separator element becomes the divider.
- **`components`** — props are flat intersections.
- **The internal state stays warm under control** on `BeforeAfter`, `Drawer`,
  `Disclaimer`, `Input`, `Select` and `Textarea`.
- **Starting points, not initial props** — `defaultStep` on `Sequencer`,
  `defaultCurrentTimeMs` on `Video`, plus volume, rate and mute; `Video`'s hybrid
  layer stops omitting the six values it holds.
- **A jump clamps**, and an absolute one says so, on `Video`, `Gallery` and
  `Sequencer`. A closed or controlled `Lightbox` stops driving the store, and a
  sibling is addressed by id.
- **`components/Gallery`** — position surrender on a horizontal intent.
- **`components/Gallery` and `Video`** — a local listener is a handle, not an
  `on…`.

### Fixed

- **`agnostic/time/duration`** — two lint errors the test file kept out of sight.
- **`components/Input`** — documented why the form fields get no verbs.
- **`components/EventListener` and `IntersectionObserver`** — a div is not a span.

## [0.5.39] — 2026-10-21

### Changed

- **`agnostic/css/merge-class-names`** — moved out of `components/utils`, with
  tests; an empty array no longer leaves a blank segment.
- **`agnostic/@react/effects/use-state-change-dispatch`** — the hook leaves
  `components/utils`, and `useChangeDispatch` becomes `useStateChangeDispatch`.
- **`agnostic/arrays/integers-between`** — the range util moves out of
  `ListLoader`, which can now retry a failed page and keeps a button on an empty
  list.
- **`components/Video`** — source and track types move to `types.ts`, and
  `parseSrcSetSourcesList` moves to `Video/utils`, read by `Image` too.
- **`components/Sequencer`** — attributes to `types`, helpers to `utils`, under
  clearer names.
- **`components/Scrllgngn`** — a `types.ts`, and its two vocabularies become
  values. Prop types stay in `index`.
- **`components/Lightbox`** — the store rewritten around plain `useState` and
  `useEffect` instead of `useSyncExternalStore`: `getLightboxesStoreState`,
  `setLightboxesStoreState`, `watchLightboxesStoreState`,
  `registerLightboxesStoreMember` and its unregister twin, `getMembersOf`,
  `openLightbox`, `closeLightbox`, `navigateOpenGroupBy`, members held in the
  state with a single writer, and store types in `types.ts`. Two nouns only,
  lightbox and group.
- **`components/utils/viewport-behaviours`** — no more suspension, and the `kind`
  field is gone, on `Video`, `Sequencer` and `ScrollListener`.
- **`components/ListLoader`** — no retry outlives the unmount.
- Comments trimmed across `Video`, `Sequencer`, `Subtitles`, `JsonEditor` and
  `Lightbox`; JSDoc added on `Video`'s source and track types.

## [0.5.38] — 2026-09-25

### Changed

- **`components/UIModule`** — `css` becomes a single sheet, and the contract says
  to export rules only.

## [0.5.37] — 2026-09-25

### Added

- **`components/UIModule`** — `postInit` can return a teardown function.

## [0.5.36] — 2026-09-25

### Changed

- **`components/Video`, `BeforeAfter` and `Clippable`** — thirteen positional
  handlers become named records.

## [0.5.35] — 2026-09-25

### Changed

- **`components/Gallery`, `Sequencer`, `Scrllgngn` and `ListLoader`** — five
  positional handlers become named records.

## [0.5.34] — 2026-09-25

### Changed

- **`components/UIModule`** — `destroy` becomes optional, `postInit` is added,
  and `update` is finally called.

## [0.5.33] — 2026-09-25

### Changed

- **`components/Gallery`** — `padding` is renamed `offset`, the geometry table
  freeing the word.

## [0.5.32] — 2026-09-25

### Changed

- **`components/Gallery`** — moves to the scroll-range table.

### Removed

- **`components/GalleryAlt`** — the alternative disappears, one version after
  arriving.

## [0.5.31] — 2026-09-25

### Added

- **`components/GalleryAlt`** — a gallery deducing the current page from a table
  of scroll ranges.

### Changed

- **`components/Sequencer`** — children flattened by `Children.toArray`, without
  opening fragments.

## [0.5.30] — 2026-09-18

### Added

- **`components/Sequencer`** — the sequence's numbers as custom properties, and a
  lap counter.

### Fixed

- **`components/Sequencer`** — a jump on a finished sequence really restarts it.

## [0.5.29] — 2026-09-18

### Changed

- **`components/Drawer`** — the toggle carries a public class that both the click
  and the CSS read; `closerContent` and `closerBtnSelector` fall back to the
  opener, and a selector targets the toggle.

## [0.5.28] — 2026-09-17

No consumer-facing change.

## [0.5.27] — 2026-09-17

### Changed

- **`components/Overlayer`** — three public tokens, no sheet of its own, and the
  private properties are finally read.

## [0.5.26] — 2026-09-17

### Added

- **`components/Clippable`** — `copyBtnContent` and `clippedBtnContent`.

## [0.5.25] — 2026-09-17

### Added

- **`components/ScrollListener`** — `track` and `untrack`; the inner div
  disappears.
- **`components/Sequencer`** — `data-last-step` says where the sequence stops.

## [0.5.24] — 2026-09-17

### Changed

- **`components/Sequencer`** — fragments are opened, not counted as a step.

## [0.5.23] — 2026-09-17

### Added

- **`components/Sequencer`** — conditional triggers, six verbs in `Video`'s
  family.

## [0.5.22] — 2026-09-17

### Changed

- **`components/Video`** — `onFullscreenChange` hands control back to the
  consumer.

## [0.5.21] — 2026-09-17

### Changed

- **`components/Sequencer`** — rewritten in one go: a single file, cloned
  children, and a `stepMap`.

## [0.5.20] — 2026-09-16

### Changed

- **`components/utils/viewport-behaviours`** — `isInstruction` moves to the
  public entry point, where a consumer can reach it.

## [0.5.19] — 2026-09-16

### Changed

- **`components/Video` and `viewport-behaviours`** — the vocabulary and its rule
  become values; `behavioursSuspended` lets the gate talk to the layer.

## [0.5.18] — 2026-09-16

### Changed

- **`components/Video`** — the eight `auto…` props become `whenVisible` and
  `whenHidden`, and `togglePlayOnClick` turns the poster into a play surface.
- **`components/utils/viewport-behaviours`** — the generic trigger layer, with
  the observer settings as a record.
- **`components/utils`** — `parseSourceList`, one reading for `Video` and
  `Image`; the two media lists leave the component.

## [0.5.17] — 2026-09-16

### Added

- **`components/IntersectionObserver`** — `useIntersectionObserver`, the same
  thing without the div.

### Changed

- **`components/Video`** — the `figure` is the root, no more wrapper.

## [0.5.16] — 2026-09-15

### Added

- **`components/Video`** — a subtitles button, its state and its two modifiers.

### Fixed

- **`components/Video`** — `loop` was pulled out of the props and never put back.

## [0.5.15] — 2026-09-15

### Changed

- **`components/Video`** — `timeFormat` moves to `formatDuration`;
  `formatTime` is removed.
- **`agnostic/time/dates/format-date`** — day names on `ddd`/`dddd`, `d`/`dd`
  becoming the number.
- **`agnostic/time/duration/format-duration`** — frames on `{{f}}`/`{{ff}}`,
  under the millisecond.

## [0.5.14] — 2026-09-12

### Added

- **`components/Video`** — a `timeFormat` prop for both clocks, its tokens
  delimited by `{{…}}`.

## [0.5.13] — 2026-09-11

### Added

- **`node/process/spawner`** — a verbosity option, for probes.

## [0.5.12] — 2026-09-11

### Added

- **`components/Lightbox`** — `openOnClick`, opening by clicking the content; all
  controls rendered, a `navigable` modifier, and the modifier follows the prop
  name.

## [0.5.11] — 2026-09-11

### Changed

- **`components/Lightbox`** — the content no longer moves at all, one box that
  flips; the opening button exists only if it has content.

## [0.5.10] — 2026-09-11

### Changed

- **`components/Theatre` is renamed `Lightbox`**, the vocabulary understood.
- **`components/Lightbox`** — arrow-key navigation, optional; the content is
  moved rather than duplicated, and groups share a scene.

## [0.5.9] — 2026-09-11

### Fixed

- **`components/Paginator`** — `thresholdOffsetPercent` is bounded, and the
  observation only runs when the page count changes.
- **`components/Video`** — the element is read back after a play attempt, since
  play is a request.

## [0.5.8] — 2026-09-10

### Changed

- **`components`** — the missing internal states surface as root modifiers, and
  the data attributes come back, since CSS can only reach them that way.
- **`components/Video`** — the continuous values move to custom properties.
- **`components/BeforeAfter`** — one unitless ratio property, no percent twin, no
  attribute.
- **`components/ResizeObserver` and `Drawer`** — the data attributes duplicating
  the custom properties are dropped.

## [0.5.7] — 2026-09-10

### Added

- **`agnostic/subtitles`** — an SRT parser and timecode reader, out of the
  component; `Subtitles` is rebuilt on it, with positions as identity.
- **`components/Video`** — the ended state, fed to `Subtitles`, and the observer
  exposed.
- **`components`** — one shared set of observer props across the components that
  mount one.

### Changed

- **`components/Video`** — the visibility props split into `when` and `once`
  variants.
- **`components/Scrllgngn`** — viewport offsets, a threshold relative to the
  visible zone, and a poll for moves a resize observer cannot see.

### Removed

- **`components/Subtitles`** — `children`, which had nothing to wrap.

## [0.5.6] — 2026-09-10

### Added

- **`components/Scrllgngn`** — per-block `onScrolled`, a scroll context and its
  DOM exposure.
- **`components/Paginator`** — the page slot elements are exposed to the parent.

## [0.5.5] — 2026-09-04

### Added

- **`components`** — the missing handlers on `Clippable`, `Drawer`, `Gallery`,
  `Scrllgngn`, `ScrollListener` and `Sequencer`.

### Changed

- **`components/Theatre`** — `onToggleClicked` splits into per-source click
  handlers.

## [0.5.4] — 2026-09-04

### Changed

- **`components/Disclaimer`** — `content` becomes `children`, the gated content
  becomes `sensitiveContent`, and the panel message moves to
  `undisclosedContent`.
- **`components/Image` and `Overlayer`** — the image theatre prop is dropped, and
  the overlay content becomes `children`.

## [0.5.3] — 2026-09-03

### Added

- **`agnostic/time/duration/format-duration`** — `formatDuration`, with units
  read off the template, `getDurationParts` for the numeric breakdown, a
  `floorSmallestUnit` rather than rounding, and `M` / `Y` as short aliases.
  Moved out of the `Video` component, with tests.
- **`agnostic/time/dates/format-date`** — `getDateParts` returns quantities and
  `formatDate` does the padding, its token alternation ordered longest first.
- **`components/Scrllgngn`** — the current page id as a data attribute.
- **`components/utils`** — `useChangeDispatch`.

### Changed

- **`components`** — flat handlers across `Video`, `BeforeAfter`, `UIModule`,
  `ScrollListener`, `ListLoader`, `Gallery`, `Paginator`, `Subtitles`,
  `Sequencer`, `Disclaimer`, `Theatre`, `Clippable` and `Drawer`, with past
  participle names and `useChangeDispatch` behind the state ones.
- **`components/Input`, `Select` and `Textarea`** — the controlled variants merge
  into a single hybrid file.
- **`components`** — CSS variables expose the px length bare, the raw number
  under a `-raw` twin, written by hand; `toCssVars` and `toDataAttributes` are
  dropped, as are `_modifiers` and `_dataAttributes`.
- **`components/Image`** — owns the disclaimer state and drives `Disclaimer`
  controlled.

### Fixed

- **`components/Video`** — inverted loud and playing states, a guarded time
  ratio, the controlled time displayed from the prop, and `onFullscreenChange`
  fired from the real event.
- **`components/Subtitles`** — honours `srtFileContent` when no `src` is given.
- **`agnostic/html/deep-select`** — keeps the scheduler as `this` when calling
  `scheduler.yield`.

### Removed

- **`components/Video` and `Image`** — the nested disclaimer gate and everything
  it gated.

## [0.5.2] — 2026-08-28

### Added

- **`components/ListLoader`** — a list loader, split controlled / uncontrolled,
  with paging, staleness, retries and load buttons.

### Fixed

- **`components/JsonEditor`** — the type select did not reflect the current
  value.

## [0.5.1] — 2026-08-27

### Added

- **`node/files/get-size`** — a recursive file and directory size util, with
  tests, then options for concurrency, `onError`, `signal`, `maxDepth`,
  symlinks, hardlinks and `sizeOf`, then a `timeoutMs` taking a number or a
  `Duration`.

## [0.5.0] — 2026-08-25

### Added

- **`agnostic/time/dates/to-french-republican`** — a French Republican calendar
  converter, with types, utils and tests.

### Changed

- Dependencies bumped, `uuid` overridden to `^11`, TypeScript held at 5.x.

### Fixed

- **`node/images`** — sharp type imports after the upgrade.
