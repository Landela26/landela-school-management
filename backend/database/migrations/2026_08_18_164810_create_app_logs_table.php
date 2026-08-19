<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_logs', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedInteger('id_utilisateur');

            $table->string('ip_adresse');

            $table->string('user_agent');

            $table->string('action');

            $table->timestamp('created_at');

            $table->foreign('id_utilisateur')
                ->references('id_utilisateur')
                ->on('utilisateurs')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_logs');
    }
};
