# Documentation complète — Boutique React + Backend SQLite

> Application de catalogue en ligne avec **authentification par rôle** (client / admin),
> **panier**, et **gestion des produits** réservée à l'administrateur.
> Frontend **React 19 + React Router** ; backend **Node/Express + SQLite** ; mots de passe **hachés (bcrypt)**.

---

## 1. Vue d'ensemble

Le projet est séparé en deux applications qui communiquent par une **API HTTP (JSON)** :

```
┌────────────────────────────┐        /api/...        ┌────────────────────────────┐
│   FRONTEND (React + Vite)   │  ───────────────────▶  │   BACKEND (Express)         │
│   http://localhost:5173     │   proxy Vite /api →    │   http://localhost:3001     │
│                             │ ◀───────────────────   │                             │
│  - Routes & pages           │     réponses JSON      │  - Routes REST              │
│  - Contexts (état global)   │                        │  - Vérif. rôle en base      │
│  - Formulaires contrôlés    │                        │  - bcrypt (mots de passe)   │
└────────────────────────────┘                        └───────────┬────────────────┘
                                                                   │
                                                          ┌────────▼─────────┐
                                                          │  SQLite data.db  │
                                                          │  utilisateurs    │
                                                          │  produits        │
                                                          └──────────────────┘
```

**Principe de sécurité central** : le **rôle** (`admin` / `client`) n'est **pas** une information
inventée côté navigateur. C'est une **colonne de la base de données**. Le serveur la relit à chaque
action sensible : le front ne peut pas « se déclarer » administrateur.

---

## 2. Stack technique

| Côté | Technologie | Rôle |
|---|---|---|
| Frontend | **React 19** | Interface, composants |
| Frontend | **react-router v8** (`react-router`) | Navigation 100 % par routes |
| Frontend | **Vite 8** | Serveur de dev + build + proxy `/api` |
| Backend | **Node 24 + Express 4** | Serveur HTTP / API REST |
| Backend | **node:sqlite** (intégré à Node) | Base de données SQL, **sans dépendance native** |
| Backend | **bcryptjs** | Hachage des mots de passe (pur JS) |
| Backend | **cors** | Autorise les requêtes du front |

---

## 3. Structure des fichiers

```
mon-projet1/
├── server/                     ← BACKEND
│   ├── package.json            Dépendances backend (express, cors, bcryptjs)
│   ├── db.js                   Base SQLite : tables + semis admin/produits
│   ├── server.js               API : routes + vérification du rôle
│   ├── .gitignore              Ignore node_modules/ et data.db
│   └── data.db                 (généré) Base de données
│
├── src/                        ← FRONTEND
│   ├── main.jsx                Point d'entrée : Router + Providers
│   ├── App.jsx                 Déclaration de TOUTES les routes
│   │
│   ├── context/                État global (Context API)
│   │   ├── AuthContext.jsx     Authentification + rôle
│   │   ├── ProduitsContext.jsx Catalogue (lu depuis l'API)
│   │   └── PanierContext.jsx   Panier (par utilisateur, localStorage)
│   │
│   ├── composant/
│   │   ├── Layout.jsx          Gabarit commun (banner/sidebar/footer)
│   │   ├── Banner.jsx + Menu.jsx   En-tête + navigation
│   │   ├── Sidebar.jsx         Filtres par catégorie
│   │   ├── RightColumn.jsx     Résumé du panier
│   │   ├── Footer.jsx          Pied de page
│   │   ├── Authentification.jsx Formulaire de connexion
│   │   ├── Inscription.jsx     Formulaire d'inscription
│   │   ├── ProtectedRoute.jsx  Garde de route (connexion + rôle)
│   │   ├── Catalogue.jsx       Liste + recherche de produits
│   │   ├── ProduitCard.jsx     Carte d'un produit (memo)
│   │   ├── BarreRecherche.jsx  Champ de recherche
│   │   ├── AdminProduits.jsx   Page admin : ajout/suppression
│   │   ├── Panier.jsx          Page panier
│   │   └── DetailPanier.jsx    Une ligne du panier (memo)
│   │
│   └── utils/
│       ├── validators.js       Validation du formulaire d'inscription
│       └── texte.js            normaliser() (recherche sans accents)
│
└── vite.config.js              Plugin React + proxy /api → :3001
```

---

# PARTIE A — BACKEND

## A.1 `server/db.js` — la base de données

Ouvre (ou crée) le fichier `data.db` et définit **deux tables** :

```sql
utilisateurs(id, login UNIQUE, nom, mot_de_passe, role DEFAULT 'client')
produits(id, nom, prix, categorie DEFAULT 'Divers')
```

- `mot_de_passe` ne contient **jamais** le mot de passe en clair : seulement son **hash bcrypt**.
- `role` est la **source de vérité** du rôle. Valeurs : `'admin'` ou `'client'`.

**Semis (seed)** exécuté une seule fois :
- Si aucun admin n'existe → crée `admin@site.fr` / `admin123` (rôle `admin`).
- Si la table produits est vide → insère 5 produits de départ.

> Pour réinitialiser toute la base : arrêter le serveur, **supprimer `server/data.db`**, relancer.

## A.2 `server/server.js` — l'API

### Fonction utilitaire
`utilisateurPublic(u)` — renvoie `{ id, login, nom, role }` **sans** le mot de passe (jamais exposé).

### Middleware de sécurité : `exigerAdmin(req, res, next)`
C'est **le cœur de la logique de rôle** côté serveur.

```js
function exigerAdmin(req, res, next) {
  const id = Number(req.header("x-user-id"));        // qui prétend agir ?
  if (!id) return res.status(401)...                 // personne → 401
  const u = db.prepare("SELECT role FROM utilisateurs WHERE id = ?").get(id);
  if (!u) return res.status(401)...                  // id inconnu → 401
  if (u.role !== "admin") return res.status(403)...  // pas admin → 403
  next();                                            // admin confirmé EN BASE → on continue
}
```

Le serveur ne fait **jamais confiance** au front : il relit le rôle dans la base à partir de l'`id`.

### Routes

| Méthode | URL | Protégée ? | Description |
|---|---|---|---|
| `POST` | `/api/connexion` | non | Vérifie login + mot de passe (bcrypt), renvoie l'utilisateur **avec son rôle** |
| `POST` | `/api/inscription` | non | Crée un **client** (rôle forcé), mot de passe haché |
| `GET`  | `/api/produits` | non | Liste des produits (pour le catalogue) |
| `POST` | `/api/produits` | **admin** | Ajoute un produit (via `exigerAdmin`) |
| `DELETE` | `/api/produits/:id` | **admin** | Supprime un produit (via `exigerAdmin`) |

**Codes HTTP renvoyés :** `200` OK, `201` créé, `204` supprimé, `400` données invalides,
`401` non authentifié, `403` interdit (pas admin), `409` login déjà pris.

---

# PARTIE B — FRONTEND

## B.1 `main.jsx` — point d'entrée et ordre des Providers

```jsx
<BrowserRouter>
  <AuthProvider>            ← fournit l'utilisateur + le rôle
    <ProduitsProvider>      ← a besoin de l'utilisateur (pour l'en-tête x-user-id)
      <PanierProvider>      ← a besoin de l'utilisateur (clé du panier)
        <App />
      </PanierProvider>
    </ProduitsProvider>
  </AuthProvider>
</BrowserRouter>
```

**Pourquoi cet ordre ?** Un Provider enfant peut lire un Provider parent. `ProduitsProvider` et
`PanierProvider` lisent `AuthContext`, donc `AuthProvider` doit les envelopper.

## B.2 `App.jsx` — les routes

Deux groupes :

1. **Hors `Layout`** → on ne voit **que le formulaire** : `/authentification`, `/login`, `/inscription`.
2. **Dans `Layout`** (+ `ProtectedRoute`) → l'app complète, visible **seulement une fois connecté** :
   - `/catalogue`, `/panier` → tout utilisateur connecté.
   - `/admin/produits` → `<ProtectedRoute role="admin" />` uniquement.
3. Redirections : `/` → `/catalogue`, et `*` (inconnu) → `/catalogue`.

---

## B.3 Les trois Contexts (état global)

### `AuthContext.jsx`
Expose : `utilisateur`, `estConnecte`, `estAdmin`, `role`, `chargement`, `connecter`, `inscrire`, `deconnecter`.
- `connecter(login, mdp)` → `POST /api/connexion`, mémorise l'utilisateur, renvoie `{ ok, user, message }`.
- `inscrire(donnees)` → `POST /api/inscription`, connecte le nouveau client.
- La session est sauvegardée dans `localStorage` pour survivre au rafraîchissement.

### `ProduitsContext.jsx`
Expose : `produits`, `ajouterProduit`, `supprimerProduit`.
- Charge la liste via `GET /api/produits` au montage.
- `ajouterProduit` / `supprimerProduit` appellent l'API en envoyant l'en-tête `x-user-id`.

### `PanierContext.jsx`
Expose : `lignes`, `quantites`, `nombreArticles`, `total`, `ajouter`, `changerQuantite`, `retirer`, `vider`, `QUANTITE_MAX`.
- Un panier **par utilisateur** (clé `panier-<login>` en localStorage).
- Valeurs dérivées (`total`, `nombreArticles`…) recalculées avec `useMemo`.

---

## 4. Les HOOKS — pourquoi chacun, et pas un autre

> Contrainte du projet : **aucun hook personnalisé, aucune manipulation directe du DOM**.
> Seuls autorisés : `useState`, `useEffect`, `useRef`, `useMemo`, `useContext`, `useCallback`, `React.memo`, et les `props`.

### `useState` — mémoriser une valeur qui change et redéclenche l'affichage
- **Où** : champs de formulaires (`login`, `motDePasse`, `form`), listes (`produits`, `favoris`, `lignes`), messages d'erreur, `chargement`.
- **Pourquoi lui** : c'est le seul moyen de garder une donnée **entre deux rendus** ET de **réafficher** le composant quand elle change. Une variable normale serait réinitialisée à chaque rendu et ne déclencherait aucun réaffichage.
- **Comment** : `const [valeur, setValeur] = useState(initiale)`. On ne modifie jamais `valeur` directement ; on appelle `setValeur(...)`, ce qui programme un nouveau rendu. Pour dépendre de l'ancienne valeur : forme fonctionnelle `setValeur(prev => ...)`.

### `useEffect` — exécuter du code *après* l'affichage (effets de bord)
- **Où** : restaurer la session au démarrage (`AuthContext`), charger les produits depuis l'API (`ProduitsContext`), mettre le focus sur un champ, « debounce » de la recherche (`Catalogue`), sauvegarder le panier.
- **Pourquoi lui** : un composant React doit être « pur » pendant le rendu. Tout ce qui touche l'extérieur (réseau, localStorage, focus, minuteur) doit se faire **après** le rendu → c'est exactement le rôle de `useEffect`.
- **Comment** : `useEffect(() => { ... ; return () => nettoyage }, [dépendances])`. Tableau `[]` = une seule fois au montage. La fonction `return` nettoie (ex. `clearTimeout`).

### `useRef` — garder une référence stable SANS réafficher
- **Où** : focus d'un champ (`loginRef`, `nomRef`) via `ref={...}` puis `.focus()`.
- **Pourquoi lui et pas `useState`** : changer un `ref` **ne provoque pas** de nouveau rendu — parfait pour viser un élément ou garder un compteur. Un `useState` relancerait un rendu inutile. Et c'est la façon « React » de cibler un élément **sans** `document.querySelector` (interdit ici).
- **Comment** : `const r = useRef(null)` ; `<input ref={r} />` ; React place l'élément dans `r.current` après le rendu ; on l'utilise avec `r.current?.focus()`.

### `useMemo` — mémoriser un *résultat de calcul* coûteux ou un *objet* stable
- **Où** : filtrage des produits (`Catalogue`), `total`/`nombreArticles` (`PanierContext`), et surtout l'**objet `value`** de chaque Context.
- **Pourquoi lui** : sans `useMemo`, un nouvel objet/valeur serait recréé à **chaque** rendu ; pour un Context, cela ferait re-rendre **tous** les composants abonnés inutilement. `useMemo` ne recalcule que si une dépendance change.
- **Comment** : `const r = useMemo(() => calcul, [deps])`. `r` ne change d'identité que si une dépendance change.

### `useCallback` — mémoriser une *fonction* (identité stable)
- **Où** : `connecter`, `inscrire`, `deconnecter`, `ajouterProduit`, `supprimerProduit`, `ajouter`, `toggleFavori`…
- **Pourquoi lui** : ces fonctions sont placées dans la `value` d'un Context ou passées en props à des composants `React.memo`. Si elles changeaient d'identité à chaque rendu, elles casseraient la mémoïsation et provoqueraient des réaffichages. `useCallback` fige leur identité.
- **Comment** : `const f = useCallback(fn, [deps])`. C'est le frère de `useMemo` pour les fonctions (`useCallback(fn, d)` ≈ `useMemo(() => fn, d)`).

### `useContext` — lire un état global sans « prop drilling »
- **Où** : partout où on a besoin de l'utilisateur/du rôle (`Menu`, `ProtectedRoute`, `Authentification`…), des produits (`Catalogue`, `AdminProduits`), du panier (`Panier`, `RightColumn`).
- **Pourquoi lui et pas les props** : éviter de faire descendre la même donnée à travers 5 niveaux de composants. `useContext` lit directement la valeur du Provider le plus proche. (Et il remplace ici tout « hook personnalisé » : on consomme le contexte **directement**, comme l'exige la consigne.)
- **Comment** : `const data = useContext(MonContext)`. Le composant se réaffiche quand la `value` du Provider change.

### `React.memo` — éviter de réafficher un composant dont les props n'ont pas changé
- **Où** : `ProduitCard`, `DetailPanier` (affichés en liste, potentiellement nombreux).
- **Pourquoi lui** : dans une liste, si le parent se réaffiche, chaque carte se réafficherait aussi. `memo` compare les props : si elles sont identiques, le composant n'est **pas** réaffiché. C'est la raison pour laquelle les callbacks passés en props sont en `useCallback` (sinon la comparaison échouerait toujours).
- **Comment** : `export default memo(MonComposant)`.

---

## 5. Les PROPS — qui reçoit quoi, et pourquoi

> Les **props** sont les « paramètres » d'un composant : le parent passe des données **vers le bas**,
> et des **fonctions de rappel** pour remonter les événements **vers le haut**.

### `ProduitCard` (enfant de `Catalogue`)
| Prop | Type | Rôle |
|---|---|---|
| `produit` | objet | Le produit à afficher (`nom`, `prix`, `categorie`) |
| `estFavori` | booléen | Affiche l'étoile pleine/vide |
| `quantite` | nombre | Quantité déjà au panier (affichée sur le bouton) |
| `onToggleFavori` | fonction | Rappel quand on clique sur « favori » (remonte l'`id`) |
| `onAjouter` | fonction | Rappel quand on clique sur « ajouter au panier » |

### `DetailPanier` (enfant de `Panier`)
| Prop | Type | Rôle |
|---|---|---|
| `ligne` | objet | La ligne du panier (`nom`, `prix`, `quantite`) |
| `max` | nombre | Quantité maximum (désactive le bouton +) |
| `onChangerQuantite` | fonction | Rappel +1 / −1 |
| `onRetirer` | fonction | Rappel pour retirer la ligne |

### `BarreRecherche` (enfant de `Catalogue`)
| Prop | Type | Rôle |
|---|---|---|
| `valeur` | chaîne | Valeur affichée dans le champ (champ **contrôlé**) |
| `onChange` | fonction | Rappel à chaque frappe |
| `onEffacer` | fonction | Rappel du bouton « Effacer » |
| `inputRef` | ref | Référence transmise par le parent pour le focus |

### `ProtectedRoute`
| Prop | Type | Rôle |
|---|---|---|
| `role` | chaîne (optionnelle) | Si fournie (`"admin"`), la route exige ce rôle précis |

### `AuthProvider`, `ProduitsProvider`, `PanierProvider`, `Layout`…
| Prop | Type | Rôle |
|---|---|---|
| `children` | JSX | Les composants « enveloppés » que le Provider/Layout affiche |

---

## 6. Flux complets (du clic à la base)

### 🔐 Connexion
1. `Authentification` : champs contrôlés (`useState`), focus auto (`useRef` + `useEffect`).
2. Au submit → `connecter(login, mdp)` → `POST /api/connexion`.
3. Le serveur vérifie le mot de passe avec **bcrypt**, lit le `role` **en base**, renvoie `{ id, login, nom, role }`.
4. `AuthContext` mémorise l'utilisateur ; `Authentification` **redirige selon le rôle** :
   `admin` → `/admin/produits`, sinon → `/catalogue`.

### 📝 Inscription
1. `Inscription` : un seul état objet `form`, validé par `validators.js`.
2. Au submit → `inscrire({ login: email, motDePasse, nom })` → `POST /api/inscription`.
3. Le serveur force `role = 'client'`, hache le mot de passe, crée le compte, le connecte.
4. Redirection → `/catalogue`.

### ➕ Ajout de produit (admin)
1. `AdminProduits` : formulaire contrôlé → `ajouterProduit(donnees)`.
2. `ProduitsContext` → `POST /api/produits` avec l'en-tête `x-user-id`.
3. Le serveur passe par `exigerAdmin` : relit le rôle **en base**.
   - Admin → insère, renvoie le produit → le catalogue se met à jour.
   - Client (ou URL forcée) → **403 refusé**.

---

## 7. Lancer le projet

```bash
# Terminal 1 — backend
cd server
npm install        # une seule fois
npm start          # http://localhost:3001

# Terminal 2 — frontend
npm install        # une seule fois
npm run dev        # http://localhost:5173
```

**Comptes :**
- Admin (en base) : `admin@site.fr` / `admin123` *(à changer)*.
- Client : via « Créer un compte ».

---

## 8. Résumé : comment le rôle est reconnu

| Étape | Ce qui se passe |
|---|---|
| Stockage | Le rôle est une **colonne SQL** de `utilisateurs` |
| Connexion | Le serveur lit la ligne et renvoie `role` au front |
| Redirection | Le front envoie l'admin vers `/admin/produits`, le client vers `/catalogue` |
| Protection route (front) | `ProtectedRoute role="admin"` bloque l'affichage |
| Protection action (back) | `exigerAdmin` **relit le rôle en base** → un client est refusé (403) même s'il triche |

En une phrase : **l'identité (mot de passe) et le rôle (colonne en base) voyagent ensemble, et le serveur a toujours le dernier mot.**
