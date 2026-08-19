<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presences', function (Blueprint $table) {
            $table->increments('id_presence');

            $table->unsignedInteger('id_attribution');

            $table->timestamp('date_heure');

            $table->enum('statut_presence', [
                'present',
                'absent',
                'retard',
            ]);

            $table->enum('source_pointage', [
                'manuel',
                'nfc',
            ]);

            $table->json('snapshot')
                ->nullable();

            $table->string('remarque', 255)
                ->nullable();

            $table->foreign('id_attribution')
                ->references('id')
                ->on('attribution_cartes')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presences');
    }
};
