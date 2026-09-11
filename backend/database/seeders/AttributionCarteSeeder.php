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
        $attributions = [];

        $eleves = DB::table('eleves')
            ->where('statut', 'actif')
            ->orderBy('id_eleve')
            ->get();

        $cartes = DB::table('cartes_nfc')
            ->where('statut', 'actif')
            ->orderBy('id')
            ->get();

        foreach ($eleves as $index => $eleve) {

            if (!isset($cartes[$index])) {
                break;
            }

            $carte = $cartes[$index];

            $attributions[] = [
                'id' => $index + 1,
                'id_carte' => $carte->id,
                'id_eleve' => $eleve->id_eleve,
                'id_personnel' => null,
                'date_attribution' => $dateAttribution,
                'statut' => 'actif',
                'date_fin' => null,
                'motif_fin' => null,
            ];
        }

        if (!empty($attributions)) {
            DB::table('attribution_cartes')->insert($attributions);
        }
    }
}
