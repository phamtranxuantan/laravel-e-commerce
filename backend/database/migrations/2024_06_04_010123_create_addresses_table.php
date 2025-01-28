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
        Schema::create('addresses', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned()->index(); // ID của người dùng
            $table->string('fullname'); // Họ tên người nhận
            $table->string('phone'); // Số điện thoại
            $table->string('email'); // Email
            $table->string('address'); // Địa chỉ cụ thể
            $table->string('province'); // Tỉnh/Thành phố
            $table->string('district'); // Quận/Huyện
            $table->string('ward'); // Phường/Xã
            $table->unsignedInteger('orders_id')->nullable(); // Trường liên kết với đơn hàng
            $table->timestamps(); // Ngày tạo và cập nhật

            // Thiết lập khóa ngoại
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('orders_id')->references('id')->on('orders')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
