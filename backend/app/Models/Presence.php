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
        'date_heure',
        'statut_presence',
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
}
