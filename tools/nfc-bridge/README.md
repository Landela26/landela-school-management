# Pont NFC LANDELA

Petit programme Python qui lit les cartes posées sur un lecteur NFC USB (testé avec l'**ACS ACR122U**) et envoie chaque badge à l'API, exactement comme le fera le terminal de pointage :

```
Carte → Lecteur USB → nfc_bridge.py → POST /api/nfc/scan { uid } → API Laravel → base → interface
```

Il sert à tester le **pointage automatique de bout en bout**, et de **référence de comportement** pour le terminal de pointage : mêmes requêtes, mêmes réactions aux réponses de l'API.

## Comportement de référence (à reproduire dans le terminal)

### Requête envoyée à chaque badge
```http
POST /api/nfc/scan
Authorization: Bearer <clé d'accès>
Accept: application/json
Content-Type: application/json

{ "uid": "048B5772FA1D90", "status": "present" }
```
- **UID** : hexadécimal majuscule, sans espace ni `:` (le pont normalise ce qu'il lit).
- `status` est encore exigé par l'API. Le serveur le transforme en `retard` après l'heure limite (`late_after`, réglable dans Paramètres).
- Une carte laissée sur le lecteur n'est envoyée **qu'une fois**. Il faut la retirer puis la reposer pour la renvoyer.
- Délai d'attente de la réponse : 5 secondes par défaut.

### Réaction à la réponse
D'après le diagramme d'activité « Pointage par carte NFC » :

| Réponse de l'API | Écran | Voyant | Bips |
|---|---|---|---|
| `201`, `statut_presence = present` | **À L'HEURE** + nom (classe) | vert | 1 |
| `201`, `statut_presence = retard` | **RETARD** + nom (classe) | orange | 2 |
| `201`, `statut_presence = absent` | **ABSENT** + nom (classe) | rouge | 3 |
| `404` | **CARTE INCONNUE** | rouge | 3 |
| `409` | **DÉJÀ ENREGISTRÉ** | rouge | 3 |
| `401` | **CLÉ REFUSÉE** (clé invalide ou expirée) | rouge | 3 |
| `422` | **REQUÊTE REFUSÉE** + premier message d'erreur | rouge | 3 |
| Pas de réponse (serveur éteint, réseau coupé, délai dépassé) | **SERVEUR INJOIGNABLE** | rouge | 3 |
| Autre code (`500`…) | **ERREUR SERVEUR (code)** | rouge | 3 |

Le signal est envoyé **directement au lecteur**, après la réponse : il fonctionne même si la carte a déjà été retirée. Pendant que le pont tourne, le bip automatique du lecteur à la détection est coupé, pour éviter un bip de trop. Il est rétabli à l'arrêt (Ctrl+C).

## Installation

- **Python 3.9 ou plus récent.** Aucune bibliothèque à installer sous Windows : le lecteur est piloté par `winscard.dll`, fourni avec Windows.
- **Linux, Raspberry Pi, macOS** : installer `pyscard` (`pip install pyscard`) et le service `pcscd`. Le pont utilise automatiquement `pyscard` s'il est présent.
- **Lecteur** : brancher l'ACR122U. Windows l'installe tout seul.

## Configuration

1. Copier `config.example.ini` en `config.ini`. Ce fichier n'est jamais commité : il contient la clé.
2. Créer une **clé d'accès** (jeton Sanctum) pour l'administrateur, depuis le dossier `backend` :
   ```bash
   php artisan tinker --execute="echo App\Models\Utilisateur::where('username','admin')->first()->createToken('pont-nfc')->plainTextToken;"
   ```
3. Coller la clé affichée dans `config.ini`, à la ligne `cle =`. Ne pas la partager dans le chat ni dans Git.

On peut aussi passer par les variables d'environnement `LANDELA_API_URL` et `LANDELA_CLE`.

> En production, le terminal devra avoir **sa propre clé, limitée au pointage**, et pas un jeton administrateur. C'est à prévoir côté back.

## Utilisation

Depuis `tools/nfc-bridge` :

| Commande | Effet |
|---|---|
| `python nfc_bridge.py --verifier` | Vérifie le lecteur, la carte posée, le serveur et la clé |
| `python nfc_bridge.py` | **Pointage réel** : attend les cartes et les envoie à l'API |
| `python nfc_bridge.py --uid 048B5772FA1D90` | **Sans lecteur** : simule le badge de cette carte (plusieurs UID possibles) |
| `python nfc_bridge.py --sans-signal` | Pointage sans piloter le voyant ni le buzzer |
| `python nfc_bridge.py --api http://192.168.1.10:8000/api` | Utilise un autre serveur |

Exemple de sortie :
```
Lecteur : ACS ACR122 0
Serveur : http://127.0.0.1:8000/api
Posez une carte (Ctrl+C pour arrêter)…
[14:31:33] 04A5803AC31D90       RETARD               Mukendi Ilunga Grace (6ème A)
[14:32:06] 048B5772FA1D90       DÉJÀ ENREGISTRÉ      Cet élève a déjà été pointé aujourd’hui.
[14:26:19] 04302192741190       CARTE INCONNUE       Carte NFC invalide ou inactive.
```

## Cartes de test

Ce sont les cartes réelles de `CarteNfcSeeder` (voir `backend/database/seeders`). La carte `04302192741190` n'est volontairement pas enregistrée : elle sert à tester une carte inconnue.

## Dépannage

| Message | Cause probable |
|---|---|
| `Aucun lecteur NFC branché` | Lecteur débranché, ou pilote pas encore installé |
| `Service « Carte à puce » indisponible` | Service Windows « Carte à puce » (SCardSvr) arrêté |
| `SERVEUR INJOIGNABLE` | `php artisan serve` pas lancé, mauvaise adresse, pare-feu |
| `CLÉ REFUSÉE` | Clé absente, invalide ou supprimée : en créer une nouvelle |
| Pas de bip ni de voyant | Lecteur qui n'accepte pas les commandes directes : le pont l'annonce au démarrage et affiche seulement le résultat |
