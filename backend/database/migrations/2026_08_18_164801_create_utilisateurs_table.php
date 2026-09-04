<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->increments('id_utilisateur');

            $table->unsignedInteger('id_personnel')
                ->unique();

            $table->string('username', 50)
                ->unique();

            $table->string('email', 100)
                ->unique();

            $table->string('mot_de_passe', 255);

            $table->enum('role', [
                'admin',
                'super_admin',
            ])->default('admin');

            $table->string('photo_profil')
                ->nullable();

            $table->dateTime('derniere_connexion')
                ->nullable();

            $table->boolean('actif')
                ->default(true);

            $table->dateTime('created_at');

            $table->dateTime('updated_at');

            $table->foreign('id_personnel')
                ->references('id_personnel')
                ->on('personnels')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};
