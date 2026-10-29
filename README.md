# Atelier Piano 🎹

Application web en français pour apprendre le solfège et pratiquer au piano, du premier repère sur une portée aux couleurs du blues et du jazz.

## Démarrer

Node.js 20 ou plus récent. Aucune dépendance à installer.

```sh
npm start
# http://localhost:4173
npm test
npm run check
```

Le site est constitué de fichiers statiques dans `dist/`. Tout hébergeur statique peut les servir. Ne pas ouvrir directement le fichier HTML avec `file://` : les modules JavaScript nécessitent un serveur HTTP.

## Ce qui est livré

- Tableau de bord et objectif quotidien de dix réponses, sans statistiques fictives.
- Lecture de notes naturelles en clef de sol, de fa ou en alternance ; trois étendues.
- Séances de dix questions, correction expliquée, bilan et répétition plus fréquente des notes difficiles.
- Reconnaissance auditive de notes naturelles avec do de référence ; les octaves ne sont pas évaluées.
- Huit gammes/modes dans les douze tonalités : majeure, mineure naturelle, mineure harmonique, pentatonique majeure, pentatonique mineure, blues mineure, dorienne, mixolydienne.
- Orthographe diatonique des notes (par exemple mi♯ en fa♯ majeur), portées SVG et clavier sonore.
- Écoute des gammes avec tempo réglable et arrêt de lecture.
- Exercices originaux progressifs : notes conjointes, tierces, lecture aléatoire et gamme sélectionnée.
- Impression/PDF par le navigateur et téléchargement MusicXML compatible avec les éditeurs de partitions.
- Cours courts sur les portées, les deux clefs, les altérations, les durées et les gammes.
- Progression locale, export/restauration JSON et suppression avec confirmation.
- Bibliothèque de liens vers les éditions de Czerny op. 599 et page des sources.

## Structure

```text
dist/
  index.html       coque accessible, navigation
  styles.css       responsive et impression
  music.js         modèle musical pur, calcul des gammes, SVG, MusicXML
  audio.js         synthèse Web Audio et séquences annulables
  app.js           écrans, exercices, progression
scripts/serve.mjs   serveur HTTP local sans dépendance
tests/music.test.js tests des règles musicales
docs/SOURCES.md     références et licences
docs/ROADMAP.md     état et priorités
docs/MASTER_PROMPT.md prompt de reprise pour agent IA
AGENTS.md           règles pour tout agent ou IDE
```

## Données et confidentialité

La progression se trouve dans `localStorage`, clé `atelier-piano-v1`, avec version de schéma 1. Les réponses sont comptées dès validation ; seules les séances terminées entrent dans le carnet. Les 200 dernières séances sont conservées et les 20 dernières affichées. Le jour est calculé dans le fuseau local de l’appareil. Aucun compte, serveur de données, publicité, microphone ou secret d’API n’est nécessaire.

Les polices DM Sans/Manrope peuvent être chargées depuis Google Fonts ; des polices système prennent le relais. L’application ne fait appel à aucune API musicale. Il n’y a pas encore de service worker ni de promesse de disponibilité hors ligne après fermeture.

## Limites connues

Il s’agit d’une V1 pédagogique. Le son est synthétisé, pas un piano échantillonné. L’oreille musicale travaille une comparaison avec référence, pas l’oreille absolue. Les exercices sont des notes seules en noires, sans accompagnement ni notation rythmique évaluée. Les gammes ne sont pas attribuées exclusivement à un genre. Pas de MIDI, reconnaissance micro, synchronisation entre appareils, doigtés automatiques ou import de partition arbitraire.

Les PDF de Czerny restent des liens externes : aucun fac-similé tiers n’est distribué dans le dépôt. Les partitions produites par l’application sont originales. Voir [les sources](docs/SOURCES.md).

## Reprendre avec une IA

Lire [AGENTS.md](AGENTS.md), [l’état du projet](docs/ROADMAP.md) et [le prompt maître](docs/MASTER_PROMPT.md). Ces fichiers séparent les fonctions livrées, les limites et les prochaines étapes. Actualiser ces documents à chaque changement significatif.

## Licence

Code et exercices originaux sous licence MIT. Les contenus externes et polices gardent leurs propres licences.

