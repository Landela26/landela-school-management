<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tuteurs_legaux', function (Blueprint $table) {
            $table->increments('id_tuteur');

            $table->string('nom');
            $table->string('prenom');

            $table->string('telephone_principal');

            $table->string('telephone_secondaire')
                ->nullable();

            $table->string('profession')
                ->nullable();

            $table->string('adresse');

            $table->enum('sexe', [
                'M',
                'F',
            ]);

            $table->dateTime('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tuteurs_legaux');
    }
};
