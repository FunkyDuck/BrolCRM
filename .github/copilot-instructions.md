# SPEC.md — Brol (Micro-CRM Local-First Desktop & Web)

## 1. Vision & Philosophie
**Brol** est un micro-CRM personnel minimaliste, conçu spécifiquement pour un développeur freelance qui rejette la prospection commerciale traditionnelle et les outils marketing complexes.

* **Approche "Anti-Usine à Gaz" :** Aucune notion de pipeline commercial complexe, de scoring de leads, d'automatisation d'e-mails ou de tableaux de bord analytiques. L'objectif est strictement limité au suivi des contacts qualifiés, des problèmes techniques identifiés chez les prospects et des dates de relance.
* **Local-First & Souveraineté :** Aucun serveur distant, aucune base de données cloud, aucune authentification. Les données résident localement sur la machine de l'utilisateur dans un fichier JSON standard, portable et facilement sauvegardable.
* **Périmètre exclu (Out of Scope) :** Facturation, devis, envoi d'e-mails depuis l'app, multi-utilisateurs, synchronisation cloud native.

---

## 2. Stack Technique
* **Framework Desktop :** Tauri v2 (Rust backend minimaliste pour l'accès natif au système de fichiers).
* **Frontend :** Vue 3 (Composition API exclusivement avec `<script setup lang="ts">`).
* **Langage :** TypeScript (mode `strict: true`).
* **Styling :** Tailwind CSS v4 (ou v3 selon init Vite) — Thème sombre (`dark`) par défaut, interface dense, ergonomique et orientée productivité.
* **Gestion d'état :** Composable Vue dédié (`useBrolStore.ts`) faisant office de store réactif centralisé.
* **Persistance :** Plugin officiel `@tauri-apps/plugin-fs` et `@tauri-apps/api/path` (sauvegarde dans `$APPDATA/brol/data.json`), avec repli automatique (fallback) sur `localStorage` si exécuté dans un navigateur standard (`vite dev`).

---

## 3. Modèle de Données (`src/types/brol.ts`)

```typescript
export type ProspectStatus = 
  | 'to_contact'     // À contacter
  | 'contacted'      // Contacté (en attente de retour)
  | 'in_discussion'  // En discussion / Échange en cours
  | 'signed'         // Mission validée / Signé
  | 'archived';      // Classé sans suite / Non pertinent

export type InteractionType = 'email' | 'call' | 'meeting' | 'note';

export interface Interaction {
  id: string;
  date: string; // Format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
  type: InteractionType;
  summary: string;
}

export interface Prospect {
  id: string;
  companyName: string;       // Requis
  contactName: string;
  email: string;
  website: string;
  status: ProspectStatus;
  nextFollowup: string | null; // Format YYYY-MM-DD ou null
  techPainPoint: string;     // Problème technique ou besoin métier identifié
  notes: string;             // Notes libres (Markdown léger ou texte brut)
  interactions: Interaction[];
  createdAt: string;         // Format ISO 8601
  updatedAt: string;         // Format ISO 8601
}

export interface BrolDatabase {
  version: number;
  lastModified: string;
  prospects: Prospect[];
}
```

---

## 4. Architecture & Arborescence du Projet

```text
brol/
├── src-tauri/                 # Configuration et backend Rust Tauri v2
│   ├── capabilities/          # Permissions fs (read/write sur $APPDATA/brol/*)
│   ├── src/
│   │   └── lib.rs             # Initialisation des plugins (tauri-plugin-fs)
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── types/
│   │   └── brol.ts            # Interfaces TypeScript strictes
│   ├── services/
│   │   └── storage.ts         # Abstraction persistance (Tauri FS vs LocalStorage fallback)
│   ├── composables/
│   │   └── useBrol.ts         # Logique métier, CRUD prospects, filtres, import/export
│   ├── components/
│   │   ├── AppHeader.vue      # Barre supérieure : recherche, bouton "+ Prospect", Export/Import JSON
│   │   ├── StatusFilter.vue   # Onglets de filtrage rapide par statut + compteurs
│   │   ├── ProspectList.vue   # Vue tableau dense des prospects avec alertes relances
│   │   ├── QuickAddModal.vue  # Modale d'ajout rapide (3 champs essentiels)
│   │   └── ProspectDrawer.vue # Panneau latéral d'édition complète & journal d'interactions
│   ├── App.vue                # Layout principal mono-écran
│   └── main.ts                # Point d'entrée Vue 3
├── index.html
├── package.json
├── tsconfig.json
└── SPEC.md
```

---

## 5. Spécifications Fonctionnelles & UX

### 5.1. Persistance & Sécurité des Données (`src/services/storage.ts`)
* Au démarrage de l'application, lecture du fichier `data.json` dans le répertoire `appDataDir()` de Tauri (`brol/data.json`).
* Si le dossier ou le fichier n'existe pas, création automatique avec une structure `BrolDatabase` vierge (`version: 1`).
* **Auto-save :** Chaque modification d'état déclenche une écriture asynchrone (avec debounce de 300ms) vers le disque.
* **Portabilité :** Deux actions dans le header permettent d'exporter manuellement la base complète en `.json` (via `@tauri-apps/plugin-dialog` ou téléchargement navigateur) et d'importer un fichier `.json` existant pour restaurer ou écraser les données après confirmation.

### 5.2. Vue Principale (`ProspectList.vue`)
* **Mono-écran sans routage :** L'utilisateur voit immédiatement l'essentiel.
* **Filtres rapides :**
  * Onglets par statut (`Tous`, `À contacter`, `Contactés`, `En discussion`, `Signés`, `Archivés`) affichant le nombre d'éléments par catégorie.
  * Barre de recherche instantanée filtrant sur `companyName`, `contactName` et `techPainPoint`.
* **Indicateurs visuels de relance :**
  * Si `nextFollowup` est antérieur ou égal à la date du jour (et que le statut n'est ni `signed` ni `archived`), la ligne affiche un badge d'alerte discret (ex: ambre/rouge léger) et remonte en priorité dans le tri par défaut.
* **Colonnes affichées :** Entreprise (avec lien cliquable vers `website`), Contact, Problème technique identifié (tronqué sur 1 ligne), Statut (badge coloré), Prochaine relance.

### 5.3. Ajout Rapide (`QuickAddModal.vue`)
* Accessible via un bouton dédié ou un raccourci clavier (`Ctrl+N` / `Cmd+N`).
* Formulaire minimaliste limité à **3 champs** pour éviter toute friction lors de la prospection :
  1. `companyName` (Input texte, focus automatique, requis)
  2. `website` (Input URL)
  3. `techPainPoint` (Textarea court : *"Quel est le problème technique ou l'opportunité identifiée ?"*)
* Statut initialisé par défaut à `'to_contact'`.

### 5.4. Drawer d'Édition & Historique (`ProspectDrawer.vue`)
* S'ouvre au clic sur une ligne du tableau.
* Permet de modifier à la volée :
  * Le statut via un sélecteur rapide (boutons segments).
  * La date de prochaine relance (`<input type="date">` + raccourcis rapides : `+3 jours`, `+1 semaine`, `+1 mois`).
  * Les coordonnées (`contactName`, `email`, `website`) et le champ `notes` libre.
* **Journal d'interactions :**
  * Mini-formulaire en haut de la section historique pour ajouter une entrée (`type` + `summary`) datée automatiquement à l'instant T.
  * Liste chronologique inversée des échanges passés.
* Bouton de suppression définitive du prospect (avec demande de confirmation).

---

## 6. Plan d'Implémentation (Instructions pour Copilot)

1. **Étape 1 — Initialisation & Types :**
   * Vérifier l'installation de `@tauri-apps/plugin-fs` et `@tauri-apps/plugin-dialog` dans `package.json` et `Cargo.toml`, ainsi que les permissions dans `src-tauri/capabilities/default.json`.
   * Créer `src/types/brol.ts` avec toutes les interfaces définies en section 3.
2. **Étape 2 — Couche Persistance & Composable :**
   * Implémenter `src/services/storage.ts` gérant la lecture/écriture sur le système de fichiers Tauri (avec fallback `localStorage` si `window.__TAURI_INTERNALS__` est absent).
   * Créer le composable `src/composables/useBrol.ts` exposant l'état réactif, les filtres calculés (`computed`), les méthodes CRUD et les fonctions d'import/export JSON.
3. **Étape 3 — Composants UI & Layout :**
   * Construire `AppHeader.vue`, `StatusFilter.vue` et `ProspectList.vue` avec un design sombre, sobre et très lisible (palette `slate`/`zinc` de Tailwind).
4. **Étape 4 — Modales & Interactions :**
   * Implémenter `QuickAddModal.vue` (avec gestion des raccourcis clavier `Escape` pour fermer et `Ctrl+N` pour ouvrir).
   * Implémenter `ProspectDrawer.vue` avec la gestion des dates de relance rapides et l'ajout d'interactions.

## 7. Ajout de fonctionnalités v1.1

* Ajouter un système de tags aux prospects pour catégoriser les secteurs d'activité et types de projet.
* Ajouter un numéro de téléphone avec validation au format international.
* Permettre le tri par entreprise, statut et prochaine relance.
* Ajouter une adresse physique et un lien vers OpenStreetMap.
* Ajouter une page de statistiques avec compteurs, graphique linéaire des interactions, graphique circulaire des statuts, graphique des tags et carte géographique OpenStreetMap.

## 8. Modifications de fonctionnalités v1.2
1. Modification de l'interface de création du prospect pour inclure les champs supplémentaires suivants :
   * Téléphone
   * e-mail
   * Adresse physique (rue, code postal, ville, pays)
   * tags
   * Séparation de l'adresse physique pour chaque prospect en 4 champs : rue, code postal, ville, pays
2. Les boutons de modifications de status du drawer doivent être de la couleur du status correspondant

## 9. Modifications de fonctionnalités v1.3
1. Ajout d'un système de notifications pour les relances à venir et les interactions importantes.
2. Ajout d'un trim automatique pour les champs de texte afin d'éviter les espaces inutiles.
3. Ajout de la possibilité de modifier la date des notes dans l'historique.
4. Ajoute une page `A propos` avec les informations sur l'application, la version et les crédits.
   * Numéro de version.
   * Nom de l'auteur (Loïc JACQUES).
   * Lien vers le site web de l'auteur (funkyduck.be).
   * Lien vers la licence (MIT).

## 10. Modifications de fonctionnalités v1.4
1. Ajout d'un système de suggestions pour les tags et les entreprises déjà existantes dans la base de données.
2. Ajout d'un écran de confirmation avant la suppression d'un prospect ou d'une interaction.

## 11. Modifications de fonctionnalités v1.5
1. Ajout de la source du prospect dans l'ajout et la modification
2. Ajout d'une page "Calendrier" qui indique sur un planning qui doit être recontacté et quand.
3. Ajout d'une page "What's new" reprenant les nouveautés par versions
4. Ajout d'une page "Paramètres"
   - Permet de switcher entre un thème sombre, un thème clair, un thème vert, un thème bleu, un thème rouge, un thème mauve, un thème orange
   - Permet de supprimer les données (! Demander confirmation)
   - Permet de changer la langue
   - Permet d'adapter l'interface pour les personnes malvoyantes (Police + grosse)

## 12. Modifications de fonctionnalités v1.5.1
1. Fixe les nouveaux thèmes CSS, seul le thème foncé fonctionne.
2. Fais la traduction en anglais de l'app, seul le français fonctionne

## 13. GIT
- Lors de chaque itération, faire un `git add * && git commit -m '${new_version_number}' && git push`
- Si modification via le prompt sans passer par un fichier .md, le commit sera le suivant : `git commit -m '[FIX] ${fix_reason}'`
- En cas de conflit, demander quoi faire pour savoir s'il faut fusionner ou pas les fichiers

## 12. Modifications de fonctionnalités v1.5.2
1. Ajoute un thème `Peach Sorbet` : #f08080 - #f4978e - #f8ad9d - #fbc4ab - #ffdab9
2. Un thème `Paster Watecolor` : ["#b0a1ba","#a5b5bf","#abc8c7","#b8e2c8","#bff0d4"]
3. Un thème `Sunny Beach` : ["#264653","#2a9d8f","#e9c46a","#f4a261","#e76f51"]
4. Un thème `Rose Petal` : ["#880d1e","#dd2d4a","#f26a8d","#f49cbb","#cbeef3"]

## 12. Modifications de fonctionnalités v1.5.3
1. Ajouter l'autocomplétion pour le choix du pays et des villes
2. Ajouter une normalisation des tags : tout en minuscule
3. Déplacer l'importation et l'exportation dans la page paramètres
4. Lors de l'importation de données, laisser la possibilité de fusionner ou d'écraser les données
5. Déplacer le bouton "What's News" dans les paramètres.
6. Enregistrer le numéro de version utilisé. Si mise à jour/version plus récente, afficher un "What's News" pour la dernière mise à jour et puis mettre à jour le numéro de version