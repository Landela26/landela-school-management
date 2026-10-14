# Suppression et réintégration des élèves (F12)

L’API F12 permet de retirer un élève de la liste active sans effacer son enregistrement, puis de le réintégrer pendant la période de grâce configurée par l’établissement.

## Accès

Toutes les routes ci-dessous sont protégées par `auth:sanctum` et réservées aux rôles `admin` et `super_admin`. Un utilisateur non authentifié reçoit `401 Unauthorized` ; un utilisateur authentifié avec un autre rôle reçoit `403 Forbidden`.

| Méthode | Route | Description |
| --- | --- | --- |
| `DELETE` | `/api/students/{id}` | Supprimer logiquement un élève actif |
| `GET` | `/api/students/deleted` | Lister les élèves supprimés encore réintégrables |
| `POST` | `/api/students/{id}/restore` | Réintégrer un élève avant l’expiration du délai |

`{id}` est l’identifiant `id_eleve`. La route statique `/api/students/deleted` est à utiliser telle quelle.

## Période de grâce

La durée est lue dans le paramètre `student_deletion_delay_days` géré par l’API des paramètres (`GET` et `PUT /api/settings`). Sa valeur par défaut est de 30 jours. Seuls les administrateurs peuvent lire ou modifier ce paramètre.

La date d’expiration est calculée à partir de `deleted_at` :

```text
expiration = deleted_at + student_deletion_delay_days
```

Avant l’expiration, l’élève apparaît dans la liste des supprimés et peut être restauré. À partir de l’expiration (échéance incluse), il n’apparaît plus dans cette liste et sa restauration est refusée. L’API F12 ne réalise pas de suppression physique.

## Supprimer un élève

```http
DELETE /api/students/42
Accept: application/json
```

Réponse `200 OK` :

```json
{
  "success": true,
  "message": "Élève supprimé avec succès.",
  "data": {
    "id_eleve": 42,
    "matricule": "ELV00042",
    "nom": "Exemple",
    "deleted_at": "2026-10-09T12:00:00.000000Z"
  }
}
```

La suppression renseigne `deleted_at`. L’enregistrement reste en base et l’élève est exclu des requêtes ordinaires, dont `GET /api/students`.

Erreurs :

| Statut | Cas |
| --- | --- |
| `401` | Session/API non authentifiée |
| `403` | Rôle autre que `admin` ou `super_admin` |
| `404` | Identifiant inexistant ou élève déjà supprimé |

## Lister les élèves réintégrables

```http
GET /api/students/deleted?page=1&per_page=20
Accept: application/json
```

Les paramètres de pagination sont facultatifs : `page` est au minimum `1`, `per_page` est compris entre `1` et `100` (valeur par défaut : `20`). Les élèves expirés et les élèves actifs ne sont pas inclus. Les résultats sont triés par date de suppression décroissante.

Exemple de réponse `200 OK` :

```json
{
  "success": true,
  "message": "Liste des élèves supprimés récupérée avec succès.",
  "data": [
    {
      "id_eleve": 42,
      "matricule": "ELV00042",
      "nom": "Exemple",
      "deleted_at": "2026-10-09T12:00:00.000000Z",
      "classe": null
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

Lorsque la liste est vide, la réponse reste `200 OK` avec `"data": []`, des valeurs de pagination indiquant zéro résultat et le message « Aucun élève supprimé ne peut être réintégré. »

## Réintégrer un élève

```http
POST /api/students/42/restore
Accept: application/json
```

Aucun corps de requête n’est requis. En cas de succès, l’API efface `deleted_at`, conserve le même enregistrement et renvoie `200 OK` :

```json
{
  "success": true,
  "message": "Élève réintégré avec succès.",
  "data": {
    "id_eleve": 42,
    "matricule": "ELV00042",
    "nom": "Exemple",
    "deleted_at": null,
    "classe": null
  }
}
```

Erreurs :

| Statut | Cas |
| --- | --- |
| `401` | Session/API non authentifiée |
| `403` | Rôle autre que `admin` ou `super_admin` |
| `404` | Identifiant inexistant |
| `409` | Élève déjà actif, ou matricule déjà utilisé par un autre élève actif |
| `410` | Période de réintégration expirée |

Les erreurs sont retournées sous la forme `{"success": false, "message": "..."}`.

## Paramétrer le délai

Le délai de grâce peut être modifié par un administrateur en mettant à jour le paramètre F10 :

```http
PUT /api/settings
Content-Type: application/json
Accept: application/json
```

```json
{
  "student_deletion_delay_days": 45
}
```

Le délai doit être un entier supérieur ou égal à `1`. La réponse de paramètres inclut la valeur effective dans `data.student_deletion_delay_days`.
