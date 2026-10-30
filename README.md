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
session : le motif `when*` pour les trois composants d'un bloc, les types de props vers
les `types.ts`, et la question `css` / `html`.

Passé ce rangement, lm-tools n'est plus le sujet principal : l'attention va à la première
publication de lm-link, puis à lm-cli. Ce qui arrive ici viendra surtout de là —
**lm-cli doit rapatrier sa logique métier dans `agnostic/` et `node/`**, en ne
gardant que la coquille CLI chez lui. C'est le prochain vrai chantier de ce dépôt,
et il n'ouvrira qu'une fois lm-link publié.

**`behavioursSuspended` avait été retiré avant la couche entière**, et le principe qu'il
a laissé vaut toujours : retenir un composant est l'affaire de l'appelant, qui ne lui
passe pas les props qui déclenchent quelque chose. Côté lm-link, deux
`Omit<…, 'behavioursSuspended'>` attendent toujours d'être retirés.

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
keeps a map keyed on the trio *origin, target, action* — arguments and modifiers excluded,
so `@hero:play:once` and `@hero:play:3ce` share a count — and declines to dispatch once the
limit is reached. That is why it belongs here rather than in a trigger's props: every
future trigger gets it for nothing, and a component receiving `@other:play:once` never has
to know the restriction was about the sender.

The count lives at module scope, so it lasts as long as the page. The consequence is worth
wanting on purpose: a component with an **author-given** `compId` that unmounts and
remounts resumes its count, so its `once` does not fire again — while a component with a
**generated** id gets a fresh id and a fresh count.

`force` is parsed and carried, and **nothing enforces it yet**: there is no second source
of truth to arbitrate against until reader actions can deactivate a command. It is in the
grammar now so the commands people write don't have to change when arbitration lands.

`ScrollTracker` is the first and so far only component wired, with `track` / `untrack`.
What does not exist yet: the other components' vocabularies. `force`, domains and surrender
are deliberately out until arbitration has a second source to arbitrate.

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
parsed and transported for all along; it finally has a ledger to override. The ledger is
**state and not a ref**, which answers the survey's last charge: a surrendered domain
surfaces as a root modifier (`--sound-surrendered`) and in a space-separated
`data-surrendered`, so a stylesheet can ask `[data-surrendered~="sound"]`. Under-
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

**Et la reddition est le seul frein de cette couche.** Un appelant qui veut retenir un
composant entier — le disclaimer de lm-link est le cas type — ne passe pas par ici : il ne
lui passe pas les props qui déclenchent quelque chose. La couche n'a donc aucune notion de
contenu retenu, et `:force` n'a qu'une chose à contourner.

**Ce qui compte comme une prise de main est une décision du composant**, pas de la couche
générique. lm-link a déjà tranché pour la vidéo, et le jugement est bon : les boutons
lecture, pause, son, coupure et le curseur de volume comptent ; **la timeline, la vitesse
et le plein écran ne comptent pas** — chercher un passage ou passer en grand n'est pas
décider de la lecture. Le composant appelle `surrender(domain)` depuis les handlers
concernés, et la liste se documente chez lui.

**[WIP] Does a surrendered domain belong in the DOM?** `Video` publishes it twice —
six `--<domain>-surrendered` root modifiers and a `data-surrendered` attribute listing
the domains, space separated —, both decided while surrender was the component's own
business. Nothing reads either one today, and a component holding commands back is
arguably not something a stylesheet has business seeing. To settle before a second
component gets domains; dropping both is the current inclination.

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

Ce qui reste ouvert tient en deux lignes :

- **`Sequencer` y est passé.** Six verbes, dans la famille de `Video` mot pour mot :
  `play`, `pause`, `jump-to:<n>`, `jump-start`, `jump-end`, `jump-by:<n>`. Un saut nomme
  une **position**, jamais un step actif, et un négatif compte depuis la fin comme chez
  `Video` — `jump-by:-1` recule donc d'un pas quand `jump-to:-1` va au dernier, ce qui est
  le prix d'une seule famille plutôt que d'un `next` / `prev` à côté. Pas de `reset` :
  l'ancien `resetOnVisible` **est** `jump-start`. Pas de `stop` non plus —
  `['pause', 'jump-start']` compose, et l'ordre de la liste est l'ordre d'exécution.
  **Pas de reddition à gérer** : aucun contrôle à toucher, donc `:force` n'a rien à
  outrepasser et le domaine unique `playback` est une formalité. Le composant a récupéré
  `defaultPlay` au passage — sans état de lecture interne, `play` et `pause` n'avaient
  rien à écrire.
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
- **`Scrllgngn` a un problème voisin, pas le même** — son tracking s'active à la seule
  présence de `onScrolled`, faute d'interrupteur. À regarder quand son tour viendra ;
  `onVisibilityChanged` est peut-être déjà la réponse.

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

- **`Scrllgngn` — pas d'interrupteur pour le scrollytelling CSS pur.** Le tracking
  s'active à la seule présence de `onScrolled`, donc un bloc qui ne voudrait que les
  variables CSS et les `data-*`, sans handler, doit en déclarer un vide. Rouvrir un
  booléen si le cas se présente un jour. Marqué `[WIP]` sur `PropsCommonBlock`.


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
