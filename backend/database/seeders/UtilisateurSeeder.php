<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        Utilisateur::updateOrCreate(
            [
                'username' => 'admin',
            ],
            [
                'id_personnel' => 1,
                'email' => 'admin@landela-school.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'super_admin',
                'actif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );
    }
}
