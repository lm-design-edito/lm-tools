# To do

## Composant Subtitles

lm-tools/src/components/Subtitles/index.tsx

```tsx
<Subtitles
  src='srt.file.url'
  srtFileContent='Contenu srt brut, si présent la prop src est ignorée.'
  subsGroups={[3, 4, 5]}
  timecodeMs={10000}>
</Subtitles>
```

```html
<div class="dsed-subtitles">
  <!-- Groupe passé (donc que sub prev dedans) -->
  <div
    class="dsed-subtitles__group dsed-subtitles__group--prev"
    data-start-sub-pos="0"
    data-end-sub-pos="1">
    <span class="dsed-subtitles__sub dsed-subtitles__sub--prev" data-sub-pos="0">
      Some sub
    </span>
  </div>
  <!-- Groupe courant (mix de sub prev, curr et next) -->
  <div
    class="dsed-subtitles__group dsed-subtitles__group--curr"
    data-start-timecode="00:02:16,612"
    data-end-timecode="00:02:16,612"
    data-start-time-ms="34754382"
    data-end-time-ms="34754382"
    data-start-sub-pos="0"
    data-end-sub-pos="1">
    <span
      class="dsed-subtitles__sub dsed-subtitles__sub--curr"
      data-start-timecode="00:02:16,612"
      data-end-timecode="00:02:16,612"
      data-start-time-ms="34754382"
      data-end-time-ms="34754382">
      Some sub
    </span>
  </div>
  <!-- Groupe à venir -->
  <div
    class="dsed-subtitles__group dsed-subtitles__group--prev"
    data-start-timecode="00:02:16,612"
    data-end-timecode="00:02:16,612"
    data-start-time-ms="34754382"
    data-end-time-ms="34754382"
    data-start-sub-pos="0"
    data-end-sub-pos="1">
    <span
      class="dsed-subtitles__sub dsed-subtitles__sub--prev"
      data-start-timecode="00:02:16,612"
      data-end-timecode="00:02:16,612"
      data-start-time-ms="34754382"
      data-end-time-ms="34754382">
      Some sub
    </span>
  </div>
</div>
```

Après le dev :
- envoyer le code à GPT + Claude, leur demander:
  1/ s'ils comprennent le fichier, on veut juste s'assurer qu'on est raccord avec lui à ce stade
  2/ en gardant en tête de garder le périmètre fonctionnel intact, sans chercher à faire plus ce qu'il y a actuellement, de relever les nommages ou formes de code qui pourraient être améliorées pour que le fichier soit prêt à intégrer une librairie de composants solide, durable dans le temps et facile à maintenir. Préciser qu'il faut respecter les règles de standardjs pour le lint
- essayer de build, régler les erreurs du linter
- après ça, fournir à GPT/Claude un exemple de fichier test d'un autre composant, Drawer par ex, + le code actuel de Subtitles, et lui demander de garder le style/approche fourni, et générer les tests pertinents pour le composant Subtitles (utiliser srtFileContents et pas src, ça va être une galère). Lui rappeler que les tests sont évalués par nodejs, donc pas trop se reposer sur des choses qui se passent dans un browser. Pas trop besoin de checker le contenu du fichier de test, moi je prends ce qu'il me donne, je lance le test et espère que ça passe tout, si ça passe pas tu peux lui donner le contenu de l'erreur et voir si il arrive à régler le truc tout seul, si ça veut vraiment pas, commente l'intégralité du test qui bloque, tant pis.
- ensuite une fois que c'est bon, fournir à GPT/Claude un exemple de JSDOC issu d'un autre composant, Gallery par ex, + le code actuel de Subtitles, et lui demander de générer le JSDOC pour tous les exported members de Subtitles (Props et Subtitles à priori). Juste le JSDOC, pas répéter le code, parfois en générant tout il glisse des erreurs en répétant le code.
- re build, lint et corrections éventuelles des erreurs du linter
- pull add commit push 🎉


## Composant Vidéo


/components/Video


### D'abord, on va reprendre new-app/src/components/VideoPlayer/MutedVideo.tsx
Ce composant permet un workaround d'une petite bizzarerie de react avec l'attribut muted.
Ça va être notre composant vidéo de base, pour ne pas manipuler directement l'élément html vidéo.

### Ensuite, un composant tout simple :

// "on" evt listeners
// "state/props"
// "int/obs triggers"
// disclaimer
// subs
    
- une vidéo :
```tsx
type SourceData = {
  src?: string
  type?: string
}
type TrackData = {
  src?: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srclang?: string
  label?: string
  default?: boolean
}
type Props = {
  sources?: string | string[] | SourceData[] // liste des éléments <source> dans la vidéo (ignore si pas src dans SourceData)
  tracks?: string | string[] | TrackData[] // liste des éléments <tracks> dans la vidéo (ignore si pas src dans TrackData)
  children?: JSX.Element // react children habituel, vient se coller sous les <source> et <tracks>
} & VideoHTMLAttributes<HTMLVideoElement>

const {
  sources,
  tracks,
  children,
  ...intrinsicVideoAttributes
} = props
```
- un bouton play
  - sur lm-video :
  - data-play-on
  - lm-video--play-on
- un bouton pause
  - sur lm-video :
  - data-play-off
  - lm-video--play-off
- un span "temps écoulé"
  - sur lm-video :
  - data-elapsed-time-percent (0-1)
  - data-elapsed-time-ms
  - data-elapsed-time-readable ((hh:)mm:ss)
- un span "temps total"
  - sur lm-video :
  - data-total-time-ms
  - data-total-time-readable
- une div cliquable en guise de timeline (pas de curseur)
- un bouton sound on
  - sur lm-video:
  - data-sound-on
  - lm-video--sound-on
- un bouton sound off
  - sur lm-video:
  - data-sound-off
  - lm-video--sound-off
- un input range (0 - 100, step=1) pour piloter le son
  - sur lm-video:
  - data-sound-volume-percent (0-1) (ne se met pas à 0 si sound off, c'est deux données séparées)
  - data-sound-volume-readable (0-100)
- un span "volume (0-100)"
- un bouton full screen
  - sur lm-video:
  - data-fullscreen-on / data-full-screen-off
  - lm-video--fullscreen-on / lm-video--fullscreen-off
- un bouton download
- un input range playback-speed (0.25-4 step=0.25)
  - sur lm-video:
  - data-playback-speed (.25-4)
- un span "playback speed (.25-4)"

### En

## Tests & JSDOC

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
  - [ ] agnostic/time/duration
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
  - [x] agnostic/css/bem -> DEPRECATED
  - [x] agnostic/css/styles-set -> DEPRECATED
  - [x] agnostic/errors/register -> pas nécessaire
  - [x] agnostic/html/sanitization/html -> DEPRECATED
  - [x] agnostic/misc/assert -> DEPRECATED
  - [x] agnostic/misc/logs/logger -> presque DEPRECATED
  - [x] agnostic/misc/logs/styles -> pas nécessaire tout de suite
  - [x] agnostic/strings/normalize-indent -> pas nécessaire tout de suite, fonction à repenser
  - [x] agnostic/strings/replace-all -> DEPRECATED

## Misc

- [ ] Repenser agnostic/optim/throttle-debounce ?
- [ ] Repenser agnostic/strings/normalize-indent ?
- [ ] Get rid of namespaces in hyper-json ?
- [ ] agnostic/misc/logs/styles, se repencher dessus, viser à substituer totalement chalk (styles génériques, bold, red, bgBlue, etc...) + continuer à exporter des "styles nommés" comme actuellement
- [x] agnostic/misc/logs/styles, écrire à la main les ansi machins et se passer de chalk ?
- [x] Migrate to v3 of aws-sdk (then remove workaround plugin in lm-publisher)
- [x] JSDOC everywhere
- [x] Really not sure about the centralized error codes
- [x] create empty (export {}) index.js files in directories without index files so that import is easyer on the consumer side
