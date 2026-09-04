<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ClasseSeeder::class,
            PersonnelSeeder::class,
            UtilisateurSeeder::class,
            EleveSeeder::class,
            InscriptionSeeder::class,
            CarteNfcSeeder::class,
            AttributionCarteSeeder::class,
            PresenceSeeder::class,
        ]);
    }
}
