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

## Où en est la bibliothèque

**Rien en attente sur les composants.** La passe d'alignement, la reprise de
`Subtitles`, celle de `Video` et le chantier `Scrllgngn` sont faits ; les états
internes remontent tous en modifieurs de classe racine.

lm-tools n'est pas le sujet principal pour l'instant : l'attention va à la première
publication de lm-link, puis à lm-cli. Ce qui arrive ici viendra surtout de là —
**lm-cli doit rapatrier sa logique métier dans `agnostic/` et `node/`**, en ne
gardant que la coquille CLI chez lui. C'est le prochain vrai chantier de ce dépôt,
et il n'ouvrira qu'une fois lm-link publié.

## Formater un temps — la prop est faite, le composant reste en réserve

Le besoin venait de lm-link : la fiche `video` veut des horloges en `mm:ss`, et le lecteur
les rendait en `mm:ss:ms`, écrit en dur dans `ControlledVideo`.

**Le préalable est levé.** `formatTime` substituait `h`, `m`, `s` et `f` **partout où ces
lettres apparaissaient**, donc `'mm min ss'` rendait `'01 1in 01'` — un format ne pouvait
séparer ses champs qu'avec de la ponctuation, et c'est pour ça qu'on ne pouvait pas
l'exposer : le publier aurait publié le piège. Les jetons sont maintenant délimités en
`{{…}}`, comme dans `agnostic/time/dates/format-date`, avec la même alternation ordonnée
du plus long au plus court. Tout ce qui est hors délimiteurs est littéral, donc
`'{{m}} min {{ss}}'` marche, et un jeton inconnu reste écrit tel quel plutôt que d'être
blanchi — une faute de frappe doit se voir.

**C'est une rupture pour `formatTime`**, dont la grammaire change : `'mm:ss'` est
désormais du texte littéral. Les deux seuls appels étaient internes et sont à jour.

**La prop est là.** `timeFormat` sur `ControlledVideo`, donc sur `Video` par héritage,
appliquée aux deux horloges. Le défaut reste `'{{mm}}:{{ss}}:{{ms}}'` — c'est ce que le
composant a toujours rendu, et un défaut qui change sous un consommateur est un changement
que personne n'a demandé. Il est discutable : les millisecondes sont ce qu'une salle de
montage veut et presque jamais ce qu'un article veut. À revoir le jour d'une version qui
assume de bouger, pas dans un correctif.

Ce que ça ne couvre pas, et qui attend une demande : `fps` n'est pas exposé, donc
`{{frame}}` et `{{f}}` dérivent de 25 im/s ; et un format qui omet `{{hh}}` **perd** les
heures au lieu de les replier dans les minutes — une vidéo d'une heure et deux minutes en
`'{{mm}}:{{ss}}'` affiche `02:05`. C'est documenté sur la fonction, et c'est le genre de
chose qu'une fiche de démo doit redire.

### Le composant à jetons, si le besoin revient

L'autre forme envisagée : un composant `Duration` / `Time` rendant un `<span>` par jeton,
chacun porteur de sa classe, pour qu'une feuille masque les morceaux qu'elle ne veut pas.
Ce qu'il ajoute sur la prop : le choix devient **stylable**, donc conditionnel — les heures
sur large, `mm:ss` sur mobile, sans qu'un article l'ait prévu. Et il servirait ailleurs que
dans `Video` : la démo de lm-link appelle déjà `formatDate` à la main pour composer les
dates de `lm-article-meta`.

La prop n'est pas un détour vers lui, c'en est la première moitié : même formateur, même
vocabulaire de jetons. Il cesse d'être surdimensionné le jour où quelqu'un veut un temps
qui dépend du contexte, ou le jour où `lm-article-meta` réclame le même traitement.

Le détail qui fait tout, si on l'écrit : **le séparateur appartient au jeton qui le suit**.
Masquer `__ms` doit emporter son `:`, sinon on obtient `00:05:` — donc chaque morceau est un
span qui contient son propre séparateur, et non une suite plate de jetons et de
ponctuations. À noter aussi : les horloges se re-rendent à chaque `timeupdate`, donc ce
composant multiplie par six ce qui est diffé à chaque tick.

## `node/shells/@<vendor>` — un chantier à ouvrir

Deux projets du workspace pilotent des CLI depuis du TypeScript, et refont chacun de son
côté les mêmes enveloppes : `lm-publisher-composer/scripts/` (`gcloud.ts`, 496 lignes,
`atlas.ts`, 227) et `lm-link/scripts/deploy/`. Les deux consomment déjà `spawner`,
`promptContinue` et `styles` d'ici, donc la couche basse est en place — ce qui manque est
l'étage au-dessus, les commandes elles-mêmes.

La forme proposée : un espace de noms par fournisseur, sous `node/shells/`.

- **`@gcloud`** — les dix `ensureXxx` du composer (projet, bucket, compte de service,
  rôle, dépôt d'artefacts, identifiants), plus le rsync, le `-j`, les `Cache-Control` et
  les ACL du déploiement de lm-link.
- **`@mongodb-atlas`** — l'`atlas.ts` du composer : organisation, projet, listes
  d'accès, cluster, utilisateur, hostname.
- **`@git`** et **`@npm`** — l'état de l'arbre, le commit courant, le commit jalon ; le
  registre courant et la publication. Les deux repos en ont chacun leur version.

Deux formes se dégagent déjà et valent d'être écrites avant les enveloppes elles-mêmes :
**`ensure(label, probe, create)`**, la structure commune aux dix `ensureXxx` (lister,
parser, trouver, créer sinon, logger), et un **runner d'étapes** où chaque étape déclare
ce qu'elle laisse derrière elle en cas d'échec ultérieur — la version écrite dans
`lm-link/scripts/deploy/steps.ts` sert de brouillon.

Pas encore remonté par décision : on écrit d'abord chez l'appelant, on récolte quand un
deuxième appelant existe. Voir « Le déploiement » dans le README de lm-link pour la liste
complète des candidats.

## En sommeil

Aucun des quatre n'a d'importance à court terme. Ils sont ici pour ne pas être
redécouverts par surprise, pas pour être traités.

- **`Disclaimer` n'a pas reçu la passe d'alignement**, sur deux points, et lm-link
  contourne les deux aujourd'hui.

  D'abord il **rend ses éléments sous condition** : `__toggler` n'existe que si
  `togglerContent` est fourni, `__content` que si `undisclosedContent` l'est. `Lightbox`
  fait l'inverse — ses quatre contrôles sont rendus en permanence, et c'est la feuille
  qui décide lequel est atteignable, `:empty` distinguant le vide du rempli. La
  conséquence est sévère : un disclaimer sans `togglerContent` est **indismissable**,
  aucun élément n'existant à habiller.

  Ensuite le toggler est une **`div` portant un `onClick`**, là où `Lightbox` rend de
  vrais `<button type='button'>`. Sans `tabIndex`, sans rôle, sans gestion clavier :
  l'avertissement ne se lève donc qu'à la souris ou au doigt.

  lm-link s'en sort en glissant un `<button>` dans `togglerContent` — l'élément existe
  donc toujours, le clic remonte au gestionnaire de lm-tools, et `Entrée` l'atteint. Le
  jour où on revient ici, aligner sur `Lightbox` rendrait ce contournement inutile.

- **La démo est en pause, et le reste.** Ne pas y passer de temps ; n'y toucher que
  si un changement l'empêche de compiler. Une chose à savoir le jour où elle
  reprendra : `BeforeAfterDemo` lit `--{prefix}-ratio-percent` en six endroits, une
  propriété supprimée parce qu'un ratio n'a pas de jumeau — remplacer par
  `calc(var(--lm-before-after-ratio) * 100%)`. Elle compile, elle s'affiche de
  travers.

- **`Scrllgngn` — pas d'interrupteur pour le scrollytelling CSS pur.** Le tracking
  s'active à la seule présence de `onScrolled`, donc un bloc qui ne voudrait que les
  variables CSS et les `data-*`, sans handler, doit en déclarer un vide. Rouvrir un
  booléen si le cas se présente un jour. Marqué `[WIP]` sur `PropsCommonBlock`.

- **`JsonEditor` en mode contrôlé.** Structurellement impossible aujourd'hui : chaque
  éditeur amorce son état depuis `defaultValue` au montage et ne le relit jamais.
  C'est une réécriture du modèle d'état, pas un alignement — et sa racine restera
  sans modifieurs jusque-là, pour ne pas figer une API sur une structure qu'on sait
  devoir changer. La limite est documentée en `@remarks` sur `JsonEditor`.

## Coverage roadmap

Prioritised backlog of missing tests in `agnostic` and `node`, ranked by real usage in the main consumer (`lm-publisher-composer` + its critical `modules/lm-publisher`, an HTTP/API server) crossed with server-side risk. `components` tests are intentionally out of scope for now.

**How to use this list:** work items top-to-bottom, follow the conventions above, and **delete each entry once its `index.test.ts` exists and passes** (`npx vitest run <path>`). Keep the counts as rationale, not as targets. When usage patterns change, re-derive by cross-referencing the consumer's `.ts` imports against modules lacking a colocated `index.test.ts`.

Usage counts below are `.ts` import sites in `lm-publisher-composer` (the number in parentheses is the subset inside `modules/lm-publisher`).

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
