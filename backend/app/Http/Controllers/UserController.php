<?php

namespace App\Http\Controllers;

use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\Phone;
use Tymon\JWTAuth\Exceptions\JWTFactory;
use Tymon\JWTAuth\Claims\Subject;
use Tymon\JWTAuth\Exceptions\PayloadFactory;
use Tymon\JWTAuth\JWTManager as JWT;
class UserController extends Controller
{
    public function register(Request $request)
    {
        // Lấy tất cả dữ liệu từ request, không phân biệt dạng dữ liệu
        $data = $request->all();

        // Thực hiện validate dữ liệu
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'password_confirmation' => 'required|string|same:password',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Tạo user mới với dữ liệu đã validate
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Tạo token cho user mới
        $token = JWTAuth::fromUser($user);

        return response()->json(compact('user', 'token'), 201);
    }
    public function login(Request $request)
    {
        Log::info('Login attempt', $request->all()); // Log thông tin nhận được

        // Validate đầu vào để đảm bảo email và password đều có trong yêu cầu
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'validation_error', 'messages' => $validator->errors()], 422);
        }

        // Lấy thông tin đăng nhập từ yêu cầu
        $credentials = $request->only('email', 'password');

        try {
            // Thử đăng nhập với thông tin cung cấp
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'invalid_credentials'], 400);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'could_not_create_token'], 500);
        }

        // Lấy thông tin người dùng sau khi đăng nhập thành công
        $user = auth()->user();

        // Kiểm tra role_id của người dùng
        $role_id = $user->role_id;

        // Trả về thông tin user, role_id và token
        return response()->json([
            'user' => $user,        // Thông tin người dùng
            'role_id' => $role_id,  // Vai trò của người dùng
            'token' => $token       // JWT token
        ]);
    }
    public function refreshToken(Request $request)
    {
        try {
            $token = JWTAuth::getToken();
            if (!$token) {
                return response()->json(['error' => 'token_not_provided'], 400);
            }

            $newToken = JWTAuth::refresh($token);
            return response()->json(['token' => $newToken]);
        } catch (TokenExpiredException $e) {
            return response()->json(['error' => 'token_expired'], $e->getCode());
        } catch (TokenInvalidException $e) {
            return response()->json(['error' => 'token_invalid'], $e->getCode());
        } catch (JWTException $e) {
            return response()->json(['error' => 'token_absent'], $e->getCode());
        }
    }

    // public function login(Request $request)
    // {
    //     Log::info('Login attempt', $request->all()); // Log thông tin nhận được
    //     // Validate đầu vào để đảm bảo email và password đều có trong yêu cầu
    //     $validator = Validator::make($request->all(), [
    //         'email' => 'required|email',
    //         'password' => 'required|string|min:6',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json(['error' => 'validation_error', 'messages' => $validator->errors()], 422);
    //     }

    //     // Lấy thông tin đăng nhập từ yêu cầu
    //     $credentials = $request->only('email', 'password');

    //     try {
    //         // Thử đăng nhập với thông tin cung cấp
    //         if (!$token = JWTAuth::attempt($credentials)) {
    //             return response()->json(['error' => 'invalid_credentials'], 400);
    //         }
    //     } catch (JWTException $e) {
    //         return response()->json(['error' => 'could_not_create_token'], 500);
    //     }

    //     // Lấy thông tin người dùng đăng nhập thành công
    //     $user = auth()->user();
    //     return response()->json(compact('user', 'token'));
    // }


    public function getUser(Request $request)
        {
            try {
                if (!$user = JWTAuth::parseToken()->authenticate()) {
                    return response()->json(['user_not_found'], 404);
                }
            } catch (TokenExpiredException $e) {
                return response()->json(['error' => 'token_expired'], $e->getCode());
            } catch (TokenInvalidException $e) {
                return response()->json(['error' => 'token_invalid'], $e->getCode());
            } catch (JWTException $e) {
                return response()->json(['error' => 'token_absent'], $e->getCode());
            }
             // Lấy thông tin số điện thoại từ mối quan hệ và gán trực tiếp
             $user->phone_number = $user->phone ? $user->phone->phone_number : null;
             unset($user->phone); // Loại bỏ 'phone' khỏi kết quả trả về
            return response()->json(compact('user'));
        }


    public function updateUser(Request $request, $id)
    {
        // Validate the incoming data
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'phone_id' => 'sometimes|exists:phones,id',
            'phone_number' => [
                'sometimes',
                'string',
                'max:11',
                function ($attribute, $value, $fail) use ($request) {
                    // Check if phone number exists and is not associated with the current user
                    if (Phone::where('phone_number', $value)
                            ->where('id', '!=', $request->input('phone_id'))
                            ->exists()) {
                        $fail('The phone number is already in use by another user.');
                    }
                },
            ],
            'birthdate' => 'sometimes|date',
            'gender' => 'sometimes|string|in:nam,nữ,khác',
            'shipping_address' => 'sometimes|string|max:255',
            'current_password' => 'sometimes|required_with:password|string|min:6',
            'password' => 'sometimes|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'validation_error', 'messages' => $validator->errors()], 422);
        }

        try {
            // Find the user by ID
            $user = User::find($id);

            if (!$user) {
                return response()->json(['error' => 'user_not_found'], 404);
            }

            // Check if current_password matches the user's password
            if ($request->filled('current_password') && !Hash::check($request->current_password, $user->password)) {
                return response()->json(['error' => 'current_password_incorrect'], 400);
            }

            // Update user details
            $user->update($request->only([
                'name',
                'email',
                'phone_id',
                'birthdate',
                'gender',
                'shipping_address'
            ]));

            // Update phone if phone_id and phone_number are provided
            if ($request->has('phone_id') && $request->has('phone_number')) {
                $phone = Phone::find($request->input('phone_id'));

                if ($phone) {
                    $phone->phone_number = $request->input('phone_number');
                    $phone->save();
                } else {
                    return response()->json(['error' => 'phone_not_found'], 404);
                }
            }

            // Update password if provided
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
                $user->save();
            }

            return response()->json(['user' => $user], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'update_failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function updatePassword(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            // Kiểm tra mật khẩu cũ
            if (!Hash::check($request->input('old_password'), $user->password)) {
                return response()->json(['error' => 'Mật khẩu cũ không chính xác'], 400);
            }

            // Cập nhật mật khẩu mới
            $user->password = Hash::make($request->input('new_password'));
            $user->save();

            return response()->json(['message' => 'Mật khẩu đã được cập nhật']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Có lỗi xảy ra'], 500);
        }
    }
    //login facebook
    public function facebookLogin(Request $request)
    {
        $accessToken = $request->input('accessToken');

        // Gọi Facebook API để lấy thông tin người dùng
        $response = Http::get("https://graph.facebook.com/me?access_token={$accessToken}&fields=id,name,email");

        if ($response->successful()) {
            $facebookUser = $response->json();
            $email = $facebookUser['email'];
            $name = $facebookUser['name'];

            // Tìm hoặc tạo người dùng trong cơ sở dữ liệu
            $user = User::firstOrCreate(['email' => $email], ['name' => $name]);

            // Tạo token để người dùng đăng nhập
            $token = $user->createToken('Facebook Login')->accessToken;

            return response()->json(['token' => $token, 'user' => $user]);
        } else {
            return response()->json(['error' => 'Unable to fetch user data from Facebook'], 400);
        }
    }

}
