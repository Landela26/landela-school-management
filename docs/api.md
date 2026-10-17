# Documentation de l’API Landela

Cette documentation décrit les routes présentes dans `backend/routes/api.php`, les champs acceptés par leurs validations et les structures de réponse produites par les contrôleurs. Les exemples sont illustratifs : les identifiants, dates et valeurs dépendent des données de la base.

Le guide détaillé de suppression et de réintégration des élèves est dans [student-deletion-api.md](./student-deletion-api.md).

## 1. Informations générales

- Base locale par défaut : `http://localhost:8000/api`
- Le préfixe `/api` est ajouté par Laravel.
- Les réponses sont en JSON. Envoyer `Accept: application/json` pour demander explicitement ce format.
- Les requêtes JSON doivent envoyer `Content-Type: application/json`.
- L’authentification passe par les cookies de session Laravel/Sanctum.
- Les routes protégées requièrent un utilisateur authentifié. Certaines routes exigent aussi un rôle administrateur, précisé dans leur section.

### Contrat commun d’erreur

Les erreurs de validation Laravel renvoient `422 Unprocessable Entity` :

```json
{
  "success": false,
  "message": "Les données fournies sont invalides.",
  "errors": {
    "email": [
      "L’adresse email n’est pas valide."
    ]
  }
}
```

`errors` est un objet indexé par nom de champ. Une propriété peut contenir un ou plusieurs messages. L’endpoint de connexion est une exception : il renvoie la première erreur de chaque champ sous forme de chaîne.

Une session absente ou invalide sur une route protégée renvoie `401` :

```json
{
  "success": false,
  "message": "Utilisateur non authentifié."
}
```

Les erreurs métier produites par les contrôleurs ont généralement `success: false` et `message`. Elles peuvent ne pas avoir de clé `data` ou `errors`.

### Pagination

Les réponses paginées ont cette structure :

```json
{
  "success": true,
  "message": "…",
  "data": [],
  "pagination": {
    "page_courante": 1,
    "derniere_page": 1,
    "par_page": 20,
    "total": 0,
    "de": null,
    "a": null
  }
}
```

`de` et `a` sont `null` lorsque la liste est vide. Les valeurs renvoyées et le traitement d’une page hors limites sont décrits avec chaque endpoint, car ils ne sont pas entièrement uniformes.

## 2. Authentification et session

### Initialiser la session web (SPA)

Avant la connexion depuis le frontend, demander le cookie CSRF :

```http
GET http://localhost:8000/sanctum/csrf-cookie
```

Conserver les cookies de session et CSRF, puis envoyer le cookie et l’en-tête `X-XSRF-TOKEN` pour les requêtes mutatives, notamment depuis une SPA sur un autre port/origine. Le frontend utilise `withCredentials` et `withXSRFToken`.

### `POST /auth/login`

Requête :

```json
{
  "email": "admin@example.test",
  "password": "mot-de-passe"
}
```

| Champ | Type | Obligatoire | Règles |
| --- | --- | --- | --- |
| `email` | string | oui | Adresse e-mail valide |
| `password` | string | oui | Chaîne |

Réponse `200` :

```json
{
  "success": true,
  "message": "Connexion réussie.",
  "data": {
    "user": {
      "id_utilisateur": 1,
      "username": "admin",
      "email": "admin@example.test",
      "role": "admin"
    }
  }
}
```

Identifiants incorrects : `401`, `{"success":false,"message":"Email ou mot de passe incorrect."}`. Une validation incorrecte renvoie `422` et des erreurs indexées par champ en chaînes, par exemple `"email": "L’adresse email est obligatoire."`.

### `GET /auth/me`

Retourne l’utilisateur connecté. Réponse `200` :

```json
{
  "success": true,
  "message": "Informations de l’utilisateur récupérées avec succès.",
  "data": {
    "id_utilisateur": 1,
    "username": "admin",
    "email": "admin@example.test",
    "role": "admin",
    "actif": true
  }
}
```

### `POST /auth/logout`

Aucun corps requis. Invalide la session et renouvelle le jeton CSRF. Réponse `200` :

```json
{
  "success": true,
  "message": "Déconnexion réussie."
}
```

## 3. Tableau de bord

### `GET /dashboard`

Authentification requise. Aucun paramètre ni corps.

Réponse `200` :

```json
{
  "success": true,
  "message": "Données du tableau de bord récupérées avec succès.",
  "data": {
    "indicateurs_generaux": {
      "total_eleves": 120,
      "eleves_actifs": 115,
      "taux_assiduite": 82
    },
    "pointage_du_jour": {
      "presents": 90,
      "retards": 5,
      "absents": 2
    },
    "pointage_par_classe": [
      {
        "id_classe": 3,
        "nom_classe": "6ème A",
        "total_eleves": 35,
        "eleves_pointes": 30
      }
    ]
  }
}
```

`taux_assiduite` est un entier arrondi basé sur les élèves actifs et les présences marquées `present`. Les statistiques du jour suivent la date du serveur. Une erreur interne renvoie `500` avec `success: false`, un message générique et `data: null`.

## 4. Élèves

Toutes les routes élèves exigent une authentification. Les opérations F12 de suppression, liste des supprimés et restauration sont en plus réservées aux rôles `admin` et `super_admin`.

### Champs d’un élève

Les noms de champs du corps d’écriture et ceux du modèle en réponse diffèrent pour la date :

| Champ de requête | Type | Règles |
| --- | --- | --- |
| `matricule` | string ou `null` | Facultatif, maximum 50 caractères, unique parmi les élèves non supprimés |
| `classe_id` | entier ou `null` | Facultatif; la classe doit exister |
| `nom` | string | Obligatoire, maximum 255 caractères |
| `postnom` | string | Obligatoire, maximum 255 caractères |
| `prenom` | string | Obligatoire, maximum 50 caractères |
| `sexe` | string | Obligatoire, `M` ou `F` |
| `dateNaissance` | date | Obligatoire, antérieure à aujourd’hui |
| `adresse` | string | Obligatoire, maximum 255 caractères |
| `photo` | fichier image | Facultatif, JPG/JPEG/PNG/WEBP, maximum 2 Mo |

La réponse sérialisée du modèle utilise notamment `id_eleve`, `classe_id`, `date_naissance`, `date_creation`, `deleted_at` et `photo`. La photo est stockée sur le disque public sous `eleves/…`. Une valeur `classe_id` vide peut être envoyée comme `null`.

### `GET /students`

Paramètres query disponibles :

| Paramètre | Règle de recherche |
| --- | --- |
| `search` | Recherche partielle sur nom, postnom, prénom et matricule |
| `nom` | Alias de secours de `search` si `search` n’est pas fourni |
| `postnom` | Recherche partielle |
| `prenom` | Recherche partielle |
| `matricule` | Recherche partielle |
| `sexe` | Correspondance exacte |
| `dateNaissance` | Correspondance sur la date de naissance |
| `adresse` | Recherche partielle |
| `statut` | Correspondance exacte |
| `page` | Page demandée, minimum effectif `1` |
| `per_page` | Nombre par page, défaut `20`, borné de `1` à `100` |

`search` découpe le texte en termes : chaque terme doit correspondre à au moins un des quatre champs de recherche. L’ordre est `id_eleve` décroissant. Les élèves supprimés logiquement sont omis. Une page demandée au-delà de la dernière page est ramenée à la dernière page. Les paramètres de filtre ne font pas l’objet d’une validation dédiée.

Réponse `200` : enveloppe paginée `success`, `message`, `data` (élèves avec la relation `classe`) et `pagination`. Une liste vide reste `200`, avec `data: []`, `total: 0`, et `de`/`a` à `null`.

### `POST /students`

Crée un élève actif. Envoyer les mêmes champs requis que le tableau ci-dessus.

Avec photo, utiliser `multipart/form-data`. Sans photo, JSON est possible. Exemple JSON :

```json
{
  "matricule": "ELV00042",
  "classe_id": 3,
  "nom": "Exemple",
  "postnom": "Test",
  "prenom": "Amina",
  "sexe": "F",
  "dateNaissance": "2014-05-12",
  "adresse": "Kinshasa"
}
```

Réponse `201` :

```json
{
  "success": true,
  "message": "Élève créé avec succès.",
  "data": {
    "id_eleve": 42,
    "matricule": "ELV00042",
    "classe_id": 3,
    "nom": "Exemple",
    "postnom": "Test",
    "prenom": "Amina",
    "sexe": "F",
    "date_naissance": "2014-05-12T00:00:00.000000Z",
    "adresse": "Kinshasa",
    "photo": null,
    "statut": "actif",
    "date_creation": "2026-10-14T12:00:00.000000Z",
    "deleted_at": null
  }
}
```

### `GET /students/{id}`

Retourne l’élève actif correspondant à `id_eleve`. Réponse `200` : `{"success":true,"message":"Élève récupéré avec succès.","data":{…élève…}}`. Élève inexistant ou supprimé : `404`, `{"success":false,"message":"Élève non trouvé."}`.

### `PUT /students/{id}` — mettre à jour

Les règles de champs sont les mêmes que pour la création, sauf `matricule` peut conserver le matricule de cet élève. Dans la validation, les champs principaux (`nom`, `postnom`, `prenom`, `sexe`, `dateNaissance`, `adresse`) restent obligatoires : ce n’est donc pas une mise à jour partielle de ces propriétés. `classe_id` et `matricule` peuvent être omis ou mis à `null`.

Pour un corps JSON, envoyer `PUT /students/{id}`. Pour une photo `multipart/form-data`, PHP ne parse pas toujours le corps d’un PUT : utiliser `POST /students/{id}` avec `_method=PUT` dans le formulaire multipart. Exemple :

```text
_method=PUT
nom=Exemple
postnom=Test
prenom=Amina
sexe=F
dateNaissance=2014-05-12
adresse=Kinshasa
classe_id=3
```

Réponse `200` : `{"success":true,"message":"Élève modifié avec succès.","data":{…élève…}}`. ID inexistant/supprimé : `404`.

### F12 : suppression logique, liste et restauration

| Méthode | Route | Description |
| --- | --- | --- |
| `DELETE` | `/students/{id}` | Soft-delete d’un élève |
| `GET` | `/students/deleted` | Liste des élèves supprimés encore réintégrables |
| `POST` | `/students/{id}/restore` | Restaure l’élève; corps vide |

Les réponses complètes, les codes `404`, `409`, `410`, la pagination et le délai de grâce configurable sont décrits dans [student-deletion-api.md](./student-deletion-api.md). Les trois opérations sont limitées à `admin` et `super_admin`.

## 5. Classes

Toutes les routes exigent une authentification. Aucun contrôle de rôle particulier n’est fait dans ces contrôleurs.

### Champs de création

| Champ | Type | Règles |
| --- | --- | --- |
| `code_classe` | string | Obligatoire, maximum 255 caractères |
| `id_enseignant` | entier | Obligatoire; doit référencer un personnel avec `estEnseignant=true` |
| `nom_classe` | string | Obligatoire, maximum 255 caractères |
| `niveau` | string | Obligatoire, maximum 50 caractères |
| `annee_scolaire` | string | Obligatoire, format `YYYY-YYYY` (ex. `2026-2027`) |
| `id_classe_parent` | entier ou `null` | Facultatif; si fourni, la classe parent doit exister |

### `GET /classes`

Retourne toutes les classes non supprimées, avec la relation `enseignant`. Réponse `200` :

```json
{
  "success": true,
  "data": [
    {
      "id_classe": 3,
      "code_classe": "6A-2026",
      "id_enseignant": 5,
      "nom_classe": "6ème A",
      "niveau": "6ème",
      "annee_scolaire": "2026-2027",
      "id_classe_parent": null,
      "statut": "active",
      "enseignant": {
        "id_personnel": 5,
        "nom": "Exemple"
      }
    }
  ]
}
```

La liste n’est pas paginée.

### `GET /classes/{id}`

Réponse `200` : `{"success":true,"data":{…classe avec enseignant…}}`. Classe inconnue ou supprimée : `404`, `{"success":false,"message":"Classe non trouvée."}`.

### `POST /classes`

Corps : les champs de création ci-dessus. `statut` est créé à `active` et `date_creation` est généré par le serveur; ne pas les fournir.

Réponse `201` :

```json
{
  "success": true,
  "message": "Classe créée avec succès.",
  "data": {
    "id_classe": 3,
    "code_classe": "6A-2026",
    "id_enseignant": 5,
    "nom_classe": "6ème A",
    "niveau": "6ème",
    "annee_scolaire": "2026-2027",
    "id_classe_parent": null,
    "statut": "active"
  }
}
```

### `PUT /classes/{id}`

Mise à jour partielle permise. Chaque propriété fournie devient obligatoire et doit respecter les règles de création. Champs supplémentaires acceptés en mise à jour :

- `statut` : `active`, `fusionnee` ou `supprimee`.
- `id_classe_parent` peut être `null`, mais ne peut pas désigner la classe elle-même.

Réponse `200` : `{"success":true,"message":"Classe modifiée avec succès.","data":{…classe…}}`. Classe inconnue : `404`.

### `DELETE /classes/{id}`

Effectue une suppression logique (le modèle utilise `SoftDeletes`). Réponse `200` :

```json
{
  "success": true,
  "message": "Classe supprimée avec succès."
}
```

Classe inconnue ou déjà supprimée : `404`.

## 6. Présences et pointages NFC

Toutes les routes exigent une authentification. Les statuts possibles sont `present`, `absent`, `retard`.

### `GET /attendances`

Paramètres query :

| Paramètre | Type | Validation |
| --- | --- | --- |
| `date` | date | `YYYY-MM-DD` |
| `class_id` | entier | ID existant dans `classes` |
| `classe` | string | Nom exact d’une classe existante |
| `statut` | string | `present`, `absent` ou `retard` |
| `page` | entier | minimum `1`, défaut `1` |
| `per_page` | entier | de `1` à `100`, défaut `20` |

`class_id` est préférable à `classe`. Si les deux sont fournis, le filtre par ID est utilisé. Le résultat est trié par date/heure puis ID décroissants.

Réponse `200` :

```json
{
  "success": true,
  "message": "Historique des présences récupéré avec succès.",
  "data": [
    {
      "id_presence": 8,
      "id_eleve": 42,
      "nom_eleve_snapshot": "Exemple Test Amina",
      "classe_snapshot": "6ème A",
      "statut_presence": "present",
      "date_heure": "2026-10-14T07:45:00+00:00",
      "source_pointage": "manuel",
      "id": 8,
      "eleve_id": 42,
      "eleve": "Exemple Test Amina",
      "date": "2026-10-14",
      "heure": "07:45:00",
      "statut": "present",
      "classe_id": 3,
      "classe": "6ème A",
      "source": "manuel",
      "remarque": null
    }
  ],
  "pagination": {
    "page_courante": 1,
    "derniere_page": 1,
    "par_page": 20,
    "total": 1,
    "de": 1,
    "a": 1
  }
}
```

Les clés doublées (`id`/`id_presence`, `statut`/`statut_presence`, etc.) sont présentes dans la réponse actuelle pour compatibilité. Une liste vide renvoie `200`, `data: []` et une pagination avec `total: 0`, `de: null`, `a: null`.

### `POST /attendances` — pointage manuel

Corps JSON :

```json
{
  "student_id": 42,
  "status": "present",
  "heure": "2026-10-14 07:45:00",
  "remarque": "Arrivé à l'entrée principale"
}
```

| Champ canonique | Type | Obligatoire | Aliases acceptés |
| --- | --- | --- | --- |
| `student_id` | entier d’élève existant | oui | `eleve_id`, `id_eleve` |
| `status` | string | oui | `statut`, `statut_presence` |
| `heure` | string | non | `time`, `heure_pointage` |
| `remarque` | string ou `null` | non | — |

`remarque` ne peut dépasser 255 caractères. Si `heure` est omise, la date/heure du serveur est utilisée. Le format recommandé est `YYYY-MM-DD HH:mm:ss`. Un seul pointage par élève et par jour est permis.

Si `status` est `present`, l’heure de seuil `late_after` des paramètres d’établissement s’applique : à partir de cette heure incluse, le statut enregistré devient `retard`. `absent` et `retard` restent inchangés.

Réponse `201` : `{"success":true,"message":"Présence enregistrée avec succès.","data":{…présence…,"attribution":{…}|null}}`. Le modèle de présence comporte notamment `id_presence`, `id_attribution`, `id_eleve`, `date_heure`, `statut_presence`, `nom_eleve_snapshot`, `classe_snapshot`, `source_pointage`, `snapshot` et `remarque`.

Erreurs : `422` si `student_id` ne correspond pas à un élève existant; `409` si l’élève a déjà un pointage ce jour-là. Un élève soft-deleted peut satisfaire la validation SQL `exists`, puis être introuvable pour la recherche Eloquent et provoquer `404`.

### `GET /nfc/cards`

Réponse `200` :

```json
{
  "success": true,
  "message": "Liste des cartes NFC récupérée avec succès.",
  "data": [
    {
      "id": 9,
      "uid": "04A1B2C3",
      "numero": "CARD-009",
      "statut": "actif"
    }
  ]
}
```

La liste inclut les cartes de tous statuts et n’est pas paginée.

### `GET /nfc/cards/{uid}/verify`

Encodez le `uid` dans l’URL si nécessaire. Réponse `200` dans les deux cas :

```json
{
  "success": true,
  "message": "Vérification de la carte NFC effectuée.",
  "data": true
}
```

`data` vaut `true` uniquement si la carte est active et possède une attribution active à un élève actif; sinon `false`. Une carte invalide ne produit pas ici un code HTTP `404`.

### `POST /nfc/scan`

Corps JSON :

```json
{
  "uid": "04A1B2C3",
  "status": "present",
  "heure": "2026-10-14 07:45:00",
  "remarque": null
}
```

`uid` (string, obligatoire, maximum 255) accepte aussi l’alias `badge_uid`. `status` accepte aussi `statut` et `statut_presence`; valeurs : `present`, `absent`, `retard`. `remarque` est facultative et limitée à 255 caractères. L’heure est facultative et suit les mêmes règles que le pointage manuel.

Réponse `201` : `{"success":true,"message":"Pointage NFC enregistré avec succès.","data":{…présence…,"attribution":{…}}}`. Carte invalide/inactive/non attribuée à un élève actif : `404` et `"message":"Carte NFC invalide ou inactive."`. Pointage déjà enregistré ce jour : `409`.

## 7. Paramètres de l’établissement

Les deux routes sont réservées à `admin` et `super_admin`. Un autre rôle reçoit `403` :

```json
{
  "success": false,
  "message": "Accès réservé aux administrateurs."
}
```

### `GET /settings`

Réponse `200` :

```json
{
  "success": true,
  "message": "Paramètres récupérés avec succès.",
  "data": {
    "late_after": "08:00",
    "student_deletion_delay_days": 30
  }
}
```

Valeurs par défaut : `late_after` depuis `ATTENDANCE_LATE_AFTER` (défaut `08:00`) et `student_deletion_delay_days` à `30`.

### `PUT /settings`

Corps JSON; au moins un des champs doit être renseigné :

```json
{
  "late_after": "08:30",
  "student_deletion_delay_days": 45
}
```

| Champ | Validation |
| --- | --- |
| `late_after` | Format strict `HH:MM` |
| `student_deletion_delay_days` | Entier supérieur ou égal à `1` |

Les deux champs peuvent être envoyés ensemble ou individuellement. Le service ne modifie que les champs validés reçus. Réponse `200` : même structure que `GET /settings`, avec le message `"Paramètres mis à jour avec succès."`.

## 8. Personnel

Toutes les routes de cette section exigent une authentification.

### `GET /personnels`

Sans filtre, retourne la liste non paginée. Avec `?role=enseignant`, ne retourne que les personnels avec `estEnseignant=true`. Les autres valeurs de `role` n’ajoutent pas de filtre.

```json
{
  "success": true,
  "message": "Liste des personnels récupérée avec succès.",
  "data": [
    {
      "id_personnel": 5,
      "matricule": "PERS0005",
      "nom": "Exemple",
      "prenom": "Jean",
      "estEnseignant": true
    }
  ]
}
```

### `GET /personnels/{id}`

Réponse `200` : `{"success":true,"message":"Détails du personnel récupérés avec succès.","data":{…personnel…}}`. Personnel inconnu : `404`, `{"success":false,"message":"Personnel non trouvé."}`.

### Routes non implémentées

`POST /personnels`, `PUT /personnels/{id}` et `DELETE /personnels/{id}` existent dans le fichier de routes, mais les méthodes correspondantes du contrôleur ne contiennent encore aucune logique. Aucun format de payload/réponse CRUD n’est donc défini. Ne pas utiliser ces routes pour valider la création, la modification ou la suppression d’un personnel avant l’implémentation du backend.

## 9. Scénarios de test recommandés

1. Lancer le backend : `cd backend` puis `php artisan serve`.
2. Dans les tests d’intégration, utiliser `Accept: application/json` et les helpers Laravel `actingAs(...)` / `postJson(...)` afin d’éviter la gestion navigateur des cookies.
3. Connexion réelle SPA : appeler `/sanctum/csrf-cookie`, conserver les cookies, puis appeler `/api/auth/login`; conserver ensuite la session pour les autres routes.
4. Pour chaque route protégée, tester au minimum `401` non authentifié. Pour `/settings` et les routes F12, tester également un utilisateur authentifié non administrateur (`403`).
5. Pour les payloads validés, vérifier un cas valide, un champ obligatoire absent (`422`) et chaque règle métier importante (unicité, ID inexistant, statut invalide, date future).
6. Pour tester les changements de date/délai, utiliser le voyage temporel Laravel (`travelTo`) et réinitialiser les paramètres de test après le scénario.

Exécuter les tests backend :

```bash
cd backend
php artisan test
```

Les tests feature existants les plus proches couvrent la suppression/restauration des élèves, les autorisations et le classement des retards.

## 10. Inventaire des routes

| Méthode | Route | Authentification | Fonction |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Non | Connexion |
| `GET` | `/auth/me` | Oui | Utilisateur courant |
| `POST` | `/auth/logout` | Oui | Déconnexion |
| `GET` | `/dashboard` | Oui | Statistiques |
| `GET`, `POST` | `/students` | Oui | Liste et création d’élèves |
| `GET` | `/students/deleted` | Oui + admin | Élèves supprimés récupérables |
| `GET`, `PUT`, `DELETE` | `/students/{id}` | Oui | Détail, modification et suppression |
| `POST` | `/students/{id}/restore` | Oui + admin | Réintégration |
| `GET`, `POST` | `/attendances` | Oui | Historique et pointage manuel |
| `GET` | `/nfc/cards` | Oui | Liste des cartes |
| `GET` | `/nfc/cards/{uid}/verify` | Oui | Vérification d’un badge |
| `POST` | `/nfc/scan` | Oui | Pointage NFC |
| `GET`, `POST` | `/classes` | Oui | Liste et création de classes |
| `GET`, `PUT`, `DELETE` | `/classes/{id}` | Oui | Détail, modification et suppression |
| `GET`, `POST` | `/personnels` | Oui | Liste; création non implémentée |
| `GET`, `PUT`, `DELETE` | `/personnels/{id}` | Oui | Détail; modification/suppression non implémentées |
| `GET`, `PUT` | `/settings` | Oui + admin | Lecture et mise à jour des paramètres |

`/api` est le préfixe de déploiement Laravel; il ne fait pas partie de la valeur de route dans le tableau.
