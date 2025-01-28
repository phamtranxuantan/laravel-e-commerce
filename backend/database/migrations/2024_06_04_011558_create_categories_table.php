<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->timestamps();
        });

            DB::table('categories')->insert([
                ['name' => 'Lapstops', 'created_at' => now()],
                ['name' => 'Smartphones', 'created_at' => now()],
                ['name' => 'Cameras', 'created_at' => now()],
                ['name' => 'Accessories', 'created_at' => now()],
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
