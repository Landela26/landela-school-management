<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presence extends Model
{
    use HasFactory;

    protected $table = 'presences';

    protected $primaryKey = 'id_presence';

    public $timestamps = false;

    protected $fillable = [
        'id_attribution',
        'id_eleve',
        'date_heure',
        'statut_presence',
        'nom_eleve_snapshot',
        'classe_snapshot',
        'source_pointage',
        'snapshot',
        'remarque',
    ];

    protected $casts = [
        'date_heure' => 'datetime',
        'snapshot' => 'array',
    ];

    /**
     * Attribution ayant servi au pointage.
     */
    public function attribution(): BelongsTo
    {
        return $this->belongsTo(
            AttributionCarte::class,
            'id_attribution',
            'id'
        );
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(
            Eleve::class,
            'id_eleve',
            'id_eleve'
        );
    }
}
