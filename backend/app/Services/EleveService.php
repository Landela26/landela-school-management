<?php

namespace App\Services;

use App\Models\Eleve;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EleveService
{
    /**
     * Créer un nouvel élève.
     *
     * Les données système sont générées ici :
     * - statut
     * - date_creation
     *
     * Le matricule sera géré ultérieurement
     * selon la configuration choisie par l'établissement.
     */
    public function creer(array $donnees): Eleve
    {
        return DB::transaction(function () use ($donnees) {
            $photo = null;

            if (
                isset($donnees['photo']) &&
                $donnees['photo'] instanceof UploadedFile
            ) {
                $photo = $this->stockerPhoto($donnees['photo']);
            }

            return Eleve::create([
                'matricule' => $donnees['matricule'] ?? null,
                'nom' => $donnees['nom'],
                'postnom' => $donnees['postnom'],
                'prenom' => $donnees['prenom'],
                'sexe' => $donnees['sexe'],
                'date_naissance' => $donnees['dateNaissance'],
                'adresse' => $donnees['adresse'],
                'photo' => $photo,
                'statut' => 'actif',
                'date_creation' => now(),
            ]);
        });
    }

    /**
     * Stocker la photo de l'élève.
     */
    private function stockerPhoto(UploadedFile $photo): string
    {
        return $photo->store('eleves', 'public');
    }
}
