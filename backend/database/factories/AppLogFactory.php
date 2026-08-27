<?php

namespace Database\Factories;

use App\Models\AppLog;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppLogFactory extends Factory
{
    protected $model = AppLog::class;

    public function definition(): array
    {
        return [
            'id_utilisateur' => Utilisateur::factory(),
            'ip_adresse' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'action' => fake()->randomElement([
                'connexion',
                'deconnexion',
                'creation',
                'modification',
                'suppression',
                'consultation',
            ]),
            'created_at' => now(),
        ];
    }
}
