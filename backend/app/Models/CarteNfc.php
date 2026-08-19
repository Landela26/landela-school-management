<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarteNfc extends Model
{
    use HasFactory;

    protected $table = 'cartes_nfc';

    public $timestamps = false;

    protected $fillable = [
        'uid',
        'numero_carte',
        'statut',
        'date_creation',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
    ];

    /**
     * Historique des attributions.
     */
    public function attributions(): HasMany
    {
        return $this->hasMany(
            AttributionCarte::class,
            'id_carte',
            'id'
        );
    }
}
