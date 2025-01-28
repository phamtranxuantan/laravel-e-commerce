<?php
// Trong file app/Http/Controllers/PhoneController.php
namespace App\Http\Controllers;

use App\Models\Phone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PhoneController extends Controller
{
    // Hàm để tạo số điện thoại mới
    public function store(Request $request)
{
    // Validate input
    $validator = Validator::make($request->all(), [
        'phone_number' => 'required|string|max:15|unique:phones,phone_number',
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => 'validation_error', 'messages' => $validator->errors()], 422);
    }

    // Tạo mới số điện thoại
    $phone = Phone::create([
        'phone_number' => $request->input('phone_number'),
    ]);

    return response()->json(['phone' => $phone], 201);
}


    // Hàm để cập nhật số điện thoại hiện có
    public function updatePhone(Request $request, $id)
{
    // Validate input
    $validator = Validator::make($request->all(), [
        'phone_number' => 'required|string|max:15|unique:phones,phone_number,' . $id,
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => 'validation_error', 'messages' => $validator->errors()], 422);
    }

    // Find phone by ID and update
    $phone = Phone::find($id);
    if (!$phone) {
        return response()->json(['error' => 'phone_not_found'], 404);
    }

    $phone->phone_number = $request->input('phone_number');
    $phone->save();

    return response()->json(['phone' => $phone], 200);
}
public function checkPhone($phone)
{
    $phoneExists = Phone::where('phone_number', $phone)->exists();
    return response()->json(['exists' => $phoneExists]);
}
}
