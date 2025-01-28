<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    use HasFactory;

    // Đặt tên bảng nếu không phải theo quy ước (Laravel sẽ tự động tìm bảng `orders` theo mặc định)
    protected $table = 'orders';

    // Các thuộc tính có thể được gán hàng loạt
    protected $fillable = [
        'user_id',
        'total_amount',
        'status',
        'payment_method',
        'transaction_id',
        'vnp_response_code',
        'payment_time',
        'ghn_order_code',
        'shipping_fee'
    ];

    // Một đơn hàng có nhiều chi tiết đơn hàng
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }
    public function addresses()
    {
        return $this->hasMany(Address::class, 'orders_id');
    }
    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id'); // Adjust if the foreign key is different
    }
}
