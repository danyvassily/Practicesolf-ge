# État du projet et prochaines étapes

## V1 livrée

Application statique française, sans dépendance : tableau de bord, quiz visuel et auditif de dix notes, clefs sol/fa/mixte, trois étendues, révision pondérée des erreurs, bilan, 96 combinaisons de gammes, clavier synthétisé, séquences au tempo, quatre familles d’exercices imprimables, MusicXML, six leçons fondamentales, statistiques locales et sauvegarde/restauration.

Tests métier : intervalles des gammes, orthographe, do central, repères des clefs, portées et export MusicXML. Voir le rapport de livraison pour les commandes effectivement exécutées dans l’environnement.

## Priorité 1 — Pédagogie et fiabilité

- Faire relire les cours, corrections et parcours par un professeur de piano/solfège.
- Ajouter des séances graduées avec objectifs explicites et validation de maîtrise par clef.
- Étendre les quiz aux altérations et aux armures avec progression douce.
- Ajouter une vraie lecture rythmique : durées, silences, mesures et évaluation du placement.
- Affiner la répétition espacée avec dates de révision, tout en conservant un schéma migrable.
- Tester manuellement impression, audio sur iOS/Safari et exports dans MuseScore.

## Priorité 2 — Pratique au piano

- Entrée MIDI facultative, avec détection de compatibilité et solution sans MIDI.
- Doigtés validés, travail séparé des mains, mains ensemble et tempo progressif.
- Meilleur instrument sonore avec échantillons licenciés et chargement facultatif.
- Exercices d’intervalles et d’accords à l’oreille, avec consignes distinctes de la reconnaissance de notes.
- Deux portées simultanées et exercices rythmiques originaux plus variés.
- Gamme mineure mélodique avec distinction ascendance classique / usages jazz.

## Priorité 3 — Bibliothèque et portabilité

- Ajouter des partitions réellement redistribuables après vérification édition par édition.
- Indexer niveau, objectifs, tonalité, durée et provenance.
- Mode PWA avec service worker et mises à jour contrôlées.
- Si demandé : synchronisation entre appareils, authentification et règles d’accès.
- Tests automatisés de parcours au navigateur dans un environnement approprié.

## Hors périmètre actuel

Reconnaissance des notes au microphone, évaluation acoustique en temps réel, import de PDF arbitraire, arrangements de chansons protégées, cours prétendant remplacer un professeur.

## Points à surveiller

- Les ressources externes peuvent changer d’URL.
- `localStorage` est lié au navigateur et peut être effacé ; encourager l’export JSON.
- Les gammes utilisent le tempérament égal au piano. L’orthographe reste musicale.
- Les exercices de base sont des lignes de quatre noires ; le MusicXML complète la dernière mesure par un silence si nécessaire.
- Les statistiques « notes travaillées » comptent les réponses aux quiz, pas les touches jouées.

