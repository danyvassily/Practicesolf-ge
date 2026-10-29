# Vérification de la livraison

Vérifications exécutées le 29 octobre 2026.

- `npm run check` : syntaxe des trois modules JavaScript valide.
- `npm test` : six tests métier réussis, dont contrôle des intervalles des 96 gammes, orthographe des tonalités altérées, octaves des deux clefs, lignes supplémentaires, bécarre et export MusicXML.
- Vérification des interactions avec un DOM LinkeDOM temporaire, sans dépendance ajoutée au projet : navigation des écrans, séance visuelle terminée à 10/10, correction d’une mauvaise réponse auditive, présence des 25 touches du piano, filtres de styles, quatre lignes de partition, statistiques, sauvegarde JSON et rejet d’une sauvegarde invalide.

Le contrôle DOM exécute les véritables fonctions de l’application mais remplace l’audio par un substitut. Il ne remplace pas un essai dans un navigateur.

## Vérifications manuelles encore recommandées

Le navigateur de contrôle et les helpers de prévisualisation Sites ne sont pas disponibles dans cet environnement. Le rendu visuel, l’écoute réelle, Safari/iOS, l’impression et l’ouverture MusicXML dans MuseScore n’ont donc pas été validés manuellement ici. Les sorties SVG/XML et les calculs musicaux sont couverts par les tests.

Pour une recette : lancer `npm start`, parcourir les sept écrans sur ordinateur et téléphone, terminer une séance sur chaque clef, écouter/arrêter une gamme altérée, ouvrir le PDF d’impression et importer un fichier MusicXML dans un éditeur de partition.
