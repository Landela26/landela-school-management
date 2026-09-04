<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscriptions', function (Blueprint $table) {
            $table->increments('id_scription');

            $table->unsignedInteger('id_eleve');

            $table->unsignedInteger('id_classe');

            $table->string('annee_scolaire', 9);

            $table->dateTime('date_debut');

            $table->dateTime('date_fin')
                ->nullable();

            $table->enum('statut', [
                'active',
                'terminee',
                'transferee',
                'abandonnee',
            ])->default('active');

            $table->foreign('id_eleve')
                ->references('id_eleve')
                ->on('eleves')
                ->cascadeOnDelete();

            $table->foreign('id_classe')
                ->references('id_classe')
                ->on('classes')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
    }
};
