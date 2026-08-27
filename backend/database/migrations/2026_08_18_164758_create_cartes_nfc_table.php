<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cartes_nfc', function (Blueprint $table) {
            $table->increments('id');

            $table->uuid('uid')
                ->unique();

            $table->string('numero_carte')
                ->unique();

            $table->enum('statut', [
                'actif',
                'inactif',
            ])->default('actif');

            $table->dateTime('date_creation');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cartes_nfc');
    }
};
