<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CarteNfcSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('cartes_nfc')->delete();

        $now = Carbon::now();

        DB::table('cartes_nfc')->insert([
            [
                'id' => 1,
                'uid' => Str::uuid()->toString(),
                'numero_carte' => 'NFC-000001',
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id' => 2,
                'uid' => Str::uuid()->toString(),
                'numero_carte' => 'NFC-000002',
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id' => 3,
                'uid' => Str::uuid()->toString(),
                'numero_carte' => 'NFC-000003',
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id' => 4,
                'uid' => Str::uuid()->toString(),
                'numero_carte' => 'NFC-000004',
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id' => 5,
                'uid' => Str::uuid()->toString(),
                'numero_carte' => 'NFC-000005',
                'statut' => 'actif',
                'date_creation' => $now,
            ],
            [
                'id' => 6,
                'uid' => Str::uuid()->toString(),
                'numero_carte' => 'NFC-000006',
                'statut' => 'actif',
                'date_creation' => $now,
            ],
        ]);
    }
}
