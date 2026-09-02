# @design-edito/tools

Shared TypeScript library for the *le-monde* projects: framework-agnostic
utilities, Node-only helpers, and a React/Preact component library.

```
src/agnostic/    pure logic — runs anywhere (time, colors, css, html, random, …)
src/node/        Node-only — files, images, cloud storage, sftp/ftps, encryption
src/components/  React/Preact components, consumed almost exclusively under Preact
demo/            a demo app per component (npm run demo:preact | demo:react)
```

## Scripts

| | |
| --- | --- |
| `npm run check` | typecheck everything under `src` |
| `npm run tests` | vitest over `agnostic` and `node` (component tests are disabled) |
| `npm run build` | build the publishable package |
| `npm run demo` | run the demo app |

Coding conventions live in [CLAUDE.md](./CLAUDE.md) and in the root
[`../CLAUDE.md`](../CLAUDE.md).

---

# Roadmap

## Per-component to-do

Ordered alphabetically, remaining work only — a component drops off the list once it
is done.

**La passe d'alignement est terminée** ; ce qui figure ci-dessous a été ouvert après
elle. Le composant `Disclaimer` existe toujours et s'utilise seul ; c'est son usage
*imbriqué* dans `Video` et `Image` qui a été retiré. L'idée sera reprise ailleurs,
dans `lm-link`.

| Composant | À faire |
| --- | --- |
| `Video` | Dédoubler les quatre props de visibilité en variantes « à chaque fois » et « une seule fois » — voir ci-dessous. |

### `Video` — props de visibilité, variantes répétée et unique

Les quatre props pilotées par l'`IntersectionObserver` mélangent aujourd'hui les deux
sémantiques, et pas de la même façon d'une prop à l'autre. Il en faut huit, une paire
par comportement :

| À chaque franchissement | Une seule fois |
| --- | --- |
| `autoPlayWhenVisible` | `autoPlayOnceVisible` |
| `autoPauseWhenHidden` | `autoPauseOnceHidden` |
| `autoLoudWhenVisible` | `autoLoudOnceVisible` |
| `autoMuteWhenHidden` | `autoMuteOnceHidden` |

État actuel, dans `onIntersected` (`src/components/Video/index.tsx`) :

- `autoPlayWhenVisible` se comporte en fait comme un `OnceVisible` : il est gardé par
  `hasBeenAutoPlayed.current`.
- `autoMuteWhenHidden` est gardé par ce même drapeau, qui passe à `true` sur *tout*
  événement `play`, clic utilisateur compris — le mute à la sortie cesse donc d'opérer
  dès la première lecture. C'est un bug, pas une sémantique `Once`.
- `autoLoudWhenVisible` et `autoPauseWhenHidden` n'ont aucune garde : ils rejouent à
  chaque franchissement.

D'où, à l'implémentation : un drapeau par comportement plutôt que le
`hasBeenAutoPlayed` unique et partagé, et un drapeau armé par le seul déclenchement
automatique, jamais par une action de l'utilisateur. Mettre à jour au passage la
`@remarks` des props, qui documente déjà « the first time » pour `autoLoudWhenVisible`
alors que le code ne le fait pas.

À vérifier aussi : la combinaison `autoPlay*` + `autoLoud*`. Le navigateur rejette un
`play()` non muté hors geste utilisateur, et `forcePlay` avale l'erreur en la loggant.

## Reporté (à traiter plus tard, pas maintenant)

- **`JsonEditor` en mode contrôlé.** Structurellement impossible aujourd'hui : chaque
  éditeur amorce son état depuis `defaultValue` au montage et ne le relit jamais.
  C'est une réécriture du modèle d'état pour que l'arbre lise chez un propriétaire
  unique, pas un alignement. La limite est documentée en `@remarks` sur `JsonEditor`.

## Coverage roadmap

Prioritised backlog of missing tests in `agnostic` and `node`, ranked by real usage in the main consumer (`lm-publisher-composer` + its critical `modules/lm-publisher`, an HTTP/API server) crossed with server-side risk. `components` tests are intentionally out of scope for now.

**How to use this list:** work items top-to-bottom, follow the conventions above, and **delete each entry once its `index.test.ts` exists and passes** (`npx vitest run <path>`). Keep the counts as rationale, not as targets. When usage patterns change, re-derive by cross-referencing the consumer's `.ts` imports against modules lacking a colocated `index.test.ts`.

Usage counts below are `.ts` import sites in `lm-publisher-composer` (the number in parentheses is the subset inside `modules/lm-publisher`).

- **P1 — high usage, pure logic, quick win**
  - [ ] `agnostic/time/duration` — 48 (18). Pure unit conversions feeding every timeout/delay; a silent bug propagates everywhere. Start here.
- **P2 — critical server path, higher risk**
  - [ ] `node/process/spawner` — 12. Spawns child processes → correctness + argument escaping/injection surface.
  - [ ] `node/images/transform` — 20 (8). Core image pipeline (sharp); bad output / crash on user-supplied images. Medium effort (buffer fixtures).
  - [ ] `node/images/format` — 15 (6). Format conversion, same family.
- **P3 — storage/deploy backend, large surface, network I/O (needs fakes/mocks)**
  - [ ] `node/cloud-storage/operations/*` — ~5 each. Best entry point: the path-handling logic (traversal/overwrite risk), testable without network.
  - [ ] `node/sftp/*`, `node/ftps/*`, `node/@google-cloud/storage/*` — ~5 each. Remote file ops; expensive to unit-test well.

**Deliberately deprioritised** (low ROI or off the consumer's path, do not add unless usage changes): `agnostic/time/wait` (trivial `setTimeout`), `node/process/prompt-continue` (interactive stdin, CLI-only), `agnostic/misc/logs/styles` (cosmetic ANSI), any `*/types.ts` (types only), and the large `agnostic/html/hyper-json/*` subtree (~90 smart-tags, not imported by the publisher).

**Security modules not currently on the consumer's path** — worth testing for the library's own robustness (defense-in-depth) but lower priority than P1–P2 until the publisher starts importing them: `agnostic/sanitization/html` (XSS), `node/files/is-in-directory` (path traversal), `node/encryption/*`.

### Inventaire détaillé des tests manquants

Cette liste et la « Coverage roadmap » ci-dessus ont été tenues séparément —
l'une par priorité d'usage, l'autre par arborescence. **Elles se recoupent et
restent à réconcilier.**

- [ ] Tests manquants (garder la forme describe('funcName') { it('does something') {} })
  - [ ] agnostic/html/hyper-json -> nécessaire mais trop compliqué/long
  - [ ] agnostic/html/placeholders -> pas nécessaire
  - [ ] agnostic/misc/logs/make-text-block -> Manque JSDOC aussi
  - [ ] agnostic/strings/char-codes
  - [ ] agnostic/strings/matches
  - [ ] agnostic/strings/parse-table
  - [ ] agnostic/strings/to-alphanum
  - [ ] agnostic/strings/trim
  - [ ] agnostic/time/dates/format-date
  - [ ] agnostic/time/duration (dont format-duration/parts)
  - [ ] agnostic/time/timeout
  - [ ] agnostic/time/transitions
  - [ ] agnostic/time/wait
  - [ ] node/@aws-s3 - oui mais comment (valable aussi pour gcs, ftps & sftp) ?
  - [ ] node/@design-edito - vide
  - [ ] node/@express/@multer
  - [ ] node/@google-cloud
  - [ ] node/cloud-storage
  - [ ] node/encryption
  - [ ] node/files
  - [ ] node/ftps
  - [ ] node/images
  - [ ] node/process
  - [ ] node/sftp

  - Pas utile
  - [ ] agnostic/css/bem -> DEPRECATED
  - [ ] agnostic/css/styles-set -> DEPRECATED
  - [ ] agnostic/errors/register -> pas nécessaire
  - [ ] agnostic/html/sanitization/html -> DEPRECATED
  - [ ] agnostic/misc/assert -> DEPRECATED
  - [ ] agnostic/misc/logs/logger -> presque DEPRECATED
  - [ ] agnostic/misc/logs/styles -> pas nécessaire tout de suite
  - [ ] agnostic/strings/normalize-indent -> pas nécessaire tout de suite, fonction à repenser
  - [ ] agnostic/strings/replace-all -> DEPRECATED

## Fonctions à écrire — diff et messages de commit

Esquisses destinées à `lm-cli`, qui n'a vocation qu'à orchestrer : la logique
métier vit ici, la commande l'appelle.

### Get diff from commit hash

```ts
export type GetDiffOptions = {
  cwd?: string
}

// Pas certain de Array<string> mais c'est peut-être suffisant,
// l'idée c'est d'avoir une liste descriptive des changements successifs sur un fichier (genre le contenu brut de git diff)
export type Diff = Record<string, Array<string>>

// Ou pas async si pas nécessaire
export async function getDiffFrom (
  commitHash: string,
  options: GetDiffOptions = {}
): Promise<Diff> {
  const { cwd } = options
  return {}
}
```

### Generate commit message from diff

```ts
export type GenerateDiffDescriptionOptions = {
  customPromptOrSomething?: string // juste une idée comme ça, sais pas si c'est pertinent
  // Ptet c'est là qu'il faut dire "je veux plutôt un changelog, ou plutôt un message de commit"
}

export async function generateDiffDescription (
  diff: Diff,
  options: GenerateDiffDescriptionOptions = {}): Promise<string> {
  return ''
}
```

## Divers

- [ ] Repenser agnostic/optim/throttle-debounce ?
- [ ] Repenser agnostic/strings/normalize-indent ?
- [ ] Get rid of namespaces in hyper-json ?
- [ ] agnostic/misc/logs/styles, se repencher dessus, viser à substituer totalement chalk (styles génériques, bold, red, bgBlue, etc...) + continuer à exporter des "styles nommés" comme actuellement
