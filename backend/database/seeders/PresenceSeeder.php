<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class PresenceSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();



        $today = Carbon::today();
        DB::table('presences')
            ->whereDate('date_heure', $today)
            ->delete();
        $attributions = DB::table('attribution_cartes')
            ->where('statut', 'actif')
            ->get()
            ->keyBy('id_eleve');

        $presences = [];

        foreach ($attributions as $attribution) {

            $eleve = DB::table('eleves')
                ->where('id_eleve', $attribution->id_eleve)
                ->first();

            if (!$eleve) {
                continue;
            }

            $nomEleve = trim(implode(' ', array_filter([
                $eleve->nom,
                $eleve->postnom,
                $eleve->prenom,
            ])));
            $classe = DB::table('classes')
                ->where('id_classe', $eleve->classe_id)
                ->first();
            $nomClasse = $classe?->nom_classe ?? 'Sans classe';

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
                'id_eleve' => $eleve->id_eleve,
                'date_heure' => $today->copy()->setTime(7, 30),
                'statut_presence' => $statut,
                'source_pointage' => 'manuel',
                'nom_eleve_snapshot' => $nomEleve,
                'classe_snapshot' => $nomClasse,
                'snapshot' => json_encode([
                    'nom_eleve' => $nomEleve,
                    'classe' => $nomClasse,
                ], JSON_THROW_ON_ERROR),
                'remarque' => $statut === 'retard'
                    ? 'Arrivée après l’heure prévue'
                    : null,
            ];
        }

        if (!empty($presences)) {
            DB::table('presences')->insert($presences);
        }

        Schema::enableForeignKeyConstraints();
    }
}
