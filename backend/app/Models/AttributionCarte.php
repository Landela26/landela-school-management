<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttributionCarte extends Model
{
    use HasFactory;

    protected $table = 'attribution_cartes';

    public $timestamps = false;

    protected $fillable = [
        'id_carte',
        'id_eleve',
        'id_personnel',
        'date_attribution',
        'statut',
        'date_fin',
        'motif_fin',
    ];

    protected $casts = [
        'date_attribution' => 'datetime',
        'date_fin' => 'datetime',
    ];

    /**
     * Carte attribuée.
     */
    public function carte(): BelongsTo
    {
        return $this->belongsTo(
            CarteNfc::class,
            'id_carte',
            'id'
        );
    }

    /**
     * Élève bénéficiaire.
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
     * Personnel bénéficiaire.
     */
    public function personnel(): BelongsTo
    {
        return $this->belongsTo(
            Personnel::class,
            'id_personnel',
            'id_personnel'
        );
    }

    /**
     * Pointages effectués avec cette attribution.
     */
    public function presences(): HasMany
    {
        return $this->hasMany(
            Presence::class,
            'id_attribution',
            'id'
        );
    }
}
