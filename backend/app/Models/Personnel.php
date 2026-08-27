<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Personnel extends Model
{
    use HasFactory;

    protected $table = 'personnels';

    protected $primaryKey = 'id_personnel';

    public $timestamps = false;

    protected $fillable = [
        'matricule',
        'id_classe',
        'nom',
        'postnom',
        'prenom',
        'fonction',
        'telephone',
        'email',
        'estEnseignant',
        'statut',
        'date_creation',
    ];

    protected $casts = [
        'estEnseignant' => 'boolean',
        'date_creation' => 'datetime',
    ];

    /**
     * Classe à laquelle le personnel est rattaché.
     */
    public function classe(): BelongsTo
    {
        return $this->belongsTo(
            Classe::class,
            'id_classe',
            'id_classe'
        );
    }

    /**
     * Classes enseignées.
     */
    public function classesEnseignees(): HasMany
    {
        return $this->hasMany(
            Classe::class,
            'id_enseignant',
            'id_personnel'
        );
    }

    /**
     * Compte utilisateur associé.
     */
    public function utilisateur(): HasOne
    {
        return $this->hasOne(
            Utilisateur::class,
            'id_personnel',
            'id_personnel'
        );
    }

    /**
     * Attributions de cartes au personnel.
     */
    public function attributionsCartes(): HasMany
    {
        return $this->hasMany(
            AttributionCarte::class,
            'id_personnel',
            'id_personnel'
        );
    }
}
