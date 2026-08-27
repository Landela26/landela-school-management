<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'utilisateurs';

    protected $primaryKey = 'id_utilisateur';

    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'username',
        'email',
        'mot_de_passe',
        'role',
        'photo_profil',
        'derniere_connexion',
        'actif',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    protected $casts = [
        'derniere_connexion' => 'datetime',
        'actif' => 'boolean',
    ];

    /**
     * Colonne utilisée comme mot de passe par Laravel.
     */
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    /**
     * Personnel lié.
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
     * Logs de l'utilisateur.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(
            AppLog::class,
            'id_utilisateur',
            'id_utilisateur'
        );
    }
}
