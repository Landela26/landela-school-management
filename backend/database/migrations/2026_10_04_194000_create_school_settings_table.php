<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->string('setting_key', 100)->primary();
            $table->text('setting_value');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
