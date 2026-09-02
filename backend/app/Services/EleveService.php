<?php

namespace App\Services;

use App\Models\Eleve;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class EleveService
{
    /**
     * Créer un nouvel élève.
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


    /**
     * modifier un élève existant.
     * 
     */
    public function modifier(Eleve $eleve, array $donnees): Eleve
    {
        return DB::transaction(function () use ($eleve, $donnees) {
            if (
                isset($donnees['photo']) &&
                $donnees['photo'] instanceof UploadedFile
            ) {
                $photo = $this->stockerPhoto($donnees['photo']);
                $eleve->photo = $photo;
            }

            $eleve->nom = $donnees['nom'];
            $eleve->postnom = $donnees['postnom'];
            $eleve->prenom = $donnees['prenom'];
            $eleve->sexe = $donnees['sexe'];
            $eleve->date_naissance = $donnees['dateNaissance'];
            $eleve->adresse = $donnees['adresse'];
            $eleve->matricule = $donnees['matricule'];

            $eleve->save();

            return $eleve;
        });
    }
}
