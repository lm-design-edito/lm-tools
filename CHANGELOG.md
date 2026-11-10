# Changelog

Notable changes to `@design-edito/tools`, newest first. Versions follow
[semver](https://semver.org/), loosely: the package is still `0.x`, so a patch
may carry a behaviour change as long as no type breaks.

Each entry names the module it touches, by the path a consumer imports.

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

### Fixed

- **`agnostic/misc/crossenv/detect-runtime`** — `detectRuntime()` no longer
  throws in a browser bundle that defines no global `process`. Every runtime
  marker is now read behind `typeof`, which is the only form that survives an
  undeclared identifier; `?.` does not catch one.
- **`agnostic/misc/crossenv/detect-runtime`** — Cloudflare Workers are detected
  through their documented `navigator.userAgent`, in place of a
  `self.addEventListener && Headers` test that any browser also satisfied.
- **`agnostic/misc/crossenv/detect-runtime`** — AWS Lambda is detected through
  `process.env.AWS_LAMBDA_FUNCTION_NAME`, in place of a global `AWS` that the
  Lambda runtime does not define.

### Changed

- **`agnostic/misc/crossenv/detect-runtime`** — runtimes are now tested from the
  most specific to the most general: Electron, AWS Lambda, Deno, React Native,
  Cloudflare Workers, Node, browser. Several of them are supersets of others, so
  the previous order left some unreachable. **An Electron renderer now returns
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

- Tests for `agnostic/html/deep-select` and `agnostic/html/watch-selection`,
  both over a deep shadow tree.

[0.5.44]: https://github.com/lm-design-edito/lm-tools/compare/v0.5.43...v0.5.44
[0.5.43]: https://github.com/lm-design-edito/lm-tools/compare/v0.5.42...v0.5.43
