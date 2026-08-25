<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TuteurLegal extends Model
{
    use HasFactory;

    protected $table = 'tuteurs_legaux';

    protected $primaryKey = 'id_tuteur';

    public $timestamps = false;

    protected $fillable = [
        'nom',
        'prenom',
        'telephone_principal',
        'telephone_secondaire',
        'profession',
        'adresse',
        'sexe',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Élèves suivis.
     */
    public function eleves(): BelongsToMany
    {
        return $this->belongsToMany(
            Eleve::class,
            'eleve_tuteur',
            'id_tuteur',
            'id_eleve',
            'id_tuteur',
            'id_eleve'
        )->withPivot([
            'relation',
            'contact_urgence',
        ]);
    }
}
