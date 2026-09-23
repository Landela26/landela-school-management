<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            $table->index('date_heure', 'presences_date_heure_index');
            $table->index('statut_presence', 'presences_statut_presence_index');
        });

        Schema::table('eleves', function (Blueprint $table) {
            $table->index('classe_id', 'eleves_classe_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            $table->dropIndex('presences_date_heure_index');
            $table->dropIndex('presences_statut_presence_index');
        });

        Schema::table('eleves', function (Blueprint $table) {
            $table->dropIndex('eleves_classe_id_index');
        });
    }
};
