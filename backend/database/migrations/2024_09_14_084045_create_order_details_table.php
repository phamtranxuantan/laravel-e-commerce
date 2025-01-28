<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_details', function (Blueprint $table) {
            $table->increments('id'); // Khóa chính
            $table->unsignedInteger('order_id'); // Khóa ngoại liên kết với bảng orders
            $table->unsignedInteger('product_id'); // Khóa ngoại liên kết với bảng products
            $table->integer('quantity'); // Số lượng sản phẩm
            $table->decimal('price', 20, 2); // Giá sản phẩm
            $table->timestamps();

            // Định nghĩa khóa ngoại
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_details');
    }
};
