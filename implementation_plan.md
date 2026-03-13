# Implémentation du Système de Roadmap

Ce document détaille l'approche proposée pour implémenter un système de roadmap synchronisé avec GitHub (Issues/PRs).

## Approche Recommandée

La solution la plus robuste pour synchroniser avec GitHub avec des webhooks est la séparation des données de synchronisation (GitHub) et des données de l'application (Roadmap). Cela permet d'avoir une source de vérité sur l'état de l'Issue GitHub sans polluer la table `features`, et ça rendra le système plus facile à étendre si on associe une feature à plusieurs PRs dans le futur.

Pour la hiérarchie des features, nous utiliserons un champ `parentId` plutôt qu'un tableau d'enfants. Une feature ne peut avoir qu'un seul parent, ce qui simplifie la structure. Le lazy loading permettra de charger les enfants à la demande : on récupère d'abord les features racines (sans `parentId`), puis on charge les enfants quand l'utilisateur interagit avec un parent.

> Puisque tu utilises `better-auth`, toutes les mutations de création/modification (Features, Roadmaps, Roadmap Items) vérifieront que l'utilisateur est authentifié (`ctx.auth.getUserId()`) pour éviter que n'importe qui modifie la roadmap.

## Permissions

### Roadmaps
Les roadmaps appartiennent à leur créateur. Elles sont **publiques en lecture** (tout le monde peut voir une roadmap et ses items), mais seul le propriétaire peut les **modifier ou supprimer**.

- `roadmaps` stocke un `userId` (le créateur, récupéré via `ctx.auth.getUserId()`)
- Toutes les mutations de modification/suppression de roadmap et de ses items vérifient que `userId === ctx.auth.getUserId()`

### Features
Les features sont un **registre global partagé**. N'importe quel utilisateur authentifié peut en créer ou en modifier. La suppression est réservée aux admins.

- `createFeature` / `updateFeature` : authentification suffisante
- `deleteFeature` : requiert un rôle admin — **à implémenter ultérieurement** (le système de rôles n'existe pas encore). Pour l'instant, la mutation peut vérifier un flag hardcodé ou être désactivée côté frontend, en attendant le système de rôles.

## Proposed Changes

### Convex Schema & Backend [convex/schema.ts](file:///Users/filou/Desktop/Development/SteelDocs/convex/schema.ts)

Nous allons ajouter 4 nouvelles tables pour modéliser le domaine :

#### [MODIFY] schema.ts
```typescript
  // ─── Github Sync ─────────────────────────────────────────────────────────────

  /**
   * Table synchronisée via Webhooks GitHub.
   * Représente une Issue ou une PR.
   */
  github_entities: defineTable({
    github_id: v.number(), // ID unique venant de GitHub
    type: v.union(v.literal("issue"), v.literal("pr")),
    title: v.string(),
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("merged")),
    url: v.string(),
  }).index("by_github_id", ["github_id"]),

  // ─── Roadmap ────────────────────────────────────────────────────────────────

  /**
   * Représente une fonctionnalité globale de l'application.
   * Peut avoir une feature parente (pour construire l'arbre).
   * Le completeStatus est géré exclusivement par le webhook GitHub.
   * Pour une feature sans github_entity_id, il reste false jusqu'à maj manuelle.
   */
  features: defineTable({
    name: v.string(),
    completeStatus: v.boolean(),
    // Référence optionnelle vers la feature parente (pour l'arbre)
    parentId: v.optional(v.id("features")),
    // Lien à l'entité GitHub gérée par le webhook (1 issue/PR par feature)
    github_entity_id: v.optional(v.id("github_entities")),
  }).index("by_parent", ["parentId"]),

  /**
   * Une Roadmap qui contient plusieurs items.
   * Appartient à un utilisateur (userId = créateur).
   */
  roadmaps: defineTable({
    name: v.string(),
    userId: v.string(), // ID de l'utilisateur propriétaire
  }).index("by_user", ["userId"]),

  /**
   * Un élément de la todo-list (Roadmap).
   */
  roadmap_items: defineTable({
    name: v.string(),
    completeStatus: v.boolean(),
    feature_id: v.optional(v.id("features")),
    roadmap_id: v.id("roadmaps"), // Référence à la roadmap parente
    order: v.number(), // Utile pour réorganiser la todo list
  }).index("by_roadmap_and_order", ["roadmap_id", "order"])
    .index("by_roadmap", ["roadmap_id"]),
```

### Convex Queries & Mutations

#### [NEW] roadmap.ts
Créer un nouveau fichier avec les fonctions suivantes :

1. **Queries** :
   - `getRoadmaps` : Liste toutes les roadmaps (public)
   - `getRoadmapItems` : Récupère les items d'une roadmap (avec le nom de la feature associée via JOIN manuel, public)
   - `getRootFeatures` : Récupère les features racines (sans `parentId`) - pour le lazy loading initial
   - `getChildFeatures` : Récupère les enfants d'une feature spécifique (par `parentId`)

2. **Mutations** :
   - `createFeature` : Crée une feature (optionnellement avec un `parentId`) — authentification requise
   - `updateFeature` : Met à jour une feature — authentification requise
   - `deleteFeature` : Supprime une feature — **admin uniquement** (à implémenter). Avant de supprimer, reparente les enfants directs vers le `parentId` de la feature supprimée (ou `undefined` si elle était racine). Nullifie aussi le `feature_id` sur les `roadmap_items` liés.
   - `createRoadmap` : Crée une roadmap, stocke le `userId` du créateur — authentification requise
   - `updateRoadmap` / `deleteRoadmap` : Vérifie que `userId === ctx.auth.getUserId()` — propriétaire uniquement
   - `createRoadmapItem` : Crée un item dans une roadmap — vérifie que l'utilisateur est propriétaire de la roadmap
   - `updateRoadmapItem` / `deleteRoadmapItem` : Vérifie que l'utilisateur est propriétaire de la roadmap parente
   - `toggleRoadmapItem` : Coche/décoche un item — **n'affecte que l'item**, pas la feature liée. Le `completeStatus` d'une feature est la responsabilité exclusive du webhook GitHub. Vérifie que l'utilisateur est propriétaire de la roadmap.

### GitHub Webhook [convex/http.ts](file:///Users/filou/Desktop/Development/SteelDocs/convex/http.ts)

#### [MODIFY] http.ts
Ajout d'une nouvelle route HTTP `POST /github-webhook` pour écouter les événements GitHub.

1. Le webhook vérifie la signature de la requête avec le secret `GITHUB_WEBHOOK_SECRET` (variable d'environnement à configurer dans Convex)
2. Si le payload de l'événement est `pull_request` ou `issues` et que l'action est `closed` (ou `merged` pour les PRs)
3. Il appelle une mutation interne

#### [NEW] webhookMutations.ts
1. Une mutation `internal` déclenchée par le webhook (non exposée publiquement)
2. Elle met à jour le `status` dans la table `github_entities`
3. Si le status passe à `closed` ou `merged`, elle cherche toutes les `features` liées à cet `github_entity_id`
4. Pour chaque `feature` trouvée, elle met à jour `completeStatus: true`
5. Elle cherche ensuite tous les `roadmap_items` associés à ces features, et les met à jour à `completeStatus: true`

> Note : le webhook est la **seule** source de vérité pour `feature.completeStatus`. `toggleRoadmapItem` ne modifie jamais ce champ.

### Variables d'environnement requises
À configurer dans le dashboard Convex (`npx convex env set`) :
- `GITHUB_WEBHOOK_SECRET` : secret partagé entre GitHub et Convex pour valider les payloads webhook

### Frontend Composants

- Création d'une page/composant `Roadmap.tsx` pour gérer les todolists de roadmap
- Création d'une page/composant `FeaturesTree.tsx` pour visualiser l'arbre des fonctionnalités
  - Chargement initial : fetch les features racines avec `useQuery(getRootFeatures)`
  - Au clic sur une feature parent : fetch ses enfants avec `useQuery(getChildFeatures, { featureId: ... })`
- Pour afficher le nom de la feature associée dans la liste de roadmap, créer une query Convex qui fait un JOIN manuel
- Le bouton "Supprimer une feature" est masqué côté frontend en attendant le système de rôles admin

## Verification Plan

### Manual Verification
1. Créer une Feature manuelle depuis le Dashboard Convex
2. Créer un Roadmap Item associé à cette Feature
3. Simuler un payload de Webhook GitHub via une requête POST avec `curl` ou Postman
4. Vérifier que la `github_entity` est mise à jour, que la `feature` est cochée, et que le `roadmap_item` est coché automatiquement sur l'interface
5. Vérifier que cocher/décocher manuellement un `roadmap_item` ne modifie pas le `completeStatus` de la feature liée
6. Créer une feature enfant, supprimer la feature parente, vérifier que l'enfant est reparenté au grand-parent (ou devient racine)
7. Tenter de modifier/supprimer une roadmap avec un utilisateur différent du créateur — vérifier le rejet
