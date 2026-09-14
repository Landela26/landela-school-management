<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttributionCarteSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('attribution_cartes')->delete();

        $dateAttribution = Carbon::now();

        DB::table('attribution_cartes')->insert([
            [
                'id' => 1,
                'id_carte' => 1,
                'id_eleve' => 1,
                'id_personnel' => null,
                'date_attribution' => $dateAttribution,
                'statut' => 'actif',
                'date_fin' => null,
                'motif_fin' => null,
            ],
            [
                'id' => 2,
                'id_carte' => 2,
                'id_eleve' => 2,
                'id_personnel' => null,
                'date_attribution' => $dateAttribution,
                'statut' => 'actif',
                'date_fin' => null,
                'motif_fin' => null,
            ],
            [
                'id' => 3,
                'id_carte' => 3,
                'id_eleve' => 3,
                'id_personnel' => null,
                'date_attribution' => $dateAttribution,
                'statut' => 'actif',
                'date_fin' => null,
                'motif_fin' => null,
            ],
            [
                'id' => 4,
                'id_carte' => 4,
                'id_eleve' => 4,
                'id_personnel' => null,
                'date_attribution' => $dateAttribution,
                'statut' => 'actif',
                'date_fin' => null,
                'motif_fin' => null,
            ],
            [
                'id' => 5,
                'id_carte' => 5,
                'id_eleve' => 5,
                'id_personnel' => null,
                'date_attribution' => $dateAttribution,
                'statut' => 'actif',
                'date_fin' => null,
                'motif_fin' => null,
            ],
        ]);
    }
}
