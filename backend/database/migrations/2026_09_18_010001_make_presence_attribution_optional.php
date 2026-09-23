<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            $table->unsignedInteger('id_eleve')->nullable()->after('id_attribution');
            $table->foreign('id_eleve')
                ->references('id_eleve')
                ->on('eleves')
                ->nullOnDelete();
        });

        Schema::table('presences', function (Blueprint $table) {
            $table->unsignedInteger('id_attribution')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            $table->dropForeign(['id_eleve']);
            $table->dropColumn('id_eleve');
            $table->unsignedInteger('id_attribution')->nullable(false)->change();
        });
    }
};
