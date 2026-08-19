<?php

namespace Database\Factories;

use App\Models\Personnel;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UtilisateurFactory extends Factory
{
    protected $model = Utilisateur::class;

    public function definition(): array
    {
        return [
            'id_personnel' => Personnel::factory(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'mot_de_passe' => Hash::make('password'),
            'role' => fake()->randomElement([
                'admin',
                'super_admin',
            ]),
            'photo_profil' => null,
            'derniere_connexion' => null,
            'actif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
