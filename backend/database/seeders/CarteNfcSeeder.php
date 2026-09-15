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
        $cartes = [];

        $eleves = DB::table('eleves')
            ->where('statut', 'actif')
            ->orderBy('id_eleve')
            ->get();

        foreach ($eleves as $index => $eleve) {
            $numero = $index + 1;

            $cartes[] = [
                'id' => $numero,
                'uid' => Str::uuid()->toString(),
                'numero_carte' => 'NFC-' . str_pad($numero, 6, '0', STR_PAD_LEFT),
                'statut' => 'actif',
                'date_creation' => $now,
            ];
        }

        if (!empty($cartes)) {
            DB::table('cartes_nfc')->insert($cartes);
        }
    }
}
