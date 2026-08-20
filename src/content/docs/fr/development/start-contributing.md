---
title: Commencer à contribuer
description: Un guide pour commencer à contribuer à SteelMC.
---

Dans ce guide, tu vas apprendre tout ce qu'il faut savoir pour commencer à contribuer à SteelMC.

:::note
Ce guide part du principe que tu sais déjà utiliser Git et GitHub.
:::

## Avant de commencer

Avant même de te préparer, tu dois connaître quelques concepts clés de la philosophie de Steel.

### Philosophie du code

Quand tu écris du code pour Steel, garde en tête que nous voulons des solutions complètes, pas des solutions à moitié faites. Pour les systèmes moyens à gros, une investigation sur le fonctionnement en vanilla et sur la façon de faire mieux est indispensable. Nous construisons en pensant à de bonnes fondations, ce qui veut dire que tout le code doit être lisible, documenté, cohérent et prêt pour la production. Si tu travailles sur un système susceptible d'accueillir du modding à l'avenir, prépare-le pour cet avenir.

### Politique sur l'IA

L'usage que tu fais de l'IA nous importe peu, tant que tu peux garantir que tu comprends tout le code de ta PR, que tu peux expliquer toutes les décisions prises pendant le développement, et quelles alternatives tu as écartées avant d'ouvrir la pull request.

### Standards de code

Jette aussi un œil à [nos standards de code](../code-standard).

## Préparatifs

Maintenant que tu connais notre philosophie, il est temps de travailler sur ta PR, mais d'abord...

### Choisir quoi faire

Il y a plusieurs façons de savoir quoi faire, mais nous te conseillons ces étapes :

- Regarde [nos PR ouvertes](https://github.com/Steel-Foundation/SteelMC/pulls) pour savoir sur quoi les autres travaillent
- Regarde [nos issues ouvertes](https://github.com/Steel-Foundation/SteelMC/issues) pour voir ce qui peut être corrigé (filtrer sur le label `good first issue` est recommandé)
- Regarde [notre tracker](../../tracker) pour voir ce qui manque
- Demande dans #dev-work sur [notre Discord](/discord) pour confirmer que tu peux implémenter quelque chose

### Créer une nouvelle branche

D'abord, si tu n'as pas de fork de SteelMC sur ton compte GitHub, [fork le dépôt ici](https://github.com/Steel-Foundation/SteelMC/fork).

Une fois sur ton fork, crée une nouvelle branche dont le nom précise la fonctionnalité que tu implémentes.

:::caution
Veille à créer ta branche depuis notre branche `main` ou `dev`, pas depuis une branche de fonctionnalité, sauf si tu sais ce que tu fais.
:::

Clone cette branche sur ta machine pour commencer à travailler.

## Développer

Comme ce guide ne présume pas de ce que tu implémentes, nous ne pouvons pas t'aiguiller beaucoup ici, mais dans tous les cas tu auras besoin d'apprendre [à travailler avec la base de code Java de Minecraft](../decompile-minecraft).

Nous avons plusieurs guides pour t'aider à implémenter certaines parties du code :

- [Comment travailler avec les registres](../registries)
- [Comment enregistrer des blocs et des items](../block_item_registration)
- [Comment travailler avec les blocs](../blocks/overview)
- [Comment travailler avec les items](../items/overview)
- [Comment déboguer le réseau](../network/overview)
- [Comment utiliser notre extracteur](../tools/steel_extractor)

## Une fois terminé

Une fois ta fonctionnalité entièrement implémentée, testée par tes soins, à jour avec le dernier commit et poussée sur ta branche GitHub, tu peux ouvrir une PR depuis ta branche vers notre dépôt d'origine. Mais avant, assurons-nous que ton code est prêt à être relu.

:::note
Nous avons des vérifications automatiques pour garantir la qualité du code. Ces commandes te permettent de voir s'il y a un problème de ce côté :

```bash
# Pour vérifier les standards de code
cargo clippy -r --all-targets --all-features

# Pour vérifier le formatage du code
cargo fmt --all --check

# Pour chercher les fautes de frappe (vérification orthographique)
typos
```

Tu trouveras comment installer `typos` [ici](https://crates.io/crates/typos-cli#install).

Nous avons un fichier de configuration [Prek](https://prek.j178.dev/) dans la base de code. Avec lui, tu peux lancer `prek` en local pour préparer automatiquement ton code à la relecture.

```bash
prek run
```
:::

Renseigne le titre et la description de ta pull request en suivant notre modèle.

Tu peux aussi demander directement une relecture à nos mainteneurs sur GitHub, ou poster le lien de ta PR dans notre salon Discord `prs-ready-for-review`, pour prévenir nos adorables mainteneurs qu'ils ont du code à relire.

Nos mainteneurs peuvent te demander des changements. Si cela arrive, modifie le code demandé, ou explique pourquoi tu penses que c'est mieux ainsi.

Ton code finira par être fusionné dans le nôtre. Quand ce moment arrivera, souviens-toi :\
**« Merci et félicitations pour ton code »**
