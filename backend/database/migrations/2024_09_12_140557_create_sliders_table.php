<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('sliders', function (Blueprint $table) {
            $table->id(); // Tạo trường id tự động tăng
            $table->string('image_url');
            $table->string('caption')->nullable(); // Trường chứa mô tả hình ảnh, có thể để trống
            $table->timestamps(); // Tạo các trường created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Sliders');
    }
};
