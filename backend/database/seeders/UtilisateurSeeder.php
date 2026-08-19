<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        Utilisateur::factory()->count(10)->create();
    }
}
