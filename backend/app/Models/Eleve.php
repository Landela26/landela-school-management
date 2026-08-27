<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Eleve extends Model
{
    use HasFactory;

    protected $table = 'eleves';

    protected $primaryKey = 'id_eleve';

    public $timestamps = false;

    protected $fillable = [
        'matricule',
        'nom',
        'postnom',
        'prenom',
        'sexe',
        'date_naissance',
        'adresse',
        'photo',
        'statut',
        'date_creation',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_creation' => 'datetime',
    ];

    /**
     * Inscriptions.
     */
    public function inscriptions(): HasMany
    {
        return $this->hasMany(
            Inscription::class,
            'id_eleve',
            'id_eleve'
        );
    }

    /**
     * Tuteurs légaux.
     */
    public function tuteurs(): BelongsToMany
    {
        return $this->belongsToMany(
            TuteurLegal::class,
            'eleve_tuteur',
            'id_eleve',
            'id_tuteur',
            'id_eleve',
            'id_tuteur'
        )->withPivot([
            'relation',
            'contact_urgence',
        ]);
    }

    /**
     * Attributions de cartes.
     */
    public function attributionsCartes(): HasMany
    {
        return $this->hasMany(
            AttributionCarte::class,
            'id_eleve',
            'id_eleve'
        );
    }
}
