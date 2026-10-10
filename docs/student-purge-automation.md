# Purge automatique des élèves expirés (F13)

## Commande Artisan

La purge définitive des élèves supprimés logiquement dont la période de grâce est expirée se déclenche via la commande :

```bash
php artisan students:purge-expired
```

La commande lit la durée de grâce configurée par F10 (`student_deletion_delay_days`) et ne purge que les élèves dont :

```text
deleted_at + student_deletion_delay_days <= now()
```

Le traitement est réalisé de manière itérative avec `lazyById()` pour éviter de charger tous les enregistrements en mémoire. La suppression est faite avec `forceDelete()` et la commande journalise le nombre d’élèves purgés.

## Planification Laravel

Le scheduler Laravel est enregistré dans `backend/routes/console.php` et exécute la commande chaque jour à 02:00 :

```php
Schedule::command('students:purge-expired')
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->onOneServer();
```

Cela garantit un exécution quotidienne sans chevauchement, à condition que le planificateur soit bien activé par le cron de l’environnement de déploiement.

## Exécution manuelle

```bash
cd backend
php artisan students:purge-expired
```

## Déploiement / cron

Dans l’environnement de production, il faut activer le scheduler Laravel via un cron quotidien :

```cron
* * * * * cd /chemin/vers/backend && php artisan schedule:run >> /dev/null 2>&1
```

La purge n’est donc pas supposée être exécutée automatiquement sans cette planification réelle côté serveur.
