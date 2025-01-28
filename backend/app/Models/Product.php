<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    public $timestamps = true;

    protected $casts = [
        'price' => 'float'
    ];
    ////////
    protected $fillable = [
        'user_id', 'category_id', 'photo', 'brand', 'name', 'description', 'details', 'price','discount','price_before','weight'
    ];
        public function user() {
            return $this->belongsTo('App\Models\User');
        }
        public function category() {
            return $this->belongsTo ('App\Models\Category');
        }
        public function reviews() {
            return $this->hasMany('App\Models\Review');
        }
        public function stocks() {
            return $this->hasMany('App\Models\Stock');
        }
    //use HasFactory;
    // Phương thức tìm kiếm theo từ khóa
    public static function searchByKeyword($keyword)
    {
        return self::where('name', 'LIKE', "%{$keyword}%")
            ->orWhere('description', 'LIKE', "%{$keyword}%")
            ->with('category', 'stocks')
            ->get();
    }
}
