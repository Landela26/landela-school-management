<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnels', function (Blueprint $table) {
            $table->increments('id_personnel');

            $table->string('matricule', 50);

            $table->unsignedInteger('id_classe')
                ->nullable();

            $table->string('nom', 100);
            $table->string('postnom', 100);
            $table->string('prenom', 50);
            $table->string('fonction', 100);
            $table->string('telephone', 20);

            $table->string('email', 100)
                ->nullable();

            $table->boolean('estEnseignant')
                ->default(false);

            $table->enum('statut', [
                'actif',
                'inactif',
            ])->default('actif');

            $table->dateTime('date_creation');

            $table->unique('matricule');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnels');
    }
};
