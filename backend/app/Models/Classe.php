<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classe extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';

    protected $primaryKey = 'id_classe';

    public $timestamps = false;

    const DELETED_AT = 'deleted_at';

    protected $fillable = [
        'code_classe',
        'id_enseignant',
        'nom_classe',
        'niveau',
        'annee_scolaire',
        'id_classe_parent',
        'statut',
        'date_creation',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Enseignant principal.
     */
    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(
            Personnel::class,
            'id_enseignant',
            'id_personnel'
        );
    }

    /**
     * Classe parent.
     */
    public function classeParent(): BelongsTo
    {
        return $this->belongsTo(
            Classe::class,
            'id_classe_parent',
            'id_classe'
        );
    }

    /**
     * Classes enfants.
     */
    public function classesEnfants(): HasMany
    {
        return $this->hasMany(
            Classe::class,
            'id_classe_parent',
            'id_classe'
        );
    }

    /**
     * Inscriptions.
     */
    public function inscriptions(): HasMany
    {
        return $this->hasMany(
            Inscription::class,
            'id_classe',
            'id_classe'
        );
    }
}
