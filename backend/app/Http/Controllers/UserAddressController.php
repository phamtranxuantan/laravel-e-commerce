<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Address;
use App\Models\ShoppingCart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserAddressController extends Controller
{
    public function createUser(Request $request)
    {
        // Xác thực dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'fullname' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:255',
            'province' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'required|string|max:100',
            'orders_id' => 'nullable|integer|exists:orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Tạo người dùng mới
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Tạo địa chỉ mới
        $address = Address::create([
            'user_id' => $user->id,
            'fullname' => $request->fullname,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'province' => $request->province,
            'district' => $request->district,
            'ward' => $request->ward,
            'orders_id' => $request->orders_id,
        ]);

        // Thêm mục vào giỏ hàng nếu có
        if ($request->localCartList) {
            $cartList = json_decode($request->localCartList, true);
            foreach ($cartList as $cartArrayList) {
                foreach ($cartArrayList as $cartItem) {
                    $item = $user->cartItems()->where('stock_id', $cartItem['stock_id'])->first();
                    if (!$item) {
                        ShoppingCart::create([
                            'user_id' => $user->id,
                            'stock_id' => $cartItem['stock_id'],
                            'quantity' => $cartItem['quantity'],
                        ]);
                    }
                }
            }
        }

        // Cập nhật địa chỉ của người dùng
        $user->update(['addresses' => $address->id]);

        // Tạo token cho người dùng
        $token = JWTAuth::fromUser($user);

        return response()->json(compact('users', 'token'), 201);
    }

    public function show()
    {
        // Lấy người dùng hiện tại
        $user = JWTAuth::parseToken()->authenticate();

        // Trả về địa chỉ của người dùng
        return $user->addresses()->first();
    }

    public function store(Request $request)
    {
        // Xác thực người dùng hiện tại
        $user = JWTAuth::parseToken()->authenticate();

        // Xác thực dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'fullname' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:255',
            'province' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'required|string|max:100',
            'orders_id' => 'nullable|integer|exists:orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Tạo địa chỉ mới
        $address = Address::create([
            'user_id' => $user->id,
            'fullname' => $request->fullname,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'province' => $request->province,
            'district' => $request->district,
            'ward' => $request->ward,
            'orders_id' => $request->orders_id,
        ]);

        // Cập nhật địa chỉ của người dùng
        $user->update(['addresses' => $address->id]);

        return response()->json([
            'message' => 'Địa chỉ đã được thêm thành công.',
            'data' => $address,
        ], 201);
    }
}
