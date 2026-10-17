<?php

namespace App\Console\Commands;

use App\Models\Eleve;
use App\Services\SchoolSettingsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PurgeExpiredStudentsCommand extends Command
{
    protected $signature = 'students:purge-expired';

    protected $description = 'Supprime définitivement les élèves soft-deletés dont la période de grâce est expirée.';

    public function __construct(private readonly SchoolSettingsService $settingsService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $gracePeriodDays = $this->settingsService->getSettings()['student_deletion_delay_days'];
        $cutoff = now()->subDays($gracePeriodDays);

        $eligibles = Eleve::onlyTrashed()
            ->whereNotNull('deleted_at')
            ->where('deleted_at', '<=', $cutoff)
            ->orderBy('deleted_at');

        $total = $eligibles->count();

        if ($total === 0) {
            $this->info('Aucun élève éligible à la purge automatique.');

            return self::SUCCESS;
        }

        $purged = 0;

        foreach ($eligibles->lazyById() as $eleve) {
            try {
                DB::transaction(function () use ($eleve): void {
                    $eleve->forceDelete();
                });

                $purged++;
            } catch (\Throwable $throwable) {
                $this->error(sprintf(
                    'Impossible de purger l\'élève #%d : %s',
                    $eleve->id_eleve,
                    $throwable->getMessage()
                ));
            }
        }

        $this->info(sprintf(
            'Purge terminée : %d/%d élève(s) supprimé(s) définitivement.',
            $purged,
            $total
        ));

        return self::SUCCESS;
    }
}
