---
title: Standard de code
description: Ces exigences doivent être respectées
---

# Standard de code

## Général

- En général, vanilla nomme plutôt bien les choses, donc conserver les mêmes noms rend la lecture plus facile pour la personne suivante. Il arrive toutefois qu'on veuille s'en écarter, quand les noms sont mauvais ou peu descriptifs, ou quand on veut une tout autre solution pour le système concerné. Dans ce cas, il faut ajouter un commentaire de documentation au-dessus de la structure, de la méthode ou du module, qui énonce clairement les différences, pour que la prochaine personne qui reprend le code comprenne ton système sans peine.
- Il faut essayer de minimiser la duplication de code, mais quelques lignes ne posent généralement pas de problème.
- Quand on travaille sur les fondations, il faut être particulièrement vigilant à ne pas prendre de raccourcis ni laisser des trous, sous peine de devoir plus tard redessiner entièrement un système fondamental. Le code fondamental, c'est un système ou une interface dont dépend le reste du code : le trait de comportement des blocs, par exemple. S'il est mal conçu dès le départ et que 100 implémentations de blocs reposent dessus, bon courage pour le changer. Cela n'interdit pas pour autant des évolutions fondamentales futures, si le premier système a été conçu pour durer. Notre ordonnanceur de chunks est un exemple de ce type de fondation : les étapes de chunk et les règles qui déterminent leur exécution sont déjà définies, ce qui veut dire que remplacer l'ordonnanceur ne casse pas le code de génération.
- Pas de contournements. Ne sois pas fainéant au point de ne pas créer une fonction utilitaire sous prétexte que tu n'en avais besoin qu'une fois pour ton cas d'usage.
- Essaie de ne pas trop imbriquer le code. Les clauses de garde sont utiles pour ça, et Rust dispose de très bons `if let` et `let Some() = x else { return }`.
- N'utilise pas de panics, sauf si le cas ne peut jamais se produire ou s'il est fatal au programme. Sinon, préfère les `Result`.
- Ne parallélise rien sans pouvoir expliquer pourquoi c'est nécessaire et le prouver avec des benchmarks.
- N'utilise pas d'async sauf si tu as besoin d'E/S disque ou réseau, ou d'un grand nombre de tâches peu coûteuses en calcul qui doivent être attendues (les dépendances de chunks, sachant que la génération, elle, tourne sur rayon). Veille toujours à ne jamais exécuter de code intensif en calcul dans un runtime async : fais le pont avec `spawn_blocking` ou en lançant une tâche rayon.
- Utilise [samply](https://github.com/mstange/samply) ou [jaeger](https://www.jaegertracing.io/docs/latest/getting-started/) pour le profilage. Jaeger est le meilleur pour mesurer les temps à l'aide des spans de tracing et pour capturer du contexte et des moyennes. Samply est le meilleur si tu veux un simple flame graph pour voir quelle fonction interne consomme le plus de ressources, par exemple pour la génération de monde.
- N'ajoute pas de dépendances inutiles. On n'est pas en JavaScript, on n'a pas besoin de is-even ni de left-pad.
- Si tu n'as pas entièrement implémenté une fonctionnalité, pense à ajouter un commentaire `// TODO:`.

## Registres

- Il ne faut générer que ce qui est nécessaire. Minecraft utilise-t-il une transformation de collision codée en dur sur les entités selon leur état ? Alors nous devons faire pareil, plutôt que de les extraire.
- Il faut écrire les registres à la main quand ils comportent une logique complexe, sauf s'ils ont beaucoup d'entrées (plus de 30). Des choses comme les data components et les sérialiseurs d'entités demandent beaucoup de travail manuel pour obtenir des sérialiseurs corrects, et ils n'ont que quelques entrées : aucune raison de compliquer davantage avec de la génération.
- Il faut utiliser les données extraites du data pack de Minecraft plutôt que de générer un format personnalisé, quand elles y figurent. Cela concerne généralement ce que Mojang appelle les registres rechargeables, ce qui inclut les tags, les données de worldgen, etc. Les registres vanilla BuiltIn, eux, doivent être extraits.
- Il faut tout concevoir en pensant au modding et à la compatibilité ABI futurs. Rien n'oblige à ajouter dès maintenant un type d'attribut d'énumération `Other`, mais il faut s'assurer que la conception pourra l'accueillir plus tard. Nous devons tenir le même niveau d'exigence que NeoForge en matière de modding, donc même les registres de blocs (les registres vanilla BuiltIn) doivent être pensés dans cette optique.

## Tests

- Ajoute des tests pour les systèmes avancés, pour le code utilisant `unsafe` (toujours avec des commentaires `// SAFETY`) et pour le code qui doit respecter le déterminisme de vanilla (hachage d'ItemComponent ou worldgen).
- N'utilise `#[allow]` sur un lint clippy qu'avec un commentaire de justification, sauf si c'est évident. Les faux positifs et les écarts volontaires (par exemple la longueur d'une fonction pour la lisibilité) sont acceptables lorsqu'ils sont expliqués.
