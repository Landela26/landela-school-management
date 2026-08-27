<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eleve_tuteur', function (Blueprint $table) {
            $table->unsignedInteger('id_tuteur');
            $table->unsignedInteger('id_eleve');

            $table->string('relation');

            $table->boolean('contact_urgence')
                ->default(false);

            $table->primary([
                'id_tuteur',
                'id_eleve',
            ]);

            $table->foreign('id_tuteur')
                ->references('id_tuteur')
                ->on('tuteurs_legaux')
                ->cascadeOnDelete();

            $table->foreign('id_eleve')
                ->references('id_eleve')
                ->on('eleves')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eleve_tuteur');
    }
};
