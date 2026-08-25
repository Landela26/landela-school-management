<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use Illuminate\Database\Eloquent\Factories\Factory;

class InscriptionFactory extends Factory
{
    protected $model = Inscription::class;

    public function definition(): array
    {
        return [
            'id_eleve' => Eleve::factory(),
            'id_classe' => Classe::factory(),
            'annee_scolaire' => '2025-2026',
            'date_debut' => now(),
            'date_fin' => null,
            'statut' => 'active',
        ];
    }
}
