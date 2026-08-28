<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InscriptionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('inscriptions')->delete();

        $dateDebut = Carbon::create(2025, 9, 1);
        $dateFin = Carbon::create(2026, 6, 30);

        DB::table('inscriptions')->insert([
            [
                'id_eleve' => 1,
                'id_classe' => 1,
                'annee_scolaire' => '2025-2026',
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'active',
            ],
            [
                'id_eleve' => 2,
                'id_classe' => 1,
                'annee_scolaire' => '2025-2026',
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'active',
            ],
            [
                'id_eleve' => 3,
                'id_classe' => 2,
                'annee_scolaire' => '2025-2026',
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'active',
            ],
            [
                'id_eleve' => 4,
                'id_classe' => 2,
                'annee_scolaire' => '2025-2026',
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'active',
            ],
            [
                'id_eleve' => 5,
                'id_classe' => 3,
                'annee_scolaire' => '2025-2026',
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'active',
            ],
        ]);
    }
}
