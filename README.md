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

## Les comportements de visibilité — écrit, et `Video` y est passé

`Video` portait **huit props** — `autoPlay`, `autoPause`, `autoMute`, `autoLoud`, chacune
en `…WhenVisible` et `…OnceVisible` —, et la démo de lm-link avait dû les présenter comme
une grammaire (`auto` + verbe + quand) pour ne pas les décrire huit fois. Qu'une fiche ait
eu besoin d'inventer une grammaire pour rendre une API lisible était le signe que l'API
pouvait la porter elle-même : c'est ce qui a été fait.

La couche générique vit dans `components/utils/viewport-behaviours/`, et `Video`,
`Sequencer` et `ScrollListener` la consomment. **Le chantier est fini** : trois grammaires
pour la même idée au départ, il n'en reste qu'une.

Ce qui suit est le contrat tel qu'il est écrit, et pourquoi il tombe de ce côté-là.

### Ce qui est décidé

**Deux props, pas huit** — `whenVisible` et `whenHidden` —, chacune prenant une
instruction ou une liste d'instructions. Le composant publie un **vocabulaire de verbes**
qui lui est propre ; la couche générique ne connaît que des chaînes. Et ce sont des
chaînes obligatoirement : lm-link est le consommateur principal et ses props viennent d'un
XML statique, qu'une fonction ou un objet ne traverse pas.

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

**Le déclencheur devient un état.** La visibilité est tenue en état et les instructions
tirent sur la transition d'une condition **dérivée** — `isVisible && !suspended` — et non
sur le franchissement de l'écran. Une porte qui s'ouvre sur une vidéo déjà visible fait
passer cette condition de `false` à `true` : le bug d'en dessous disparaît sans cas
particulier.

**Les deux délais sont un debounce sur l'état**, pas un report de l'action.
`visibilityOnAfterMs` veut dire « doit rester visible ce temps-là pour compter comme
visible » :
une vidéo croisée en scrollant vite ne compte jamais comme vue, donc rien ne tire et aucun
crédit `once` n'est dépensé. Un délai posé sur l'action aurait demandé de l'annuler.

**Chaque composant publie une table**, et ses deux champs répondent chacun à une des
questions restées ouvertes ci-dessous : `domain` pour la main du lecteur — toucher
lecture/pause éteint le domaine `playback` et laisse `sound` intact —, `kind` pour la
porte, qui suspend ce qui *lance* et jamais ce qui *calme*.

```ts
const videoActions: ActionTable<VideoAction> = {
  play: { kind: 'start', domain: 'playback', run: () => setPlay(true) },
  mute: { kind: 'stop', domain: 'sound', run: () => setMute(true) }
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

**Mais `:force` ne passe jamais la porte.** Il ignore la *reddition*, jamais la
*suspension* d'une capacité comme le disclaimer de lm-link. Les deux se ressemblent et
n'ont rien à voir : une porte parle d'un consentement **pas encore donné**, une reddition
d'une intention **déjà exprimée**. Un article qui pourrait forcer le passage d'un
avertissement le viderait de son objet.

**La reddition éteint le domaine entier, `start` et `stop`.** Elle diffère là aussi de la
porte, qui ne suspend que ce qui lance. La raison est un cas d'usage concret : on appuie
sur play sur une citation sonore, puis on continue à lire l'article en écoutant. Une pause
automatique à la sortie de l'écran serait hostile, alors que derrière une porte elle
serait juste.

**Ce qui compte comme une prise de main est une décision du composant**, pas de la couche
générique. lm-link a déjà tranché pour la vidéo, et le jugement est bon : les boutons
lecture, pause, son, coupure et le curseur de volume comptent ; **la timeline, la vitesse
et le plein écran ne comptent pas** — chercher un passage ou passer en grand n'est pas
décider de la lecture. Le composant appelle `surrender(domain)` depuis les handlers
concernés, et la liste se documente chez lui.

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
- **`ScrollListener` y est passé, et deux verbes suffisent** : `track` et `untrack`.
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
    `ViewportObserverOptions` reste pour `ListLoader`, qui observe une sentinelle pour
    charger la suite — pas de vocabulaire, pas d'instructions, juste un observateur.
- **`ResizeObserver` n'a pas besoin des déclenchements de visibilité, et c'est tranché.**
  La question se pose parce que `ScrollListener` en avait besoin, mais les deux ne coûtent
  pas de la même façon : `ScrollListener` a un moteur qui **tourne** — des écouteurs et une
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

## `Video` — deux idées à instruire sur la tête de lecture

Notées telles quelles, à reprendre en discussion : ni l'une ni l'autre n'est conçue.

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

**Un timecode de départ.** Initialiser la vidéo ailleurs qu'à `0`. **Le nom devrait être
`defaultCurrentTimeMs`** : `defaultSubtitlesOn` est déjà le précédent pour une valeur de
départ non contrôlée, et le préfixe `default…` face à `currentTimeMs` dit exactement ce
que React dit avec `defaultValue` face à `value` — une valeur initiale contre une valeur
possédée.

C'est précisément ce que `currentTimeMs` ne sait pas faire : le renseigner donne le temps
au parent et **implique une vidéo arrêtée**, puisqu'un élément qui joue avancerait une
valeur qu'il ne possède pas. Ici on veut l'inverse — poser le point de départ, puis rendre
la main. Les deux ensemble n'ont pas de sens, et c'est probablement une erreur à signaler
plutôt qu'une précédence à trancher.

**Et la prop ne descend pas dans les sous-titres.** `Subtitles` ne connaît qu'un
`timecodeMs`, que le lecteur lui pousse à chaque image : c'est une position courante, pas
un départ, et la notion de départ n'a donc rien à y faire. Une vidéo qui démarre à 4 000 ms
pousse `4000` à sa première image, et les sous-titres sont au bon endroit sans rien avoir
demandé. Le `subtitles` d'une vidéo ne doit pas exposer de `defaultCurrentTimeMs` — c'est
le départ du lecteur qui pilote le leur, et il n'y a qu'une tête de lecture.

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
