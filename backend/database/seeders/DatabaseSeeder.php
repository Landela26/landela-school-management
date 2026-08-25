<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Utilisateur::factory()->create([
            'username' => 'admin',
            'email' => 'admin@landela-school.com',
            'mot_de_passe' => Hash::make('password123'),
            'role' => 'super_admin',
            'actif' => true,
        ]);
    }
}
