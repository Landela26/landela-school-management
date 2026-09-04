<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eleves', function (Blueprint $table) {
            $table->increments('id_eleve');

            $table->string('matricule')
                ->nullable()
                ->unique();

            $table->string('nom');
            $table->string('postnom');
            $table->string('prenom', 50);

            $table->enum('sexe', [
                'M',
                'F',
            ]);

            $table->date('date_naissance');

            $table->string('adresse', 255);

            $table->string('photo')
                ->nullable();

            $table->enum('statut', [
                'actif',
                'transfere',
                'diplome',
                'abandonne',
            ])->default('actif');

            $table->dateTime('date_creation');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eleves');
    }
};
