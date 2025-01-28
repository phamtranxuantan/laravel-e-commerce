<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    // Bỏ qua bảng mặc định 'addresses' nếu tên bảng khác
    protected $table = 'addresses';

    // Các thuộc tính có thể được gán hàng loạt
    protected $fillable = [
        'user_id',
        'fullname',
        'phone',
        'email',
        'address',
        'province',
        'district',
        'ward',
        'orders_id',
    ];

    // Định nghĩa mối quan hệ với model User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Định nghĩa mối quan hệ với model Order
    public function order()
    {
        return $this->belongsTo(Orders::class, 'orders_id');
    }
}
