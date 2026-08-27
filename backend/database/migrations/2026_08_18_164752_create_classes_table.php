<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->increments('id_classe');

            $table->string('code_classe');

            $table->unsignedInteger('id_enseignant');

            $table->string('nom_classe');

            $table->string('niveau', 50);

            $table->string('annee_scolaire', 9);

            $table->unsignedInteger('id_classe_parent')
                ->nullable();

            $table->enum('statut', [
                'active',
                'fusionnee',
                'supprimee',
            ])->default('active');

            $table->dateTime('date_creation');

            $table->dateTime('deleted_at')
                ->nullable();

            $table->foreign('id_enseignant')
                ->references('id_personnel')
                ->on('personnels')
                ->restrictOnDelete();

            $table->foreign('id_classe_parent')
                ->references('id_classe')
                ->on('classes')
                ->nullOnDelete();
        });

        /*
         * Une fois classes créée, on peut ajouter la FK inverse
         * de personnels.id_classe.
         */
        Schema::table('personnels', function (Blueprint $table) {
            $table->foreign('id_classe')
                ->references('id_classe')
                ->on('classes')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('personnels', function (Blueprint $table) {
            $table->dropForeign(['id_classe']);
        });

        Schema::dropIfExists('classes');
    }
};
