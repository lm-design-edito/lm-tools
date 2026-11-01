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

**Rien de bloquant en attente sur les composants**, mais deux sujets ouverts qui les
traversent : « Le trou de synchronisation des événements de `Scrllgngn` » et
« Les payloads de handlers — ce qui reste ouvert » plus bas. Aucun des deux ne bloque la
première publication de lm-link. La passe
d'alignement, la reprise de `Subtitles`, celle de `Video`, le chantier `Scrllgngn` et
la mise en conformité d'`UIModule` sont faits ; les états internes remontent tous en
modifieurs de classe racine.

**Le chantier du moment est une passe de rangement**, et c'est elle qui passe devant la
route vers la publication de lm-link : on finit ici ce qui est en cours avant de reprendre
là-bas. On y reconstruit **la conscience de la visibilité**, de zéro : le relevé de
`components/utils/viewport-behaviours` a conclu que la couche se tenait mal, et le code
qui la portait est sorti du dépôt plutôt que d'être amendé — voir « La couche de
visibilité, démontée » plus bas. Viennent ensuite les sujets portés de session en
session : le motif `when*` pour les trois composants d'un bloc, et la question `css` /
`html`. The prop types are settled rather than pending: every `Props` is a flat
intersection, and it **stays in `index.tsx`** — moving them to `types.ts` was considered
and dropped, since both files are published entry points and `Scrllgngn/utils.ts` already
reads `PropsBlock` and `PropsPage` from the index. What that leaves is the type-only cycle
between those two files, which is erased at compile time and needs its own call.

Passé ce rangement, lm-tools n'est plus le sujet principal : l'attention va à la première
publication de lm-link, puis à lm-cli. Ce qui arrive ici viendra surtout de là —
**lm-cli doit rapatrier sa logique métier dans `agnostic/` et `node/`**, en ne
gardant que la coquille CLI chez lui. C'est le prochain vrai chantier de ce dépôt,
et il n'ouvrira qu'une fois lm-link publié.

**Withholding a component is the library's business again, and `behavioursSuspended` is
not how.** That prop left before the layer did, and the principle it left behind — the
caller withholds by not passing the props that start something — has been reversed:
`components/utils/disclosure` now carries the notion, every receiver is gated in
`useCommands`, and the four components with an act of their own hold it themselves. See
« Disclosure — what a standing disclaimer withholds » below. What waits in lm-link is a
removal: `contexts/Disclaimer`, the per-passerelle `toUndisclosedProps`, and two
`Omit<…, 'behavioursSuspended'>` that name a prop nothing declares.

**L'harmonisation du motif `when*` n'est plus un sujet à part** : elle était la question
posée aux trois composants d'un bloc, et c'est désormais la reconstruction qui y répond.

**Another one, same shelf: moving every component's prop types into its `types.ts`.**
Today they sit in `index.tsx`, next to the component, and that stays the rule for now.
`Scrllgngn` is the one place where it bites: its `utils.ts` needs `PropsPage` and
`PropsBlock`, so it imports them back from `index.tsx` while `index.tsx` imports its
functions — a type-only cycle, accepted deliberately for this one component. Doing it
properly means moving the prop types of all of them at once and fixing the imports
after, which is a pass of its own.

**Un chantier ouvert aujourd'hui : faire courir les tests sur `src/components/`.**
`npm run tests` ne couvre que `agnostic/` et `node/` — `tests:components` est commenté
dans `package.json` — et la couche des commandes est la première à en souffrir vraiment.
`parseCommand` a des règles d'ordre, des collisions et une dizaine de cas de rejet : c'est
exactement ce qu'un test unitaire tient, et c'est le seul dossier que vitest ne regarde
pas. `splitFirst` n'a eu ses six tests que parce qu'il est sorti dans `agnostic/`, et la
grammaire ne peut pas l'y suivre. À faire plus tard, mais c'est de là que le chantier des
tests de composants doit partir : `commands`, `comp-id`, `visibility`, qui sont des
fonctions pures et des hooks avant d'être des composants.

**And on the same shelf, in no hurry at all: what belongs in `agnostic/css` and what
belongs in `agnostic/html`.** `mergeClassNames` moved to `css/merge-class-names`, next
to `clss`, `bem` and `is-valid-css-class-name` — but a class name is an HTML attribute
value, not a CSS construct, and `isValidClassName` proves it: it rejects a leading dot,
so it validates what goes in `class="…"`, never a selector. The whole family may read
better under `html/`. Worth deciding once, for all of them together, rather than moving
one and splitting the set.

## Le trou de synchronisation des événements de `Scrllgngn`

Constaté en préparant la fiche `ui-module` de lm-link, et **pas propre à `UIModule` :
il concerne tout consommateur JS des événements de `Scrllgngn`.**

Un module vivant dans un bloc fixe écoute ce que le bloc dispatche via `onScrolled`. Or
`Scrllgngn` fait une passe de mesure dès l'abonnement, sans attendre un scroll : le
contexte vrai est donc émis **une fois**, au montage. Un module chargé par `import()`
naît après. Il rate cette émission, et le garde `contextsAreEqual` empêche toute
ré-émission tant que rien ne bouge.

**La condition exacte : bloc dans sa zone d'affichage au moment où le consommateur
naît, et lecteur immobile.** Le déclencheur le plus probable est un rechargement de page
avec restauration du défilement — Chrome rend la main au milieu du document —, mais un
import lent pendant que le lecteur entre en zone puis s'arrête produit le même état. Tant
que le lecteur défile, la frame suivante redispatche et tout se répare seul : le trou ne
persiste que dans l'immobilité.

Ce n'est **pas** un problème hors zone d'affichage : là, il n'y a rien de vrai à dire —
`indexOfCurrentPageInDisplayZone` vaudrait `-1`, `contiguousDisplayZone` serait vide — et
l'entrée en zone déclenche un dispatch garanti, `lastContexts` n'ayant pas d'entrée pour
le bloc.

Une piste existe et n'est pas instruite : la projection DOM du contexte — les trois
propriétés personnalisées et les cinq attributs `data-` — est un **état** qui reste
lisible à tout moment, là où l'événement est un front qui passe une fois. Avec
`postInit`, qui donne au module un élément attaché, elle rendrait sa naissance
indifférente à l'heure. À trancher.

### Ce que la mise en conformité d'`UIModule` a réglé, et ce qu'elle n'a pas réglé

Le contrat `ModuleData` décrivait un cycle de vie que le composant ne tenait qu'à moitié.
C'est fait : `destroy` est optionnel — son oubli faisait échouer la **validation**, donc
un module sans rien à défaire était puni comme un module cassé ; `update` est réellement
appelé, sur changement d'**identité** du record de props, le composant ne sachant rien des
valeurs ; `postInit` a été ajouté, appelé juste après l'`appendChild`, seul moment où le
module tient un élément attaché — `init` travaille sur un nœud détaché, où mesurer une
boîte rend des zéros sans que rien ne lève ; et `init` lit désormais les props courantes
par une ref, au lieu de celles capturées dans la fermeture de l'effet `[src]`.

**`postInit` plutôt qu'un premier `update` d'office** : les deux fermaient le même trou,
mais surcharger `update` lui aurait donné deux sens et obligé chaque module à porter un
drapeau pour les distinguer.

**En hyper-json, `update` ne sera jamais appelé**, les props d'un article étant statiques.
Il a été réparé pour un consommateur React ; ce qui paie pour lm-link, c'est `postInit`.

## Les payloads de handlers — ce qui reste ouvert

**La règle est tenue : les 79 handlers prennent exactement un argument**, nommé dès
qu'ils en portent plusieurs. Les dix-huit qui étaient positionnels sont convertis — cinq
qui portaient deux scalaires (`onPaginationClicked`, `onStepChanged`, `onPageChanged`,
`onPageFetched`, `onPageFetchFailed`), puis les treize qui portaient un contexte d'appel :
les dix de `Video`, `onClicked` et `onDragged` sur `BeforeAfter`, `onCopyClicked` sur
`Clippable`.

Rien ne s'est perdu au passage : `event` et l'élément — `videoElement` sur `Video` —
restent transmis, ils sont là volontairement et un consommateur React s'en sert pour
empêcher un défaut ou piloter la balise. Les dix de `Video` partagent le type
`VideoActionPayload<E, T>`, qui pose `event` et `videoElement` une fois pour toutes.

**Deux questions restent ouvertes, et aucune ne bloque la publication de lm-link.** Le
passage au record les rend visibles là où le positionnel les masquait : écrit
`{ event, isOn, videoElement }` d'un côté et `{ isOn }` de l'autre, l'écart saute aux
yeux.

- **Un handler d'action porte-t-il toujours son événement ?** Une quinzaine ne le font
  pas : `onBackgroundClicked`, `onContentClicked`, `onCloseButtonClicked`,
  `onOpenButtonClicked`, `onDismissClicked`, `onEscapePressed`, les quatre
  `on(Next|Prev)(Button|Arrow)(Clicked|Pressed)`, `onOpenerClicked`, `onCloserClicked`,
  `onPrevClicked`, `onNextClicked`, `onLoadPageClicked`. `onEscapePressed` est le cas le
  plus parlant : une pression de touche qui ne transmet pas son `KeyboardEvent`.
- **Un composant expose-t-il son élément interne ?** Posture bien plus engageante : seul
  `Video` le fait. Les composants d'observation le donnent indirectement — `onResized`
  passe l'entrée qui contient `.target`, `onIntersected` passe `ioEntry` et `observer` —
  mais ni le scroller d'une galerie, ni le contenu d'un tiroir, ni la surcouche d'une
  lightbox ne sont atteignables.

Une note de méthode : le relevé ne se fait pas au `grep`. Les signatures multi-lignes lui
échappent — c'est ainsi qu'`onCopyClicked` a été manqué deux fois — et
`index.controlled.tsx` doit être dans le périmètre au même titre qu'`index.tsx`.

## Formater un temps — une seule grammaire pour les dates et les durées

Le besoin venait de lm-link : la fiche `video` veut des horloges en `mm:ss`, et le lecteur
les rendait en `mm:ss:ms`, écrit en dur dans `ControlledVideo`.

**Le doublon est supprimé.** `Video` portait sa propre `formatTime` dans
`components/Video/utils.ts`, qui réécrivait la cascade heures → minutes → secondes →
millisecondes **en dur**, sans regarder le gabarit. Elle perdait donc tout ce que le
gabarit ne nommait pas : une vidéo d'une heure et deux minutes affichée en `{{mm}}:{{ss}}`
disait `02:05`. `agnostic/time/duration/format-duration` faisait déjà la bonne chose — et
la faisait depuis le début. `Video` l'appelle maintenant, et `formatTime` n'existe plus.

**Le gabarit décide du découpage**, et c'est la règle qui fait que rien ne se perd :
`unitsInFormat` relève les unités que le gabarit nomme, `getDurationParts` ne découpe la
durée que sur celles-là, chacune prenant sa part entière et passant le reste à la
suivante. Les heures roulent donc à 168 quand la semaine est là et que le jour ne l'est
pas — `'{{w}}w {{h}}h {{s}}s'` rend `2w 77h 1810s` — et `'{{mm}}:{{ss}}'` sur une heure de
vidéo rend `62:05`. Le cas à une seule unité découle de la même règle : `'{{s}}s'` porte
la durée entière.

**La grammaire est commune à `formatDate` et `formatDuration`.** Qui a appris l'une
connaît l'autre : jetons délimités par `{{…}}`, tout le reste littéral, alternation
ordonnée du plus long au plus court, le jeton nu porte le nombre et le jeton doublé le
même nombre padé sur deux chiffres, `ms` sur trois, et un jeton inconnu reste écrit tel
quel — une faute de frappe doit se voir.

**Aucun jeton ne dit plus deux choses selon la fonction.** Il en restait un : `d`/`dd`,
qui rendaient un *nom de jour* côté date (`Thu`, `Thursday`) et un *nombre de jours* côté
durée. C'était le seul endroit des deux fonctions où le même jeton changeait de nature, et
le seul qui violait la règle « doublé = padé ». Les noms de jours sont donc passés en
**`ddd`/`dddd`**, qui calquent les `MMM`/`MMMM` des mois déjà en place, et `d`/`dd` sont le
numéro du jour des deux côtés. `D`/`DD` restent, inchangés : c'est la même valeur sous son
ancienne orthographe, et rien de ce qui les utilisait ne bouge.

Ce qui reste propre à chaque domaine ne se recoupe pas : la date a son méridien, son
suffixe ordinal et son horloge 12 h (`h`/`hh`, contre `H`/`HH` pour la 24 h), la durée a
ses semaines et ses images.

**Les images ont suivi `formatTime` dans `formatDuration`**, en `{{f}}`/`{{ff}}` avec une
option `fps` à 25 — `{{frame}}` a disparu, personne ne l'appelait et `f`/`ff` respecte la
règle du doublement. Une image n'est pas une unité : c'est la part de millisecondes comptée
dans une autre base, donc `f` et `ff` sont rangés **sous `ms`** dans la table des unités et
demander une image fait descendre la cascade jusqu'aux millisecondes sans qu'on ait à
écrire `{{ms}}`. La troncature est volontaire — une image n'est atteinte qu'une fois
écoulée, donc 39 ms à 25 im/s sont l'image `0`.

**La prop est là.** `timeFormat` sur `ControlledVideo`, donc sur `Video` par héritage,
appliquée aux deux horloges. Le défaut reste `'{{mm}}:{{ss}}:{{ms}}'` — c'est ce que le
composant a toujours rendu, et un défaut qui change sous un consommateur est un changement
que personne n'a demandé. Il est discutable : les millisecondes sont ce qu'une salle de
montage veut et presque jamais ce qu'un article veut. À revoir le jour d'une version qui
assume de bouger, pas dans un correctif.

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

## Reading a time — `parseDate` and `readDate` are both in

**`parseDate` is written**: `agnostic/time/dates/parse-date`, the exact mirror of
`formatDate` — the same token grammar, read backwards. `parseDate(raw, format,
locale = 'en', { reference })` gives a `Date` or `null`. The token table is a
`satisfies Record<DateToken, TokenReader>` and the `{{…}}` alternation is built from its
keys, so a token added to `format-date` stops compiling here until it is read too. Commits
`fc79ef0` and `edb400c`.

Three decisions are settled there, and they hold for `readDate` as well:

- **What the template does not name comes from the reference date**, except the parts finer
  than the finest one it does name, which take their minimum (0, or 1 for month and day). A
  year alone is therefore the first instant of that year, a time alone is that time today,
  and a template naming no part of a date reads as `null`.
- **Reading is lenient about what writing had to settle** — case ignored, a bare token
  accepting the padded form, any run of whitespace — and **strict about what is not an
  instant**: a part out of range, a 31st of February, a part named twice that contradicts
  itself, an hour daylight saving skips. All of it reads as `null`; nothing throws.
- A two-digit year takes the `strptime` pivot (69–99 → 1969+), and a 12-hour clock with no
  meridiem reads as the morning.

`monthNames` and `weekdayNames` were private to `format-date/parts.ts` and both modules want
them, so they moved to `dates/calendar-names`.

### `readDate` — what is decided, and what is left to do

The need comes from dlbbm's post-creation script, which asks for a publication date in
`YYYY-MM-DD HH:MM`: one wants to write `next thursday at 9:20pm`, `in 3 days, at midnight`,
`yesterday`. It would go in `agnostic/time/dates/read-date`, as `readDate(raw,
locale = 'en', { reference })` → `Date | null` — the same shape as `parseDate`, minus the
template. **It is written**, commit `5339b1e`, in three stages: a lexer down to atoms, a
fold into ops, and one application onto a cursor started from the reference.

It was `inferDate`, in `agnostic/time/dates/infer-date`, for as long as it was being
written — the commits up to `45e4ed2` carry that name, which is where to look for the
history. It was renamed the day before it first shipped, nothing having been published
under the old one: `read` is the verb this section and the JSDoc had been using all along,
where `infer` named the one thing the function shares with `parseDate` — filling in the
parts the string never mentions — rather than the thing that tells them apart.

**One rule was settled while writing it, and it is the one to remember: naming a day gives
that day at midnight, offsetting by a duration keeps the time of day.** So `tomorrow` is
tomorrow at 00:00 and `next december` is the 1st at 00:00, while `in 3 days` is this same
hour three days out — which is what gives `in 3 days, at midnight` something to add. It
falls out of the op model: every op carries the finest part it names, an offset names none,
and the truncation at the end only reaches below the finest part named. GNU `date` draws the
same line between a relative item and a day-of-week one.

**The strategy is token by token**, and the roles are the grammar: the token table is data,
and the engine does not move when a row is added to it.

| Role | Tokens | What it does |
|---|---|---|
| value | `tomorrow`, `december`, `thursday`, `6th`, `2019`, `9:20pm`, `noon`, `3`, `two`, `days` | names fields (`december` → M=12), or a quantity, or a unit |
| orientation | `in`, `next`, `last`, `this`, `ago`, `from now` | gives a value a sign and a mode — shift or seek |
| qualifier | `at`, `on`, `of` | says what the next value is: `at 9` is an hour, `on 9` a day |
| filler | `the`, `a`, `,`, `and` | dropped, except `a` before a unit, where it is the quantity 1 |

The fold carries **two pieces of state only** — a pending orientation and a pending
qualifier — and walks left to right. An orientation can arrive before its value (`in 3
days`, `next thursday`) or after it (`3 days ago`, `3 days from now`), so a quantity+unit
pair waits for a sign on either side and is refused if none comes: a bare `3 days` is not a
date. An orientation on a field-setter is a seek (`next december`); on a unit it is a
calendar step (`next week`). Every op records the finest field it touches, and that is what
feeds the consolidation `parseDate` already has.

**A seek never lands back on where it started.** That is the rule lifting the three
ambiguities: in October 2026 `last december` is December 2025 and `next december` is
December 2026; asked on a Thursday, `next thursday` is seven days out. A bare `december`,
with no orientation, simply sets the month in the reference year — nothing asked for a seek.

The taxonomy to recognise, and what is out of scope for a v1:

| Family | Operation | Examples |
|---|---|---|
| Day anchor | set, or shift ±1 day | `today`, `yesterday`, `tomorrow` |
| Offset | shift by a `Duration` | `in 3 days`, `two weeks ago`, `in half an hour` |
| Calendar step | shift by one calendar unit | `next week`, `last month`, `next year` |
| Seek | shift until a field matches | `next thursday`, `last friday`, `last december` |
| Month & year | set M, Y | `december`, `in december`, `dec 2019`, `in 2019` |
| Calendar date | set D, M, Y | `6 january`, `january 6th 2019`, `the 6th` |
| Clock time | set H, m | `9:20pm`, `21:20`, `9pm`, `at 9` |
| Named time | set H, m | `midnight`, `midday`, `noon`, `morning`, `evening`, `night`, `tonight` |
| Compound | fold several ops, in order | `next thursday at 9:20pm`, `in 3 days, at midnight`, `tomorrow morning` |
| Out of v1 | — | `Q3`, `week 32`, `from monday to friday`, `demain` |

**The named times are arbitrary, and owned as such**: `morning` 08:00, `evening` / `night` /
`tonight` 20:00, `midnight` 00:00, `midday` / `noon` 12:00. `tonight` carries two things —
today, *and* 20:00 — which the role table takes without a special case. `the day after
tomorrow` is not in: we do not go that far.

**Lenient means five precise things.** Runs of whitespace and punctuation are separators and
are dropped, so `in 3 days, at midnight` and `in  3 days — at midnight` tokenize alike; a
token no table knows is skipped rather than fatal, which is what makes `please publish this
tomorrow at 9pm` work; nothing is positional, `9pm next thursday` and `next thursday at 9pm`
land on the same instant; when two ops set the same field, **the later one wins**; and
`null` is reserved for the case where no token named a date at all. The compound shapes that
must survive the split — `9:20pm`, `21:20`, `6th` — are recognised before it, not after.

Two reuses fall out on their own: the month and weekday tokens come from `calendar-names`,
so `readDate('en décembre', 'fr')` works without a second table, and the unit tokens come
from `Duration`'s own suffixes, so `in 3 d` and `in 3 days` are one row each.

The out-of-v1 rows are reachable from this shape, which is the real argument for it:
`christmas` and `easter` are only more `value` tokens, `the last friday of july` is a seek
joined by `of` to a period — the grammar already has `of` —, and `week 32` and `Q3` want a
period that is not a Y/M/D field. Only `end of the month` wants a genuinely new op:
collapsing to the **end** of the named precision rather than to its start.

**A second pass went in** (commit after `5339b1e`), and it was mostly about silent wrong
answers rather than missing features. `21h30` used to read as the 30th of the month, because
the lexer split it into `21`, `h` and `30` and `h` is the hours unit — so the compact clock
is now a lexer row of its own: `9h`, `9h30`, `9h30min`, `9h30min20sec`. A bare `9h` is the
only ambiguous one and the fold settles it on the sign in front: `in 9h` is nine hours,
`at 9h` and `9h` are nine o'clock. `at 9 h` reads as nine o'clock too, since a qualifier
has already said what the number is and the unit behind it is noise.

**A sign now carries across the string instead of being consumed once.** `in 2 days and
3 hours` used to read as *in 2 days* with the hours dropped on the floor. A prefix sign
(`in`, `plus`, `minus`, `+`, `-`) arms everything after it, a postfix one (`ago`, `later`,
`from`, `hence`) reaches back over every quantity read before it, so `2 days and 3 hours
ago` is both too. `+` and `-` are atoms the lexer keeps, where all other punctuation is a
separator.

**A direction now moves the day a time of day belongs to** — `last night` is yesterday at
20:00 rather than today's, `next morning` is tomorrow's — and `afternoon` joined the named
times at 14:00, by the same arbitrary convention as the rest.

**`readDate` never refuses over a token it does not know, and that is decided.** The
alternative — returning `null` when a digit or a unit was dropped — was weighed and turned
down: being lax is the point, and the cases that argued for it were coverage gaps, not a
reason to fail. What it does instead is hand the pieces it could not use to an `onIgnored`
callback, with the answer unchanged, so a prompt can say « ignored: quarter » in its own
voice through the `styles` registry. The library prints nothing itself. The shape that still
needs the warning is `the 3rd quarter`, read as the 3rd: an unknown word changing the meaning
of a number that *was* read.

**The tests carry a corpus**, one line per string, next to the behaviour-named ones. The
rules are stated by the latter; coverage is stated by the former, which is what catches a
`9h30` turning into the 30th when the lexer is touched — see the last paragraph of this
section for what the file holds now.

**A third pass turned `after`, `before`, `from` and `of` into operators read right to
left** (`c6487f8`, `89fd03e`, `5faac57`). What follows the operator places the date and what
precedes it is applied to that, so the left-hand phrase is set aside and replayed once the
right-hand side has resolved: `2 days after next friday` finds the Friday first, and `the
1st of next month` moves the month before writing the day — which is where a day the month
has not got is clamped to its last rather than rolling over (`the 31st of next month` asked
in January is February's end, not March 3rd). Ordinal words came in with it, and `second` is
told from the time unit by whether a quantity precedes it. The week a weekday scopes to when
a date has already been placed opens on Monday, and `weekStartsOn` says otherwise —
`Intl.Locale.prototype.getWeekInfo` carries it per locale but TypeScript ships no
declaration and Node has not implemented it, so an argument says it out loud instead.

**And what `of` names is a period, which its left-hand side counts inside.** `the last
friday of july` is the 31st and `the second friday of july` the 10th, where a plain backward
seek walks out of July altogether. An op now receives the scope it is being resolved in, the
period is collapsed before the left-hand side acts, and the second pass only truncates as
deep as that side itself named — otherwise `2 days after july` came back to July 1st. A bare
`day` names either end of the period (`the last day of july`), and a weekday in front of an
operator reads the way the operator points, so `the friday before the 20th` looks back from
the 20th. `the day after tomorrow` and `the day before yesterday` fell out for free.

**A fourth pass put in the named days of the year and the ends of a period** (`f63c1d4`).
`christmas`, `new year`, `halloween`, `all saints`, `all souls`, `valentine's day`,
`epiphany`, `april fools`, `may day`, `bastille day`, `armistice day`, `boxing day`, and
`easter` with `palm sunday`, `good friday`, `easter monday`, `ascension` and `pentecost`
hanging off an anonymous Gregorian computus — the one date in the tables that is computed
rather than looked up. One of them alone is the next occurrence, today included, where
`this` stays in the reference year and `next` and `last` step one. A phrase of two words is
matched before a single one so that `may day` is not May, a trailing `day` is absorbed, and
the lexer drops the possessive `s` so that `new year's eve` is three words. An `eve` is the
evening before — the day before at 20:00, which is what puts `new year's eve` on December
31st. They are days like any other, so the whole vocabulary composes with them: `the friday
before christmas`, `christmas + one week, on monday`, `2 days after easter`, `the end of
easter month`.

`end`, `beginning` and `start` name the edges of a period in a word — `the end of july`,
`the beginning of next month` — on the mechanism `the last day of july` had already built.
Two things had to move for it: a calendar step now declares the period it names without
collapsing to it, so that `the end of next month` has a month to work in, and a unit no
number reached names the period the cursor already sits in (`the end of the month`, `the end
of this year`). A clock named anywhere in the string now survives a period seek, where it
used to be overwritten — `the end of the month at 6pm` keeps its hour. `week` is not a
Y/M/D field, so `the end of the week` hands `week` to `onIgnored` and answers as if it had
not been said. And `weekend` reads as its Saturday, which makes every weekday rule hold of
`this weekend`, `next weekend` and `the last weekend of july` without a line of its own.

**A fifth pass read the forms a machine or a form field writes** (`efb75d9`). A date in
digits is now taken in three parts with `-`, `/` or `.` between them: a four-digit head is
a year and the order is the one it opens (`2026-03-14`, `2026/3/4`), anything else is read
day first (`14/03/2026`, `14.03.26`), and a two-digit year takes the `strptime` pivot.
**The American month-first order is deliberately not read**: the same string means two
different days, and the locale could not settle it either — the module reads a locale for
names, not for digit order, so inferring the order from a tag nobody set deliberately
would be worse than refusing. `03/14/2026` is therefore impossible as a day-first date and
reaches `onIgnored` whole rather than being quietly re-read. Two parts work too: `2026-03`
and `3/2026` are a month, `14/03` a day of this year's March. If the US order is ever
needed it should be an explicit option, not a guess.

A clock now reads down to the millisecond (`09:20:05.123`, and `,12` padded to the right),
which put a sixth step on the precision scale, so a whole ISO instant goes through with its
`T` — counted as noise rather than reported. Its zone does not: a `Date` holds no zone of
its own and the whole `dates` family is wall-clock, so `Z` and `+02:00` are recognised **in
order to be reported**, which is what stopped `+02:00` from landing as two o'clock. A
decimal is a quantity (`in 1.5 hours`), a fraction with no unit of its own is counted in the
one before it (`in an hour and a half`) while a whole number never is, and `same time` names
the reference's own clock so that it survives the midnight a named day imposes — `same time
tomorrow`, `this time next week`. `veterans day` came out of the table in the same pass:
Armistice Day and Remembrance Day already name the 11th of November, and a holiday of one
country alone does not belong in a table that reads as international.

**Where the weight sits.** 14.4 kB minified, 4.9 kB gzipped, of which the token tables are
1.5 kB / 0.65 kB and `Duration` 1.8 kB / 0.48 kB. A call is 7.5 to 11 µs depending on the
string, and the fifth pass costs about 8 % over the fourth — the bigger lexer alternation —
measured A/B in one run. The absolute figure moves with the machine and is not comparable
from one session to the next.

**The vocabulary is considered complete**, and what is left out is left out on purpose:

| Form | Why not |
|---|---|
| `nine o'clock`, `half past nine`, `quarter to five` | the spoken clock: number words as hours, then a `past`/`to` operator. Set aside — a date field is typed, not spoken |
| `the end of the week`, `the week of the 6th` | a period that is not a Y/M/D field: a week scope through `truncate` and `periodEnd`, which `weekStartsOn` would then reach. Set aside; `week` is reported |
| `week 32`, `Q3`, `the 3rd quarter` | the same, one step further out. `the 3rd quarter` reads as the 3rd and reports `quarter` |
| `in twenty days`, `twenty-first` | number words past twelve. Digits cover it (`in 20 days`); `twenty-first` reads as the 1st |
| `mid july`, `early march`, `late july` | the edge op with a middle, and a modifier taking its period on the right rather than after `of` |
| `thanksgiving`, `veterans day`, `independence day` | holidays of one country. Out by the same rule that keeps `christmas` in |
| `ramadan`, `diwali`, `lunar new year` | a calendar each, not a table row. Note that `lunar new year` reads as `new year` today, which is an argument for blocking the phrase |
| `this monday` as the current week's | a period-scoped seek word. English usage is split, so it is a decision before it is code |
| `by friday`, `before 9pm` as a deadline | range semantics — `before X` answers X — so it waits for the partial dates below |
| `every monday`, `UTC`, `+02:00` | recurrence, and zones a `Date` cannot hold. Non-goals |

**The test file is the specification.** 214 cases, read against two fixed references — a
Thursday that is also New Year's Day, so that `next thursday` has to step over today and
`last december` over the year's edge, and a Wednesday in mid-July, for the forms whose
answer is only interesting once they have a past (`easter` after Easter, `the end of the
month` in a month with a middle). One `describe` per rule the JSDoc states, a `never
throwing` block over nineteen junk strings, and a corpus of one line per string so that
adding a token costs one line to pin and touching the lexer re-checks every form at once.

**Two things are parked on purpose.** The vocabulary is English-only: month and weekday names
localise through `Intl`, but `tomorrow`, `next`, `at` and `days` do not, so `demain` reads as
`null` and `dans 3 jours` reads as the 3rd of the month — the role tables were built to
become per-locale data, and that is the work. And a range — `from monday to friday` — is not
an evolution of this function but a sibling over the same fold, and it is really the period
question, so it waits for the partial dates.

### Partial dates — afterwards, and why in that order

dlbbm carries a `PartialDate` of three nullable fields (`shared/types`), with no precision,
no time of day, and holes allowed anywhere (`{ year: null, month: 1 }` = *January of an
unknown year*). Too light to be generalised as it stands, and the question is not urgent:
neither `parseDate` nor `readDate` needs it, both consolidate against a reference and give
a `Date`.

**The order is deliberate.** The concept's real questions — holes or no holes, a precision
field, intervals, how comparison works — are answered by what consumes it, and there is one
and a half consumer today. `readDate` will be the second, and it will say whether `next
december` has to stay month-precise or may land on the 1st. Designing the concept first is
guessing; designing it second is two working consumers dictating the shape. The parts record
inside `parse-date` is already a partial date under another name: with two producers instead
of one, that is what it gets extracted from.

What is already known about consolidation, and it is half the answer: the fields **below**
the known precision are not missing, they are the extent of an interval — `2019` is the
whole year, and consolidating means **picking a point in it** (start, end, middle; `before
2019` in a filter wants the end). The fields **above** it are unknown and have to be
**anchored from outside**, and the reference is the only anchor available: zeroing
everything would mean year 0, or `strptime`'s arbitrary 1900, which turns `09:20` into
1900-01-01T09:20. So one rule, two mechanisms — anchor above, collapse below — and the
honest primitive is `toInterval(partial) → { start, end }`, with `resolve()` as sugar over
it. The one arbitrary part left is a hole *in the middle* (year and day, no month), which
only exists if the type allows holes at all.

Confronted with the registry: schema.org has nothing (`Date`, `DateTime`), but **EDTF /
ISO 8601-2** is exactly this concept, and it separates the two cases dlbbm conflates —
truncation (`1968`, `1968-01`, which is also the W3C-DTF dlbbm already writes) and
unspecified digits (`XXXX-01`, `196X`). Truncation is an interval, the second is a set of
intervals, and `toInterval`, `compare` and `resolve` are only definable on the first — an
argument for making the truncated form the main type and the hole-y one a separate matter.

## `compId` — chaque composant a une identité

**Every component takes a `compId`, and publishes it.** The prop is optional, a generated
hash fills in when it is absent, and the resolved value lands on the root element as
`lm-tools-comp-id`. So a component always has an identity, whether or not anyone named it,
and that identity is visible in the inspector, selectable in CSS and quotable in a log.

It is deliberately **not** part of the command layer. An identity is what a component *is*,
not a detail of one subsystem that happens to need it: commands are the first consumer,
others will follow. `components/utils/comp-id` holds all of it — `WithCompId` in its `types.ts`, and in its
`index.ts` `useCompId`, which resolves the prop or generates once, and `compIdAttribute`, so
the attribute name is written in exactly one place. `WithClassName`, which every Props also
reaches for, is not ours in the same way: it is a React convention, so it lives in
`agnostic/@react/types`.

The prop is destructured as `compId: givenCompId` and the resolved value keeps the plain
name, which is the same shape `ControlledVideo` already used for `videoRef: givenVideoRef`.
Two components carry it on their **controlled** half — `BeforeAfter` and `Video` —
because that is where the root element is rendered; their hybrid wrapper inherits the
prop from the controlled Props type and forwards it.

## Les commandes — la grammaire et le bus

`components/utils/commands` holds the layer that replaces the instruction grammar of the
dismantled visibility layer: `parseCommand` / `formatCommand` for the
`@target:force:once:action:arg,arg` form, `sendCommands` / `subscribeToCommands` / `useCommands` for a
private `commandBus` — an `EventTarget` of its own, so no global name is taken, and not
exported, so the grammar cannot be bypassed from outside. A command with no `@target` is
addressed to the sender itself, resolved at the source, so a receiver only ever compares
one id. There is **no registry**: a component filters what is addressed to it, two
components sharing an id both answer, and that is the intended reading.

`useCommands(compId, actions)` takes an **action table** — `Record<string, (args:
string[]) => void>`, a component's verbs written as a list rather than as an `if` chain.
An action it does not declare is a `console.warn`, since the table is the only place that
knows the vocabulary.

Three decisions hold the receiving side together:

- **The transport does not interpret.** Arguments reach an action as the raw strings they
  were written as; converting them, and warning about a bad one, belongs to the component.
- **No shared vocabulary.** A verb exists at the level of the component that declares it.
  Two components may both answer to `play` with nothing in common behind it, and that
  duplication is accepted rather than factored out.
- **A controlling prop beats a command.** Components are hybrid, not controlled or
  uncontrolled: each prop decides whether the aspect it governs is the consumer's. The
  `isTracking = tracking ?? internalTracking` already in `ScrollTracker` is the whole
  mechanism — an action writes to the internal state, and a prop that is set makes that
  write invisible.

`sendCommands(raw, fromCompId)` is the only sender there is: it takes a string or a list of
them, warns about each one that is not a command, and sends the rest. Dispatching a single
command is a `sendOne` closure inside it, so nothing reaches the bus without going through
the grammar.

### La grammaire

Three parts come before the action, **in any order**, and the action's arguments come last:

```
@target  force  once | <n>ce  action  arg,arg
```

`parseCommand` splits the whole string on `:` and then recognises the parts by what they
look like — a segment starting with `@` is the target, `force` is the flag, `once` or
`<n>ce` is a send limit — so `@hero:force:once:play` and `@hero:once:force:play` are the
same command, and `formatCommand` re-emits both in the one canonical order above.

What that costs, accepted on purpose: **an argument can no longer contain a colon**, and a
lone argument can be neither `force`, `once`, `3ce`, nor anything starting with `@`, since
the scan would claim it. A command is **rejected** — `null`, and a `console.warn` from
`sendCommands` — when it names two targets, carries two send limits, says `0ce`, holds an
empty argument, or leaves more than an action and one argument list once the modifiers are
out.

`once` is `1ce`, and the family goes on: `2ce`, `3ce`, `12ce`. It is an abbreviation, and
it is deliberate — this grammar is a language for the library's consumers, not a naming
convention for our own code, which is the one place that trade is acceptable.

### Les limites d'envoi

A send limit is counted **by the sender**, not honoured by the receiver: `sendCommands`
keeps one bucket per sender, each keyed on the pair *target, action* — arguments and
modifiers excluded, so `@hero:play:once` and `@hero:play:3ce` share a count — and declines
to dispatch once the limit is reached. That is why it belongs here rather than in a
trigger's props: every future trigger gets it for nothing, and a component receiving
`@other:play:once` never has to know the restriction was about the sender.

**A count lasts the mount.** The bucket is emptied when a component unsubscribes from
`useCommands`, so one that unmounts and remounts starts fresh and its `once` fires again,
author-given `compId` or generated. Page-lifetime counting was the earlier rule and went
with the ledger sweep — the same cleanup that drops what a component had surrendered. The
sweep hangs off the receiving subscription, so a component that only ever sends would keep
its bucket for the page; none does today, both senders being receivers too.

`force` is enforced in the dispatch, which is the one place it means anything: a
surrendered action is dropped unless the command carries it. What does not exist yet is
the other components' vocabularies — the mechanism is general, and `Video` is the only
component declaring domains today.

### An argument carries its unit

`jump-to:500` is milliseconds; `jump-to:1.2min` is 72 000 of them. The suffix is not the
nicer notation but **the only one available**: `:` is the grammar's separator, so an
`01:12:00` timecode cannot be written in an argument at all.

**The lexing is not the component's.** `agnostic/time/duration/parse-duration/` reads a
suffixed string into milliseconds and hands the number and the unit to the `Duration`
class, so the arithmetic stays where it already lived. It covers every alias that class
converts — `ms`, `s`, `sec`, `min`, `m`, `h`, `d`, `w`, `mo`, `mth`, `M`, `y`, `Y` —
longest match first, since `ms` has to be tried before `m`. **Case is load-bearing**:
`m` is minutes, `M` is months. A bare number stays milliseconds, and anything else —
`1e3`, `0x10`, `456f`, a suffix with no value — comes back `null`, which is how a caller
tells a typo from a value.

**It forgives what a human types** and nothing else: whitespace wherever it falls, and a
comma for a decimal point, so `'1 , 3 ms'` is `1.3`. A comma is therefore never a
thousands separator — `'1,200'` is `1.2` — and a string carrying both separators is
refused rather than guessed at. The leniency stops at the lexer: the command grammar
splits an argument list on `,`, so `jump-to:1,2min` arrives as two arguments and never
reaches it whole. Two readings of a month and a year are offered through
`useApproximateMonthAndYear`, the option `formatDuration` already had — flat 30 and 365
days by default, the Gregorian mean year otherwise. It sits in `agnostic` because `AudioQuote`, `Sequencer` and
`Subtitles` will want it, and because vitest covers `agnostic` where it ignores
`src/components`: seventeen tests, where a component would get none.

**Frames are dropped**, with a `[WIP]` next to the suffix list. Nothing in the DOM
exposes a media's frame rate, so `456f` could only resolve against a rate declared by
hand — 20% off on a 30fps file at the usual default of 25.

**The only check that runs is a warning.** `VIDEO_ACTION_VERB_ARGUMENTS` stays exported
for a consumer that wants to reject `jump-to:banana` before mount, but lm-link is not
expected to: a malformed argument is warned about at runtime and does nothing. That is
the decision, and it is the cheaper half of « le transport n'interprète pas ».

**`Video` answers to nine verbs**, in `types.ts` as values: `play`, `pause`, `loud`,
`mute`, `volume`, `rate`, `jump-to`, `jump-start`, `jump-end`. The table is written in
`index.tsx`, over the hybrid layer's own setters — a sibling `commands.ts` was tried and
undone, since it could only be handed every setter back — and **a verb never
contradicts a prop** — each is inert while the value it writes arrived as one, the three
`jump-*` while `currentTimeMs` did.

**And a command yields to the reader.** `VIDEO_ACTION_DOMAINS` holds six — `playback`,
`position`, `sound`, `rate`, `fullscreen`, `subtitles` — one per gesture a reader has,
and using a control hands its domain over for the rest of the mount. Pressing pause
silences `play` and `pause`; scrubbing the timeline silences the three `jump-*`; muting
or moving the volume slider silences `loud`, `mute` and `volume`, since muting and
setting a level are two ways of deciding the same thing. `fullscreen` and `subtitles`
carry no verb and are surrendered all the same, which silences nothing today and starts
working by itself the day either gets one. Seeking is a domain of its own rather than
part of `playback`, which is what settles the disagreement the old layer's two docs had
about the timeline.

`:force` opts out — `whenVisible='force:play'` — and that is what the modifier was
parsed and transported for all along; it finally has a ledger to override. **The ledger
belongs to the commands layer, not to the component**: a module map keyed by `compId`,
written by `surrenderCommands` and read in the dispatch, emptied when the component
unsubscribes. So a component reports a gesture and holds nothing, a surrender triggers no
render, and a command sent in the same tick as the click is already refused. It also
settles the survey's last charge the other way round: nothing surfaces in the DOM, since
what a component does not hold is not a state it owes a modifier. Under-
surrendering is accepted: someone who pressed pause still gets `jump-start` on the way
out, since `force` can repair an over-eager yield but no modifier can repair a partition
that is too coarse.

## Les déclencheurs — la visibilité, première condition

A **trigger** is a condition that sends commands. The component declares its verbs; a
trigger decides when they are spoken, and visibility is the first one. The props are
`whenVisible` and `whenHidden`, each taking a command or a list of them — `'track'`, which
is self-addressed, or `'@someone-else:play'`, which is why `compId` exists at all.

Two modules, because there are two concepts and one depends on the other:

- `components/utils/intersection` — the browser API and nothing else: `ObserverOptions`,
  `OnIntersected`, `useIntersectionObserver`. It is where the hook now lives, having been
  moved out of the `IntersectionObserver` component's own folder, so the component and
  visibility speak one language.
- `components/utils/visibility` — `VisibilityOptions` and `useVisibility`, which settles
  the raw intersection over an `onAfterMs` / `offAfterMs` delay, plus
  `useVisibilityTriggers`, which turns each settled change into commands. **Visibility
  depends on commands, and commands know nothing of visibility** — that direction is the
  whole reason the triggers live here rather than in `commands/`.

Three behaviours worth stating, because none of them is obvious from the code:

- **`useVisibility` returns `boolean | undefined`**, `undefined` until the first
  observation lands. Without that, a first answer of `false` cannot be told from the
  initial value, and `useStateChangeDispatch` would swallow it.
- **The first settled state fires**, whichever it is. A component mounted in view runs its
  `whenVisible`, one mounted out of view runs its `whenHidden` — the state is applied as a
  change from nothing, which is the point of writing `defaultTracking={false}` with
  `whenVisible='track'`.
- **Nothing is observed unless asked.** The observer mounts only if `whenVisible`,
  `whenHidden` or `onVisibilityChanged` is set, through the `enabled` parameter
  `useIntersectionObserver` already had. So a component given none of them costs no
  `IntersectionObserver`, and its `--visible` modifier never appears.

The options are flat and prefixed on each component — `visibilityThreshold`,
`visibilityRoot`, `visibilityRootMargin`, `visibilityOnAfterMs`, `visibilityOffAfterMs` —
and `useVisibilityTriggers` builds `VisibilityOptions` from them, so no component does that
mapping by hand.

## Disclosure — what a standing disclaimer withholds

`components/utils/disclosure` carries the one thing the command layer needs to know about
the page: whether the subtree a component sits in has been disclosed to the reader.
`DisclosureProvider` declares it, `useDisclosure()` reads it, and the default is
`{ isDisclosed: true }` — content with no disclaimer above it is withheld from nobody, so
nothing opts in to be reachable. **Nesting only ever withholds more**: a dismissed
disclaimer inside a standing one stays undisclosed, so an outer decision cannot be undone
from the inside.

A context, because nothing else reaches. A withheld component sits an unknown number of
layers under the `Disclaimer` withholding it, with components in between that forward none
of its props — which is exactly why lm-link had one, and why it belongs here instead.
`Disclaimer` is the only provider, with `isDisclosed={!isOn}`.

It is read in two places, and that is what keeps it honest:

- **`useCommands`** drops every command while undisclosed, **before** the `force` check.
  So a receiver is gated the day it is written, and no component can be written without
  it — the failure mode of the lm-link version was a passerelle forgetting one prop.
- **`useVisibilityTriggers`** stops sending. `onVisibilityChanged` still fires: it informs
  a parent, it does not act.

**`:force` does not pass a disclosure, by decision.** The modifier overrides a reader's
take-over — « they paused it by hand, the article insists » — where a disclaimer is their
consent. One word for both would let any legitimate `:force` defeat consent silently, in
an article nobody rereads. If an escape hatch is ever needed, it gets a word of its own.

**Block the act, never the load.** A component with something of its own to hold back
reads the disclosure and holds that act where the value is forwarded — the same read-side
arbitration the hybrid props use, so the state stays warm and the reader lands on what the
article asked for the moment they accept. `Video` does not play, from `autoPlay` no more
than from a verb or its own button; `Sequencer`'s tempo does not run and its step is kept;
`Lightbox` does not open, `defaultIsOn` included, since opening writes the store shared
with every lightbox of the page. Nothing stops loading, though: `Iframe` and `UIModule`
keep fetching, `Image` keeps loading, `ScrollTracker` keeps tracking. The reason is
layout — an iframe that never loaded has no height, so a panel laid over it covers a
collapsed box — and the residue is named rather than argued: an embed that autoplays sound
behind a disclaimer is the article's business today, not the library's.

## La couche de visibilité, démontée — et ce qu'il faut en garder

**Il n'y a plus de conscience de la visibilité dans ce dépôt.** Le module
`components/utils/viewport-behaviours` et tout ce qui le consommait — les props
`whenVisible` / `whenHidden` / `visibility…` de `Video`, `Sequencer` et `ScrollTracker`,
leurs vocabulaires de verbes, leurs tables d'actions — ont été retirés pour que le concept
soit reconstruit depuis zéro, et non amendé en place. Ce qui a été retiré n'est pas perdu :
le tag **`viewport-behaviours/v1`** marque le dernier commit où tout cela existe, et
`git show viewport-behaviours/v1:<chemin>` rend n'importe lequel de ces fichiers.

Ce qui suit est donc **l'entrée de la reconstruction, pas un contrat** : l'histoire qui a
mené là, le contrat tel qu'il était écrit, et le relevé qui a conclu qu'il fallait
recommencer. À lire avant de reposer la moindre ligne, et à remplacer par le nouveau
contrat quand il sera écrit.

### L'histoire — d'où venait la grammaire

`Video` portait **huit props** — `autoPlay`, `autoPause`, `autoMute`, `autoLoud`, chacune
en `…WhenVisible` et `…OnceVisible` —, et la démo de lm-link avait dû les présenter comme
une grammaire (`auto` + verbe + quand) pour ne pas les décrire huit fois. Qu'une fiche ait
eu besoin d'inventer une grammaire pour rendre une API lisible était le signe que l'API
pouvait la porter elle-même : c'est ce qui a été fait.

La couche générique vivait dans `components/utils/viewport-behaviours/`, et `Video`,
`Sequencer` et `ScrollTracker` la consommaient. La conversion avait abouti : trois
grammaires pour la même idée au départ, il n'en restait qu'une — et c'est cette couche-là
qui est démontée aujourd'hui.

### Ce qui est décidé

**Deux props, pas huit** — `whenVisible` et `whenHidden` —, chacune prenant une
instruction ou une liste d'instructions. Le composant publie un **vocabulaire de verbes**
qui lui est propre ; la couche générique ne connaît que des chaînes. Et ce sont des
chaînes pour ce qu'elles rendent possible : déclarer un déclenchement conditionnel sans
écrire de callback, et le déclarer là où une fonction ne passe pas — un attribut, un
champ de formulaire, une structure sérialisée.

```ts
export type Modifier = 'once' | 'force'
export type Instruction<A extends string> = A | `${A}:${Modifier}` | `${A}:${Modifier}:${Modifier}`

export type ViewportBehaviours<Action extends string> = VisibilityOptions & {
  whenVisible?: Instruction<Action> | Array<Instruction<Action>>
  whenHidden?: Instruction<Action> | Array<Instruction<Action>>
  onVisibilityChanged?: (isVisible: boolean) => void
}
```

Les réglages du *quand* sont à part, dans `VisibilityOptions`, et **à plat sous un préfixe
commun** plutôt que groupés dans un record : `visibilityThreshold`, `visibilityRoot`,
`visibilityRootMargin`, `visibilityOnAfterMs`, `visibilityOffAfterMs`. Un record se lit
bien dans un type et mal à l'appel, où il coûte une paire d'accolades pour poser une
valeur ; le préfixe groupe aussi bien, et dans la liste d'autocomplétion en plus.

**Le déclencheur est un état, pas un franchissement.** La visibilité est tenue en état
et les instructions tirent sur sa transition. C'est ce qui rend les deux délais possibles,
et ce qui laisse un appelant recombiner la visibilité avec ce qu'il suit par ailleurs : un
événement d'observateur se lit une fois, un état se lit à tout moment.

**Les deux délais sont un debounce sur l'état**, pas un report de l'action.
`visibilityOnAfterMs` veut dire « doit rester visible ce temps-là pour compter comme
visible » :
une vidéo croisée en scrollant vite ne compte jamais comme vue, donc rien ne tire et aucun
crédit `once` n'est dépensé. Un délai posé sur l'action aurait demandé de l'annuler.

**Chaque composant publie une table**, dont le `domain` répond à la question restée
ouverte ci-dessous : la main du lecteur — toucher lecture/pause éteint le domaine
`playback` et laisse `sound` intact.

```ts
const videoActions: ActionTable<VideoAction> = {
  play: { domain: 'playback', run: () => setPlay(true) },
  mute: { domain: 'sound', run: () => setMute(true) }
}
```

Quatre règles à ne pas réinventer : le crédit `once` est **par couple (action,
déclencheur)** et vit le temps du montage ; dans une même liste, **la forme nue l'emporte
sur la forme suffixée** — c'est la règle « déclarer les deux revient à ne déclarer que
`When…` », devenue une déduplication ; et **l'ordre de la liste est l'ordre d'exécution**.

### La main du lecteur, et le `:force` qui passe outre

**Par défaut, une instruction cède au lecteur.** Dès qu'il touche un contrôle, les
instructions du **domaine** correspondant cessent de tirer, pour la durée du montage.
Mettre en pause à la main n'empêche pas la coupure du son à la sortie de l'écran : c'est
tout l'objet du champ `domain` de la table, et c'est une erreur déjà commise et corrigée
une fois — un drapeau unique confondait quatre questions.

Ce défaut a été discuté dans les deux sens, et voici pourquoi il tombe de ce côté-là. Le
contre-argument est sérieux : `whenVisible={['play']}` ne dit pas qu'il peut ne pas tirer,
et une mécanique invisible est une mécanique qu'on subit au lieu de la déboguer. Mais
**l'asymétrie des échecs tranche.** Ne pas redémarrer tout seul est une déception ;
redémarrer contre un lecteur qui vient de mettre en pause est une hostilité, et il la
subira à chaque passage devant le composant. Et un défaut qu'il faudrait écrire sur
presque chaque instruction n'en est pas un.

**Le prix est donc payé par la documentation, pas par la syntaxe.** La fiche d'un
composant doit dire que ses instructions cèdent — l'article qui copie un exemple ne le
devinera pas de l'exemple lui-même.

**`:force` passe outre**, et c'est l'unique échappatoire :

```tsx
<Video whenVisible={['play:force']} whenHidden={['pause']} />
```

**La reddition éteint le domaine entier**, et c'est un cas d'usage concret qui le
demande : on appuie sur play sur une citation sonore, puis on continue à lire l'article en
écoutant. Une pause automatique à la sortie de l'écran serait hostile.

**Surrender is no longer this layer's only brake.** A whole subtree can be withheld by a
disclaimer, which `useCommands` reads before it reads anything else — see « Disclosure »
below. The two are checked separately on purpose, and `:force` overrides the first and
never the second: it answers a reader's take-over, not their consent.

**What counts as the reader taking over is the component's decision**, not the generic
layer's. `Video` counts every control it renders: the play, pause, loud and mute buttons
and a click on the picture surrender `playback`, the volume slider and the two sound
buttons `sound`, the rate slider `rate`, the timeline `position`, and the last two buttons
`fullscreen` and `subtitles`. An earlier reading left the timeline, the rate and
fullscreen out — scrubbing is not deciding on playback — but the domains are narrow enough
that counting them costs nothing elsewhere, and a reader who scrubs has taken the position
in hand. The component calls `surrender(domain)` from the handlers concerned, and the list
is documented there.

**Les modifieurs forment un ensemble, pas une séquence.** `'play:once:force'` et
`'play:force:once'` sont la même instruction. L'analyse en découle : on retire les segments
de fin tant que ce sont des modifieurs connus, et tout ce qui reste est le verbe — quelle
que soit sa forme interne, argument compris.

### Les verbes à arguments, et le deux-points

Le deux-points porte les deux : l'argument d'un verbe et les modifieurs. **`jump-to:542`**
porte la vidéo à 542 ms. Une valeur négative compte
**depuis la fin** — `jump-to:-1` est le dernier timecode possible, et c'est `-1` et non
`-0` parce que `-0 === 0` en JavaScript et collisionnerait avec le début. `jump-start` et
`jump-end` en sont les raccourcis, pour `jump-to:0` et `jump-to:-1`.

**L'argument appartient au verbe, et `once` est un suffixe uniforme par-dessus.** C'est ce
qui fait tenir les deux ensemble sans grammaire à deux étages : le vocabulaire d'un
composant porte ses propres formes, et la couche générique n'ajoute qu'un segment final.

> **Tranché autrement depuis.** Les modifieurs passent **devant** l'action et non après —
> voir « La grammaire » plus haut —, et `once` n'est plus un suffixe que le receveur lit :
> c'est un compteur tenu par l'émetteur. L'argument appartient toujours au verbe.

```ts
export const VIDEO_VERBS = ['play', 'pause', 'loud', 'mute', 'jump-to', 'jump-start', 'jump-end'] as const
export type VideoVerb = typeof VIDEO_VERBS[number]

export type VideoAction =
  | Exclude<VideoVerb, 'jump-to'>
  | `jump-to:${number}`

// Instruction<VideoAction> contient donc « jump-to:500:once » sans rien de plus à écrire.
```

**Le vocabulaire est un tableau `as const`, pas une union nue**, et c'est ce qui a coûté le
plus à trouver : lm-link valide à l'exécution ce qu'un article a écrit, et un type n'a rien
à donner à un validateur. `VIDEO_VERBS` et `VIDEO_VERB_ARGUMENTS` sont donc des **valeurs**
exportées, et les types s'en déduisent — jamais l'inverse.

Une seule règle d'analyse en découle : **on retire les segments de fin tant que ce sont des
modifieurs connus, et tout ce qui reste est le verbe**, quelle que soit sa forme interne. Le verbe est toujours le
premier segment, ce qui rend les listes lisibles et triables — `['play', 'play:once']` se
groupe à l'œil là où un préfixe les aurait séparés. C'est aussi la convention des
modifieurs d'événement de Vue (`@click.once`) et de Svelte (`on:click|once`), qui est
exactement le même objet.

**Le prix à payer : un verbe ne peut pas prendre `once` comme valeur littérale
d'argument.** Le segment final est toujours lu comme le modifieur. La règle est gratuite
tant que les arguments sont des nombres ; le jour où un verbe prend du texte libre, la
sortie est de séparer les deux ponctuations — `:` pour l'argument, `.` pour les modifieurs,
soit `jump-to:500.once` —, ce qui lèverait l'ambiguïté et composerait si un second
modifieur apparaissait.

**Ce qui reste perdu, c'est l'énumérabilité.** Le deux-points avait été choisi parce qu'il
gardait l'ensemble fini : TypeScript autocomplète, lm-link valide par un `those_(...)`, et
la fiche rend un multi-select qui énumère. Un argument libre casse les trois — TypeScript
ne fait plus que valider une forme, la validation demande un petit parseur, et le champ de
la fiche devient mixte : choisir un verbe, puis taper sa valeur. C'est du travail à compter
dans le chantier, pas un obstacle.

Les quatre questions que cette section portait ouvertes sont tranchées, et chacune l'est
dans le code : le déclencheur est **un état** et non un franchissement, ce qui ferme le bug
de la porte qui s'ouvre sur une vidéo déjà visible ; il reste **deux props** et non huit ;
la logique **n'appartient pas à `Video`** mais à `viewport-behaviours/`, qui ne connaît que
des chaînes ; et **la direction compte**, portée par le `kind` de la table plutôt que laissée à
l'appelant.

Both points below are in the code now.

- **`Sequencer` is wired**, with six verbs in `Video`'s family word for word: `play`,
  `pause`, `jump-to:<n>`, `jump-start`, `jump-end`, `jump-by:<n>`. A jump names a
  **position**, never an active step, and a negative one counts back from the end as it
  does on `Video` — so `jump-by:-1` steps back one where `jump-to:-1` goes to the last,
  which is the price of a single family rather than a `next` / `prev` pair beside it. No
  `reset`: the old `resetOnVisible` **is** `jump-start`. No `stop` either —
  `['pause', 'jump-start']` composes, and a list runs in order.
  **Nothing surrenders**, there being no control to touch, so `:force` has nothing to
  override here; the domains are `playback` and `position` all the same, so that a verb
  carries the same domain wherever it appears. Two consequences worth knowing: `play` on
  an ended sequence does nothing — ending is what stopped it, and `['jump-start', 'play']`
  is how it starts again, a looping sequence never meeting the case — and an absolute jump
  writes the position of the lap it was made from, so it never reads as a wrap and
  `onLooped` stays silent. `internalPlay` got the setter it had been refused: a command is
  an actuator like any other, which is what it was missing.
- **La fin de la séquence a changé de définition au passage**, et c'est une correction :
  `ended` arrive quand le compteur **quitte** le dernier pas, pas quand il y arrive. Le
  dernier pas a droit à son temps comme les autres, donc le compteur court d'un cran
  au-delà pendant que la position s'y clampe — tout reste dérivé, rien n'est mémorisé.
  `onReachedLastStep` est l'arrivée, `onIsEndedChanged` le départ, et sur une séquence qui
  joue ils sont séparés d'un temps. Une séquence simplement arrêtée sur le dernier pas
  n'est donc pas finie, et un consommateur qui pilote `step` le dit en nommant la position
  d'après la dernière.
- **`data-last-step` dit où la séquence s'arrête**, et c'est la troisième réponse à
  « combien de pas » — après la prop `totalSteps`, qui gagne, et avant le compte des
  enfants-éléments. Ce qui suit la marque prend encore part, mais par `data-steps` seul :
  un article écrit donc ses pas dans l'ordre de lecture, puis pose **après** les enfants
  qui appartiennent à plusieurs d'entre eux — sans que leur position compte pour un pas
  que personne ne voulait. Un enfant placé après la marque et qui ne nomme aucun pas ne
  s'allume jamais, ce qui est la lecture honnête de « il ne fait pas partie de la
  séquence ».
- **`ScrollTracker` y est passé, et deux verbes suffisent** : `track` et `untrack`.
  Mesurer est tout ce que ce composant fait, donc commencer et arrêter est tout ce qu'une
  instruction peut toucher. Il a récupéré `tracking` / `defaultTracking` au passage —
  `defaultTracking` vaut **vrai**, ce que le composant a toujours fait, et l'ancien
  `startOnVisible` s'écrit `defaultTracking={false}` plus `whenVisible='track'`. Plus
  verbeux qu'avant, et c'est le prix assumé d'une grammaire unique.
  - **Le `<div>` intérieur a disparu.** L'observateur tourne sur la racine, comme chez
    `Video` et `Sequencer`, donc plus d'`IntersectionObserverComponent` imbriqué. C'est
    plus grave ici qu'ailleurs : le composant existe pour qu'une feuille anime sur les
    propriétés qu'il porte, et une boîte de plus mettait les enfants un étage en dessous
    de l'élément qui les porte.
  - **`--tracking` est un modifieur de racine**, l'état dont `--measured` n'était que la
    conséquence — un écouteur arrêté garde ses dernières valeurs, donc il peut être mesuré
    sans plus suivre. `onIsTrackingChanged` avec.
  - **`WithViewportObservation` est mort** avec la conversion, son dernier consommateur.
    `ViewportObserverOptions` lui a survécu un temps pour un composant qui n'observait
    qu'une sentinelle — pas de vocabulaire, pas d'instructions, juste un observateur ;
    il a depuis fusionné dans l'`ObserverOptions` de `utils/intersection`.
- **`ResizeObserver` n'a pas besoin des déclenchements de visibilité, et c'est tranché.**
  La question se pose parce que `ScrollTracker` en avait besoin, mais les deux ne coûtent
  pas de la même façon : `ScrollTracker` a un moteur qui **tourne** — des écouteurs et une
  passe de mesure par image tant qu'une instance suit —, donc son coût est proportionnel au
  temps. `ResizeObserver` est une API qui ne rappelle qu'au **changement réel** de taille :
  un élément hors écran qui ne bouge pas ne coûte pas un cycle, et quand il bouge, c'est
  justement le moment où la mesure compte — la débrancher garantirait des valeurs périmées
  au retour, donc un travail à ordonnancer à l'entrée en échange d'un travail qui n'avait
  pas lieu.
  Le coût réel est ailleurs : **chaque mesure déclenche un rendu** qui réécrit huit
  attributs et seize propriétés. Vingt instances pendant un redimensionnement de fenêtre
  font du bruit. Si ça se voit un jour, la réponse est un throttle ou une comparaison de
  valeurs — pas un interrupteur de visibilité.
- **`Scrllgngn` had the neighbouring problem, and it is settled**: a block now asks to be
  measured with `trackScroll`, where only `onScrolled`'s presence could say it. The flag
  and the handler each ask for the same thing, and tracking stays off until one of them
  does.

### The survey — why it is being rebuilt rather than amended

This is the reading that ended the layer. One fact first, because everything below rests
on it: the `verb:arg:modifier` grammar has **exactly
one trigger**, viewport visibility, and three consumers — `Video`, `Sequencer` and
`ScrollTracker`. Nothing else in `src/` so much as splits a string on `:`. So this is a
general mechanism that has never been tried against a second signal, and the parts that
look general may only be general in intention.

Four weak points, in the order they matter:

1. **The grammar is general, the trigger is welded on.** Verbs, arguments, modifiers and
   both ledgers are indifferent to where the signal comes from, but only visibility can
   fire them, and the module's name, props and types all say so. « Do X when the sequence
   reaches step 3 » has no way in.
2. **`domain` and `surrender` are inert for two consumers out of three.** `Sequencer` and
   `ScrollTracker` each declare a single domain and each document that nothing ever
   surrenders — which also makes `':force'` a no-op there.
3. **A vocabulary is declared four to five times per component** — verbs array, verb type,
   argument validators, action type, action table — and `Video` and `Sequencer` duplicate
   each other's verbs wholesale, which `Sequencer`'s own doc admits in writing.
4. **None of it is observable.** The ledgers are refs, so neither a root-class modifier nor
   a callback can say that a domain was surrendered or that an instruction ran — against
   this repo's own rule that every state a component holds surfaces as a modifier.

Two smaller questions raised and not answered. **`dedupe` keys on verb *and* argument**, so
`['jump-to:100', 'jump-to:200']` both run, in order — intended, or an accident of the key?
And **the `once` ledger includes the trigger**, so `play:once` holds one credit for visible
and another for hidden, which is probably right and is written nowhere.

## `Video` — les bornes de lecture, à instruire

Notée telle quelle, à reprendre en discussion : elle n'est pas conçue.

**Des bornes de lecture.** Délimiter une portion de la vidéo hors de laquelle on ne peut
pas lire — la tête de lecture ne va pas avant la borne basse, ne dépasse pas la borne
haute. `timelineBounds` est le nom de travail et il est à trouver : ce qu'on borne n'est
pas la timeline, qui est un contrôle, mais la lecture elle-même. Quelque chose comme
`playableFromMs` / `playableToMs`, ou une paire dans un seul jeton.

Ce que la chose touche, et qui est le vrai travail :

- **`jump-start` et `jump-end` changent de sens**, ou devraient : aller « au début » d'une
  vidéo bornée veut dire la borne basse, pas `0`. Et `jump-to:-1`, qui compte depuis la
  fin, compterait depuis la borne haute. Tout le vocabulaire de saut est concerné.
- **La timeline aussi**, en tant que contrôle : un clic hors bornes, et ce qu'elle affiche
  — la portion jouable, ou toute la vidéo avec ses bords morts.
- **La fin de lecture** arrive à la borne haute, donc `.lm-video--ended` et l'événement
  qui va avec, sans que le média soit terminé. Et `loop` reboucle sur la borne basse.

**The starting timecode is done**, and it is `defaultCurrentTimeMs`, on the controlled
layer where the element lives. It places the playhead once the metadata has landed and
leaves the time to the element, which is exactly what `currentTimeMs` cannot do: that one
hands ownership to the parent and therefore implies a stopped video. Given both, the
default is ignored and the controlled prop wins — the ordinary hybrid rule, no special
case. The seek is one-shot, guarded by a ref, because `load()` re-fires the metadata
event and a second seek would send a playing media back.

**And it does not go down into the subtitles.** `Subtitles` only knows a `timecodeMs`,
pushed to it on every frame: that is a current position, not a start, so the notion has
nothing to do there. A video starting at 4 000 ms pushes `4000` on its first frame and the
cues are in the right place without having asked. A video's `subtitles` must not expose a
`defaultCurrentTimeMs` of its own — the player's start drives theirs, and there is only
one playhead.

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

## Les commentaires des composants — ce que l'audit a trouvé

Relevé fait, passe remise à après la publication de lm-link. L'inventaire : 50 fichiers
portant des commentaires, 2 380 lignes, dont 1 938 de JSDoc — la surface publique, hors
sujet ici — et 442 en ligne, réparties en 226 blocs. 167 de ces blocs tiennent en une ou
deux lignes, donc la règle tient ; le travail porte sur les 27 blocs de quatre lignes ou
plus, et sur quatre passages encore en français.

What the pass has to do, in order of how clear-cut it is:

- **Translate four French passages**, all four worth keeping: `Drawer:246` (one bar
  written once serves both states), `Drawer:253` (how `-btn` resolves),
  `Video/index.controlled:268` (why subtitles default to on), `:465` (why neither modifier
  appears when no subtitles are given). The two in `Drawer` go from four or five lines to
  two.
- **Delete commented-out code** in `global.d.ts:2`: four `declare module` lines and a
  `'*.gif'` block, dead. The live `*.module.css` declaration stays.
- **Separate two comments glued into one run** at `Video/index.tsx:223`, and **put a
  section comment back above its subject** at `:235` — « the table is written here rather
  than in a module of its own » sits above `jumpTo` while `useCommands` is further down.
- **Cut rationale that duplicates the written rules**: that same table-in-`index.tsx`
  justification is a `CLAUDE.md` convention, and the « failure modes are not symmetrical »
  paragraph at `Video/index.tsx:223` is in this README's `:force` section at length.
- **Leave what earns its length**: `Video/index.controlled:394` (the click surface, no
  `role`, no `tabIndex`), `Drawer:90` (`useToggleMarking` and its `[WIP]`), `Lightbox:428`
  (nothing here is conditional), `Overlayer:142` (written out in full). Same for the four
  `Fx. dep.` headers that only reach four lines by listing dependencies.

**One decision to take with the pass**, not before: the bare section markers — `// Commands`,
`// Render`, `// State & refs`, `// Class names`, `// User action handlers`. They name what
the next line says, which the rules call noise, but they are consistent across every
component and are what makes a 600-line `Video` scannable. One ruling for the set.

## En sommeil

Aucun des trois n'a d'importance à court terme. Ils sont ici pour ne pas être
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
