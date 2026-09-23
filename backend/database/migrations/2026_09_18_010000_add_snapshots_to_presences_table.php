<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            $table->string('nom_eleve_snapshot', 255)->nullable()->after('statut_presence');
            $table->string('classe_snapshot', 255)->nullable()->after('nom_eleve_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            $table->dropColumn(['nom_eleve_snapshot', 'classe_snapshot']);
        });
    }
};
