<?php

namespace App\Http\Controllers;

use App\Models\User; // Đảm bảo rằng bạn đã import model User
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
class UserAdminController extends Controller
{
    // Lấy danh sách người dùng
    // public function index(Request $request)
    // {
    //     // Lấy thông tin phân trang từ request
    //     $range = $request->input('range', [0, 9]); // Mặc định là 0 đến 9
    //     $start = (int)$range[0];
    //     $end = (int)$range[1];
    //     $perPage = $end - $start + 1; // Số lượng bản ghi trên mỗi trang

    //     // Lấy tổng số người dùng
    //     $total = User::count(); // Tổng số người dùng

    //     // Lấy dữ liệu người dùng với phân trang
    //     $users = User::orderBy('id', 'ASC')->skip($start)->take($perPage)->get(); // Lấy dữ liệu với phân trang

    //     // Chuyển đổi dữ liệu người dùng thành mảng
    //     $userData = $users->map(function ($user) {
    //         return [
    //             'id' => $user->id,
    //             'role_id' => $user->role_id,
    //             'name' => $user->name,
    //             'email' => $user->email,
    //             'phone_id' => $user->phone_id,
    //             'birthdate' => $user->birthdate,
    //             'gender' => $user->gender,
    //             'shipping_address' => $user->shipping_address,
    //             'created_at' => $user->created_at,
    //             'updated_at' => $user->updated_at,
    //         ];
    //     })->values(); // Đảm bảo rằng mảng đã được 're-indexed'

    //     // Ghi lại dữ liệu trước khi trả về
    //     Log::info('Users data:', ['data' => $userData->toArray()]); // Ghi log đúng định dạng
    //     Log::info('Total users:', ['total' => $total]); // Ghi tổng số người dùng

    //     // Trả về dữ liệu trực tiếp, không bọc trong đối tượng data
    //     return response()->json($userData->toArray())
    //         ->header('Content-Range', "users $start-$total/$total")
    //         ->header('Access-Control-Allow-Origin', '*') // Chấp nhận mọi nguồn gốc
    //         ->header('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count'); // Cho phép React Admin sử dụng các header này
    // }
    public function index(Request $request)
{
    $page = (int)$request->input('page', 1);
    $perPage = (int)$request->input('perPage', 10);

    $total = User::count(); // Tổng số bản ghi
    $users = User::with('phone') // Lấy số điện thoại
        ->orderBy('id', 'ASC')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();

    return response()->json($users)
        ->header('Content-Range', "users {$page}-$total/$total");
}



   // Thêm người dùng mới
   public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Thêm điều kiện xác nhận mật khẩu
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            // Không cần thêm 'role_id' nữa
        ]);
    // Tạo token cho người dùng
        $token = JWTAuth::fromUser($user);
         // Trả về thông tin người dùng và token
        // Chuyển đổi về dạng object
        return response()->json($user, 201);
    }

   // Lấy thông tin người dùng cụ thể
   public function show($id)
   {

       return User::findOrFail($id);
   }

   // Cập nhật thông tin người dùng
   public function update(Request $request, $id)
{
    // Validate các trường đầu vào
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $id,
        'password' => 'sometimes|nullable|min:6',
        'role_id' => 'required|integer|in:0,1',
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => 'validation_error', 'messages' => $validator->errors()], 422);
    }

    // Tìm user theo id
    $user = User::findOrFail($id);

    // Cập nhật thông tin user
    $user->name = $request->input('name');
    $user->email = $request->input('email');

    // Chỉ cập nhật mật khẩu nếu có thay đổi
    if ($request->filled('password')) {
        $user->password = bcrypt($request->input('password'));
    }

    $user->role_id = $request->input('role_id');

    // Lưu user
    $user->save();

    // Trả về dữ liệu user đã được cập nhật dưới dạng object JSON
    return response()->json($user, 200);
}



   // Xóa người dùng
   public function destroy($id)
   {
       $user = User::findOrFail($id);
       $user->delete();

       return response()->json(null, 204);
   }
   // Hàm xử lý đăng nhập

}
