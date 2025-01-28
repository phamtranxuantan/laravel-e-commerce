<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->increments('id'); // Khóa chính
            $table->unsignedInteger('user_id'); // Khóa ngoại liên kết với bảng users

            $table->decimal('total_amount', 10, 2); // Tổng số tiền của đơn hàng
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending'); // Trạng thái đơn hàng
            $table->enum('payment_method', ['vnpay', 'paypal', 'momo','credit_card','chuathanhtoan'])->default('chuathanhtoan');
            $table->string('transaction_id', 255)->nullable();
            $table->string('vnp_response_code', 10)->nullable();
            $table->timestamp('payment_time')->nullable();

            $table->timestamps();

            // Định nghĩa khóa ngoại
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
