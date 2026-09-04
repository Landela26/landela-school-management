<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attribution_cartes', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedInteger('id_carte');

            $table->unsignedInteger('id_eleve')
                ->nullable();

            $table->unsignedInteger('id_personnel')
                ->nullable();

            $table->dateTime('date_attribution');

            $table->enum('statut', [
                'actif',
                'inactif',
            ])->default('actif');

            $table->dateTime('date_fin')
                ->nullable();

            $table->string('motif_fin')
                ->nullable();

            $table->foreign('id_carte')
                ->references('id')
                ->on('cartes_nfc')
                ->cascadeOnDelete();

            $table->foreign('id_eleve')
                ->references('id_eleve')
                ->on('eleves')
                ->nullOnDelete();

            $table->foreign('id_personnel')
                ->references('id_personnel')
                ->on('personnels')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attribution_cartes');
    }
};
