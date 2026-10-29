# Instructions pour les agents IA et IDE

## Mission

Faire d’Atelier Piano une application française accessible, fiable et progressive d’apprentissage du solfège au piano. Priorité : lecture de notes, compréhension des clefs et des portées, puis écoute, gammes et pratique. Maintenir une expérience calme et claire pour débutants.

## Lire avant d’agir

1. `README.md` pour démarrer et comprendre la version livrée.
2. `docs/ROADMAP.md` pour l’état réel et les travaux restants.
3. `docs/SOURCES.md` pour les références musicales et droits.
4. `docs/MASTER_PROMPT.md` pour la vision produit.

## Architecture et conventions

- Application statique HTML/CSS/JS en modules ES. Pas de dépendance requise.
- Garder les calculs musicaux dans `dist/music.js`, sans accès au DOM.
- Réserver Web Audio à `dist/audio.js` ; annuler les lectures en cours lors des changements d’écran.
- `dist/app.js` gère le DOM et la progression ; schéma versionné dans localStorage.
- Aucun secret ou jeton dans le dépôt ; pas de données personnelles dans les fichiers.
- Interface, messages et documentation en français.
- Ne pas remplacer l’application par une maquette ou afficher de faux résultats.
- Avant tout changement de schéma, prévoir validation et migration des sauvegardes.
- Les chemins de déploiement Sites sont dans `.openai/hosting.json`. Préserver le project_id existant ; ne pas recréer un Site pour une simple mise à jour.

## Fiabilité musicale

- Do central = do 4 = MIDI 60 ; la 4 = MIDI 69 = 440 Hz.
- Clef de sol : deuxième ligne = sol 4 ; clef de fa : quatrième ligne = fa 3.
- Compter les lignes de bas en haut. Placer les notes par degré diatonique, pas par distance en demi-tons.
- Respecter l’orthographe des gammes : mi♯ en fa♯ majeur, etc. Ne pas remplacer systématiquement les bémols par des dièses.
- Vérifier les altérations de rappel/bécarres, les lignes supplémentaires et les octaves.
- Présenter les genres comme usages possibles, pas comme propriétés exclusives des gammes.
- La reconnaissance actuelle utilise une référence et ignore l’octave. Ne pas la présenter comme un test d’oreille absolue.
- Ajouter du contenu original ou sous licence compatible avec attribution exacte. Ne pas recopier des partitions trouvées au hasard.

## Vérifications attendues

```sh
npm run check
npm test
```

Pour une modification des interactions, vérifier au navigateur si l’environnement le permet : navigation, quiz complet, changement de clef, son/arrêt, tonalités altérées, export, impression et petit écran. Si le navigateur est indisponible, le signaler explicitement et ne pas inventer une validation visuelle. Ne pas installer un navigateur en contournant les règles de l’environnement.

## Définition d’une tâche terminée

- Fonction utilisable, messages d’erreur et états vides cohérents.
- Vérifications adaptées exécutées, résultats honnêtement rapportés.
- Navigation au clavier, focus visible, annonces des corrections et responsive préservés.
- `README.md` et `docs/ROADMAP.md` mis à jour pour refléter ce qui est réellement livré.
- Tout travail incomplet est nommé avec une prochaine étape concrète.
- Ne pas ajouter compte, service payant, collecte de données ou backend sans besoin établi.

