<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClasseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('classes')->delete();

        $now = Carbon::now();

        DB::table('classes')->insert([
            [
                'id_classe' => 1,
                'code_classe' => '6A',
                'id_enseignant' => 2,
                'nom_classe' => '6A',
                'niveau' => '6ème',
                'annee_scolaire' => '2025-2026',
                'statut' => 'active',
                'date_creation' => $now,
                'deleted_at' => null,
            ],
            [
                'id_classe' => 2,
                'code_classe' => '6B',
                'id_enseignant' => 3,
                'nom_classe' => '6B',
                'niveau' => '6ème',
                'annee_scolaire' => '2025-2026',
                'statut' => 'active',
                'date_creation' => $now,
                'deleted_at' => null,
            ],
            [
                'id_classe' => 3,
                'code_classe' => '6C',
                'id_enseignant' => 4,
                'nom_classe' => '6C',
                'niveau' => '6ème',
                'annee_scolaire' => '2025-2026',
                'statut' => 'active',
                'date_creation' => $now,
                'deleted_at' => null,
            ],
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}
