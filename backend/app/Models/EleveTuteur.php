<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EleveTuteur extends Pivot
{
    protected $table = 'eleve_tuteur';

    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = null;

    protected $fillable = [
        'id_eleve',
        'id_tuteur',
        'relation',
        'contact_urgence',
    ];

    protected $casts = [
        'contact_urgence' => 'boolean',
    ];
}
