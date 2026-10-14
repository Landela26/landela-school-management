<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    protected $table = 'school_settings';

    protected $primaryKey = 'setting_key';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'setting_key',
        'setting_value',
    ];
}
