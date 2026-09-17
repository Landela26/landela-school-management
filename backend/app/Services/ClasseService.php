<?php

namespace App\Services;

use App\Models\Classe;
use Illuminate\Support\Facades\DB;

class ClasseService
{
    public function  getliste(): array
    {
        $classes = Classe::all();
        return $classes->toArray();
    }
    public function getById(int $id): ?Classe
    {
        return Classe::find($id);
    }
    public function creer(array $donnees): Classe
    {
        return DB::transaction(function () use ($donnees) {
            return Classe::create([
                'code_classe' => $donnees['code_classe'],
                'id_enseignant' => $donnees['id_enseignant'],
                'nom_classe' => $donnees['nom_classe'],
                'niveau' => $donnees['niveau'],
                'annee_scolaire' => $donnees['annee_scolaire'],
                'id_classe_parent' => $donnees['id_classe_parent'] ?? null,
                'statut' => 'active',
                'date_creation' => now(),
            ]);
        });
    }

    public function modifier(Classe $classe, array $donnees): Classe
    {
        return DB::transaction(function () use ($classe, $donnees) {
            $classe->fill($donnees);
            $classe->save();

            return $classe->fresh();
        });
    }
}
