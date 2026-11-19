<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Cartes NFC de test : UID RÉELS des cartes physiques testées avec le lecteur
 * ACR122U (format : hexadécimal majuscule, sans séparateur).
 *
 * La 5e carte de test (04302192741190) n'est volontairement PAS enregistrée :
 * elle sert à tester le refus d'une carte inconnue (404).
 */
class CarteNfcSeeder extends Seeder
{
    /** id => [uid, numero_carte] */
    public const CARTES = [
        1 => ['048B5772FA1D90', 'NFC-000001'],
        2 => ['04A5803AC31D90', 'NFC-000002'],
        3 => ['04679A029A1B90', 'NFC-000003'],
        4 => ['04A5BE3AC31D90', 'NFC-000004'],
    ];

    public function run(): void
    {
        DB::table('cartes_nfc')->delete();

        $now = Carbon::now();
        $rows = [];

        foreach (self::CARTES as $id => [$uid, $numero]) {
            $rows[] = [
                'id' => $id,
                'uid' => $uid,
                'numero_carte' => $numero,
                'statut' => 'actif',
                'date_creation' => $now,
            ];
        }

        DB::table('cartes_nfc')->insert($rows);
    }
}
