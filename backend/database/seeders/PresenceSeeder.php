<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PresenceSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('presences')->truncate();

        $today = Carbon::today();

        $attributions = DB::table('attribution_cartes')
            ->where('statut', 'actif')
            ->get()
            ->keyBy('id_eleve');

        $presences = [];

        foreach ($attributions as $attribution) {

            $statut = match ($attribution->id_eleve) {
                1 => 'present',
                2 => 'retard',
                3 => 'present',
                4 => 'absent',
                5 => 'present',
                default => 'present',
            };

            $presences[] = [
                'id_attribution' => $attribution->id,
                'date_heure' => $today->copy()->setTime(7, 30),
                'statut_presence' => $statut,
                'source_pointage' => 'manuel',
                'snapshot' => null,
                'remarque' => $statut === 'retard'
                    ? 'Arrivée après l’heure prévue'
                    : null,
            ];
        }

        if (!empty($presences)) {
            DB::table('presences')->insert($presences);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}
