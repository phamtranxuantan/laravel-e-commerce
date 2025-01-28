<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class AddressController extends Controller
{
    public function __construct()
    {
        // Áp dụng middleware 'jwt.auth' cho toàn bộ controller
        $this->middleware('jwt.auth');
    }

    /**
     * Lưu thông tin địa chỉ vào cơ sở dữ liệu.
     */
    public function store(Request $request)
    {
        // Xác thực dữ liệu đầu vào
        $validatedData = $request->validate([
            'fullname' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:255',
            'province' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'required|string|max:100',
            'orders_id' => 'nullable|integer|exists:orders,id',
        ]);

        // Lấy ID người dùng hiện tại
        $user = JWTAuth::parseToken()->authenticate();
        $validatedData['user_id'] = $user->id;

        // Tạo bản ghi mới
        $address = Address::create($validatedData);

        // Trả về phản hồi hoặc điều hướng
        return response()->json([
            'message' => 'Địa chỉ đã được thêm thành công.',
            'data' => $address,
        ], 201);
    }
}
