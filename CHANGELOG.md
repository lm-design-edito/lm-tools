# Changelog

Notable changes to `@design-edito/tools`, newest first. Paths are the ones a consumer
imports; what never reaches the published package is left out. Sections before
`0.5.44` were reconstructed from the commits between two version bumps.

## [latest]

- changed - **agnostic/misc/crossenv/suspect-client** - `BrowserBrandName.ANDROID_WEBVIEW` added, and the `wv` token is read before the `Chrome/` one beside it. **An Android webview now reports `Android WebView` where it reported `Chrome`.** Confirmed against the real user agent of the Le Monde app.

- fixed - **package** - the built `*.test.js` and `*.test.d.ts` files no longer ship in the tarball. They were never in the `exports` map, so nothing could import them — only weight.

## [0.5.44] — 2026-11-11

- added - **agnostic/errors/try-catch** - `tryCatch(run)` newly exported. Runs `run` and turns a throw into a value: `Outcome.Either`, carrying the returned value on success and the thrown one on failure. Synchronous only, so an async function's rejection is not caught.
- added - **agnostic/misc/outcome** - `getPayload(outcome, fallback)` and `getError(outcome, fallback)` newly exported. The fallback is required, so a caller wanting the absent case writes `undefined`.
- changed - **agnostic/misc/crossenv/suspect-client** - the engine probes read through `tryCatch`, and the record guard is the shared `agnostic/objects/is-record`. No change to what the module exports.
- added - **agnostic/misc/crossenv/suspect-client** - `suspectClient()` newly exported. Suspects client's OS, rendering engine & browser brand. Returned `Suspicion` carries a `Certainty` level and the evidence behind it. Relies on user agent and vendor specific feature detection. Returns `null` if nothing conclusive found.
- added - **agnostic/misc/crossenv/types** - `MinimalNavigator` (`userAgent`, `vendor`, `maxTouchPoints`). `navigator` added to `MinimalWindow`, optional.
- added - **package** - `README.md` and `CHANGELOG.md` now reach the tarball.
- fixed - **agnostic/misc/crossenv/detect-runtime** - `detectRuntime()` no longer throws where no global `process` is declared. Markers read behind `typeof`, which `?.` cannot replace.
- fixed - **agnostic/misc/crossenv/detect-runtime** - Cloudflare Workers keyed off their documented `navigator.userAgent`, no longer a test any browser satisfied.
- fixed - **agnostic/misc/crossenv/detect-runtime** - AWS Lambda keyed off `AWS_LAMBDA_FUNCTION_NAME`, no longer an undefined global `AWS`.
- changed - **agnostic/misc/crossenv/detect-runtime** - candidates ordered most specific first. **An Electron renderer now returns `ELECTRON`** and Deno `DENO`, where both returned `NODE`.
- changed - **agnostic/misc/crossenv/detect-runtime** - `NODE` requires a version string, so a bundle shimming a bare `process` is not Node.

## [0.5.43] — 2026-11-06

- changed - **agnostic/html/deep-select** - `querySelectorAll` per root instead of a tree walk.
- changed - **agnostic/html/watch-selection** - serial polls, set diffing, and a root to scope them.
- changed - **agnostic/time/dates/read-date** - a weekday scopes to the week a step named, and an offset in weeks names a week too.
- added - **agnostic/html/deep-select, agnostic/html/watch-selection** - tests over a deep shadow tree.

## [0.5.42] — 2026-11-03

- added - **agnostic/time/dates/partial-date** - a date whose parts may be unknown, and what it derives from them.
- changed - **agnostic/time/dates/format-date** - reads a partial date, and drops a group it cannot fill.
- changed - **agnostic/time/dates/read-date** - the year leads, and a date needs no separator.
- changed - **styles** - shadow tokens hold a value, not a declaration.

## [0.5.41] — 2026-11-02

- added - **styles** - the token layer, taken out of lm-link.

## [0.5.40] — 2026-11-01

The commands and visibility rebuild, around a hundred commits, grouped by subject.

- added - **components/utils/commands** - a commands layer: `parse`, `format`, `sendCommands` and `sendCommand`, `useCommands` taking an action table, a private bus instead of `window`, arguments as one comma-separated list, force and send limits, and the surrender ledger. Verbs landed on `Video` (nine), `Lightbox`, `Gallery`, `Sequencer`, `Disclaimer`, `Drawer`, `BeforeAfter` and `ScrollTracker`.
- added - **components/utils/comp-id** - every component takes a `compId`, given or generated, and publishes it on its root. `WithCompId` in its own types file.
- added - **components/utils/visibility, components/utils/intersection** - two concepts split: `useVisibility` settles the intersection over its delays, and visibility triggers send a component's commands. Reached the five remaining senders, the eight send-only components, `Scrllgngn` and `Paginator`.
- added - **components/utils/disclosure** - a withheld subtree neither answers nor sends. `Video` will not play, `Sequencer`'s tempo waits, `Lightbox` will not open under a standing disclaimer.
- added - **agnostic/time/dates/read-date** - a date read the way it is spoken: weekdays reading the way the operator points, counting inside a named period, `after` / `before` / `from` / `of` read right to left, digits, a clock to the millisecond, a half, named days of the year, the ends of a period, and where the week opens left to the caller.
- added - **agnostic/time/dates/parse-date** - a `formatDate` template read backwards.
- added - **agnostic/time/dates/calendar-names** - month and weekday names, read from `Intl` once rather than per call.
- added - **agnostic/time/duration/parse-duration** - a suffixed duration into milliseconds, forgiving spaces and commas, with a month and year option. Suffix vocabulary in `types`.
- added - **agnostic/strings/split-first** - split at the first separator, keep the rest.
- added - **agnostic/arrays/integers-between** - the range util, out of `ListLoader`.
- added - **agnostic/@react/types** - standalone props types beside the wrappers, and `WithClassName`.
- added - **components/Scrllgngn** - `trackScroll` asks for the measurements without a handler.
- changed - **components/ScrollListener** - renamed `ScrollTracker`, with its class, its custom properties and the vocabulary its verbs never had.
- changed - **agnostic/time/dates/infer-date** - renamed `read-date`, `inferDate` becomes `readDate`.
- changed - **components/BeforeAfter** - the separator element becomes the divider.
- changed - **components** - props are flat intersections.
- changed - **components** - the internal state stays warm under control on `BeforeAfter`, `Drawer`, `Disclaimer`, `Input`, `Select` and `Textarea`.
- changed - **components** - starting points, not initial props: `defaultStep` on `Sequencer`, `defaultCurrentTimeMs` plus volume, rate and mute on `Video`, whose hybrid layer stops omitting the six values it holds.
- changed - **components/Video, components/Gallery, components/Sequencer** - a jump clamps, and an absolute one says so.
- changed - **components/Lightbox** - a closed or controlled one stops driving the store, and a sibling is addressed by id.
- changed - **components/Gallery** - position surrender on a horizontal intent.
- changed - **components/Gallery, components/Video** - a local listener is a handle, not an `on…`.
- removed - **components/ListLoader, components/JsonEditor** - out of the library, with their `components/public-classnames` entries.
- removed - **components/utils/viewport-behaviours** - the module is gone, and with it the `behavioursSuspended` prop and the `kind` field. Dropped by `Video`, `Sequencer` and `ScrollListener`.
- removed - **components/Video** - `data-surrendered`, and refs are no longer taken as props.
- fixed - **agnostic/time/duration** - two lint errors the test file kept out of sight.
- fixed - **components/EventListener, components/IntersectionObserver** - a div is not a span.

## [0.5.39] — 2026-10-21

- changed - **agnostic/css/merge-class-names** - out of `components/utils`, with tests. An empty array no longer leaves a blank segment.
- changed - **agnostic/@react/effects/use-state-change-dispatch** - out of `components/utils`, `useChangeDispatch` becomes `useStateChangeDispatch`.
- changed - **agnostic/arrays/integers-between** - out of `ListLoader`, which can now retry a failed page and keeps a button on an empty list.
- changed - **components/Video** - source and track types to `types.ts`, `parseSrcSetSourcesList` to `Video/utils`, read by `Image` too.
- changed - **components/Sequencer** - attributes to `types`, helpers to `utils`, under clearer names.
- changed - **components/Scrllgngn** - a `types.ts`, and its two vocabularies become values. Prop types stay in `index`.
- changed - **components/Lightbox** - the store rewritten around `useState` and `useEffect` instead of `useSyncExternalStore`: `getLightboxesStoreState`, `setLightboxesStoreState`, `watchLightboxesStoreState`, `registerLightboxesStoreMember` and its unregister twin, `getMembersOf`, `openLightbox`, `closeLightbox`, `navigateOpenGroupBy`, members held in the state with a single writer, store types in `types.ts`. Two nouns only, lightbox and group.
- changed - **components/utils/viewport-behaviours** - no more suspension, and the `kind` field is gone, on `Video`, `Sequencer` and `ScrollListener`.
- changed - **components/ListLoader** - no retry outlives the unmount.
- changed - **components** - comments trimmed across `Video`, `Sequencer`, `Subtitles`, `JsonEditor` and `Lightbox`. JSDoc on `Video`'s source and track types.

## [0.5.38] — 2026-09-25

- changed - **components/UIModule** - `css` becomes a single sheet, and the contract says to export rules only.

## [0.5.37] — 2026-09-25

- added - **components/UIModule** - `postInit` can return a teardown function.

## [0.5.36] — 2026-09-25

- changed - **components/Video, components/BeforeAfter, components/Clippable** - thirteen positional handlers become named records.

## [0.5.35] — 2026-09-25

- changed - **components/Gallery, components/Sequencer, components/Scrllgngn, components/ListLoader** - five positional handlers become named records.

## [0.5.34] — 2026-09-25

- changed - **components/UIModule** - `destroy` becomes optional, `postInit` is added, and `update` is finally called.

## [0.5.33] — 2026-09-25

- changed - **components/Gallery** - `padding` renamed `offset`, the geometry table freeing the word.

## [0.5.32] — 2026-09-25

- changed - **components/Gallery** - moves to the scroll-range table.
- removed - **components/GalleryAlt** - gone one version after arriving.

## [0.5.31] — 2026-09-25

- added - **components/GalleryAlt** - a gallery deducing the current page from a table of scroll ranges.
- changed - **components/Sequencer** - children flattened by `Children.toArray`, without opening fragments.

## [0.5.30] — 2026-09-18

- added - **components/Sequencer** - the sequence's numbers as custom properties, and a lap counter.
- fixed - **components/Sequencer** - a jump on a finished sequence really restarts it.

## [0.5.29] — 2026-09-18

- changed - **components/Drawer** - the toggle carries a public class that both the click and the CSS read. `closerContent` and `closerBtnSelector` fall back to the opener, and a selector targets the toggle.

## [0.5.28] — 2026-09-17

No consumer-facing change.

## [0.5.27] — 2026-09-17

- changed - **components/Overlayer** - three public tokens, no sheet of its own, and the private properties are finally read.

## [0.5.26] — 2026-09-17

- added - **components/Clippable** - `copyBtnContent` and `clippedBtnContent`.

## [0.5.25] — 2026-09-17

- added - **components/ScrollListener** - `track` and `untrack`. The inner div disappears.
- added - **components/Sequencer** - `data-last-step` says where the sequence stops.

## [0.5.24] — 2026-09-17

- changed - **components/Sequencer** - fragments are opened, not counted as a step.

## [0.5.23] — 2026-09-17

- added - **components/Sequencer** - conditional triggers, six verbs in `Video`'s family.

## [0.5.22] — 2026-09-17

- changed - **components/Video** - `onFullscreenChange` hands control back to the consumer.

## [0.5.21] — 2026-09-17

- changed - **components/Sequencer** - rewritten in one go: a single file, cloned children, and a `stepMap`.

## [0.5.20] — 2026-09-16

- changed - **components/utils/viewport-behaviours** - `isInstruction` moves to the public entry point, where a consumer can reach it.

## [0.5.19] — 2026-09-16

- changed - **components/Video, components/utils/viewport-behaviours** - the vocabulary and its rule become values. `behavioursSuspended` lets the gate talk to the layer.

## [0.5.18] — 2026-09-16

- changed - **components/Video** - the eight `auto…` props become `whenVisible` and `whenHidden`. `togglePlayOnClick` turns the poster into a play surface.
- changed - **components/utils/viewport-behaviours** - the generic trigger layer, with the observer settings as a record.
- changed - **components/utils** - `parseSourceList`, one reading for `Video` and `Image`. The two media lists leave the component.

## [0.5.17] — 2026-09-16

- added - **components/IntersectionObserver** - `useIntersectionObserver`, the same thing without the div.
- changed - **components/Video** - the `figure` is the root, no more wrapper.

## [0.5.16] — 2026-09-15

- added - **components/Video** - a subtitles button, its state and its two modifiers.
- fixed - **components/Video** - `loop` was pulled out of the props and never put back.

## [0.5.15] — 2026-09-15

- changed - **components/Video** - `timeFormat` moves to `formatDuration`, `formatTime` is removed.
- changed - **agnostic/time/dates/format-date** - day names on `ddd` / `dddd`, `d` / `dd` becoming the number.
- changed - **agnostic/time/duration/format-duration** - frames on `{{f}}` / `{{ff}}`, under the millisecond.

## [0.5.14] — 2026-09-12

- added - **components/Video** - a `timeFormat` prop for both clocks, its tokens delimited by `{{…}}`.

## [0.5.13] — 2026-09-11

- added - **node/process/spawner** - a verbosity option, for probes.

## [0.5.12] — 2026-09-11

- added - **components/Lightbox** - `openOnClick`, opening by clicking the content. All controls rendered, a `navigable` modifier, and the modifier follows the prop name.

## [0.5.11] — 2026-09-11

- changed - **components/Lightbox** - the content no longer moves at all, one box that flips. The opening button exists only if it has content.

## [0.5.10] — 2026-09-11

- changed - **components/Theatre** - renamed `Lightbox`, the vocabulary understood.
- changed - **components/Lightbox** - arrow-key navigation, optional. The content is moved rather than duplicated, and groups share a scene.

## [0.5.9] — 2026-09-11

- fixed - **components/Paginator** - `thresholdOffsetPercent` is bounded, and the observation only runs when the page count changes.
- fixed - **components/Video** - the element is read back after a play attempt, since play is a request.

## [0.5.8] — 2026-09-10

- changed - **components** - the missing internal states surface as root modifiers, and the data attributes come back, since CSS can only reach them that way.
- changed - **components/Video** - the continuous values move to custom properties.
- changed - **components/BeforeAfter** - one unitless ratio property, no percent twin, no attribute.
- changed - **components/ResizeObserver, components/Drawer** - the data attributes duplicating the custom properties are dropped.

## [0.5.7] — 2026-09-10

- added - **agnostic/subtitles** - an SRT parser and timecode reader, out of the component. `Subtitles` is rebuilt on it, with positions as identity.
- added - **components/Video** - the ended state, fed to `Subtitles`, and the observer exposed.
- added - **components** - one shared set of observer props across the components that mount one.
- changed - **components/Video** - the visibility props split into `when` and `once` variants.
- changed - **components/Scrllgngn** - viewport offsets, a threshold relative to the visible zone, and a poll for moves a resize observer cannot see.
- removed - **components/Subtitles** - `children`, which had nothing to wrap.

## [0.5.6] — 2026-09-10

- added - **components/Scrllgngn** - per-block `onScrolled`, a scroll context and its DOM exposure.
- added - **components/Paginator** - the page slot elements are exposed to the parent.

## [0.5.5] — 2026-09-04

- added - **components** - the missing handlers on `Clippable`, `Drawer`, `Gallery`, `Scrllgngn`, `ScrollListener` and `Sequencer`.
- changed - **components/Theatre** - `onToggleClicked` splits into per-source click handlers.

## [0.5.4] — 2026-09-04

- changed - **components/Disclaimer** - `content` becomes `children`, the gated content becomes `sensitiveContent`, and the panel message moves to `undisclosedContent`.
- changed - **components/Image, components/Overlayer** - the image theatre prop is dropped, and the overlay content becomes `children`.

## [0.5.3] — 2026-09-03

- added - **agnostic/time/duration/format-duration** - `formatDuration`, with units read off the template, `getDurationParts` for the numeric breakdown, a `floorSmallestUnit` rather than rounding, and `M` / `Y` as short aliases. Out of `Video`, with tests.
- added - **agnostic/time/dates/format-date** - `getDateParts` returns quantities and `formatDate` does the padding, its token alternation ordered longest first.
- added - **components/Scrllgngn** - the current page id as a data attribute.
- added - **components/utils** - `useChangeDispatch`.
- changed - **components** - flat handlers across `Video`, `BeforeAfter`, `UIModule`, `ScrollListener`, `ListLoader`, `Gallery`, `Paginator`, `Subtitles`, `Sequencer`, `Disclaimer`, `Theatre`, `Clippable` and `Drawer`, with past participle names and `useChangeDispatch` behind the state ones.
- changed - **components/Input, components/Select, components/Textarea** - the controlled variants merge into a single hybrid file.
- changed - **components** - CSS variables expose the px length bare and the raw number under a `-raw` twin, written by hand. `toCssVars`, `toDataAttributes`, `_modifiers` and `_dataAttributes` are dropped.
- changed - **components/Image** - owns the disclaimer state and drives `Disclaimer` controlled.
- fixed - **components/Video** - inverted loud and playing states, a guarded time ratio, the controlled time displayed from the prop, and `onFullscreenChange` fired from the real event.
- fixed - **components/Subtitles** - honours `srtFileContent` when no `src` is given.
- fixed - **agnostic/html/deep-select** - keeps the scheduler as `this` when calling `scheduler.yield`.
- removed - **components/Video, components/Image** - the nested disclaimer gate and everything it gated.

## [0.5.2] — 2026-08-28

- added - **components/ListLoader** - a list loader, split controlled / uncontrolled, with paging, staleness, retries and load buttons.
- fixed - **components/JsonEditor** - the type select did not reflect the current value.

## [0.5.1] — 2026-08-27

- added - **node/files/get-size** - a recursive file and directory size util, with tests, then options for concurrency, `onError`, `signal`, `maxDepth`, symlinks, hardlinks and `sizeOf`, then a `timeoutMs` taking a number or a `Duration`.

## [0.5.0] — 2026-08-25

- added - **agnostic/time/dates/to-french-republican** - a French Republican calendar converter, with types, utils and tests.
- changed - **package.json** - dependencies bumped, `uuid` overridden to `^11`, TypeScript held at 5.x.
- fixed - **node/images** - sharp type imports after the upgrade.
