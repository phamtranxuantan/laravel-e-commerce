<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'address_id',
        'phone_id',
        'birthdate',
        'gender',
        'shipping_address',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }
    public function products(){
        return $this->hasMany('App\Models\Product');
    }
    public function cartItems(){
        return $this->hasMany('App\Models\ShoppingCart');
    }
    public function wishlistProducts(){
        return $this->hasMany('App\Models\Wishlist');
    }
    public function addresses(){
        return $this->hasMany('App\Models\Address');
    }
    public function phone()
    {
        return $this->belongsTo(Phone::class,'phone_id');
    }
    // Phương thức để kiểm tra quyền admin
    public function isAdmin()
    {
        return $this->role_id === 1; // Kiểm tra nếu role_id là 1
    }

    // Phương thức để kiểm tra quyền người dùng
    public function isUser()
    {
        return $this->role_id === 0 || $this->role_id === null; // Kiểm tra nếu role_id là 0 hoặc null
    }
    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }
}
