<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inscription extends Model
{
    use HasFactory;

    protected $table = 'inscriptions';

    protected $primaryKey = 'id_scription';

    public $timestamps = false;

    protected $fillable = [
        'id_eleve',
        'id_classe',
        'annee_scolaire',
        'date_debut',
        'date_fin',
        'statut',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    /**
     * Élève inscrit.
     */
    public function eleve(): BelongsTo
    {
        return $this->belongsTo(
            Eleve::class,
            'id_eleve',
            'id_eleve'
        );
    }

    /**
     * Classe de l'inscription.
     */
    public function classe(): BelongsTo
    {
        return $this->belongsTo(
            Classe::class,
            'id_classe',
            'id_classe'
        );
    }
}
