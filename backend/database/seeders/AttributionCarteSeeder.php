<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Attribue les cartes de test (CarteNfcSeeder) aux élèves d'EleveSeeder,
 * en les retrouvant par matricule (stable), et non par ordre d'id.
 */
class AttributionCarteSeeder extends Seeder
{
    /** uid de la carte => matricule de l'élève */
    public const ATTRIBUTIONS = [
        '048B5772FA1D90' => 'ELV-0001', // Bondo Kisinza Josue
        '04A5BE3AC31D90' => 'ELV-0002', // Kabesele Mwamba Daniel
        '04A5803AC31D90' => 'ELV-0003', // Mukendi Nsiala Grace
        '04679A029A1B90' => 'ELV-0004', // Mbuyi Nsimba Sarah
    ];

    public function run(): void
    {
        DB::table('attribution_cartes')->delete();

        $now = Carbon::now();
        $rows = [];

        foreach (self::ATTRIBUTIONS as $uid => $matricule) {
            $carte = DB::table('cartes_nfc')->where('uid', $uid)->first();
            $eleve = DB::table('eleves')->where('matricule', $matricule)->first();

            if (!$carte || !$eleve) {
                $this->command?->warn("Attribution ignorée : carte {$uid} ou élève {$matricule} introuvable.");
                continue;
            }

            $rows[] = [
                'id_carte' => $carte->id,
                'id_eleve' => $eleve->id_eleve,
                'id_personnel' => null,
                'date_attribution' => $now,
                'statut' => 'actif',
                'date_fin' => null,
                'motif_fin' => null,
            ];
        }

        if ($rows) {
            DB::table('attribution_cartes')->insert($rows);
        }
    }
}
