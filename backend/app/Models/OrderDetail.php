<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Orders;
class OrderDetail extends Model
{
    use HasFactory;

    // Đặt tên bảng nếu không phải theo quy ước (Laravel sẽ tự động tìm bảng `order_details` theo mặc định)
    protected $table = 'order_details';

    // Các thuộc tính có thể được gán hàng loạt
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
    ];

    // Chi tiết đơn hàng thuộc về một đơn hàng
    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }

    // Chi tiết đơn hàng thuộc về một sản phẩm
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
