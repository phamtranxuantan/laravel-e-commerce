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
        Schema::table('orders', function (Blueprint $table) {

            $table->decimal('shipping_fee', 10, 2)->nullable()->comment('Phí vận chuyển');

            $table->enum('shipping_status', ['đang chờ xử lý', 'đang giao', 'đã giao', 'không thành công'])->default('đang chờ xử lý')->comment('Trạng thái giao hàng');

            
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Xóa các trường nếu rollback migration
            $table->dropForeign(['carrier_id']);
            $table->dropColumn('carrier_id');
            $table->dropColumn('shipping_fee');
            $table->dropColumn('tracking_number');
            $table->dropColumn('shipping_status');
            $table->dropColumn('shipping_address');
        });
    }
};
