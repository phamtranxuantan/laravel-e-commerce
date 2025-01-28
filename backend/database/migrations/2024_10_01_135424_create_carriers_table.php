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
        Schema::create('carriers', function (Blueprint $table) {
            $table->increments('id'); // Khóa chính
            $table->string('name')->comment('Tên nhà vận chuyển'); // Tên nhà vận chuyển
            $table->string('contact_info')->nullable()->comment('Thông tin liên hệ'); // Thông tin liên hệ
            $table->boolean('active')->default(true)->comment('Trạng thái hoạt động'); // Trạng thái hoạt động
            $table->timestamps(); // Thời gian tạo và cập nhật
        });
    }

    public function down()
    {
        Schema::dropIfExists('carriers'); // Xóa bảng nếu rollback
    }
};
