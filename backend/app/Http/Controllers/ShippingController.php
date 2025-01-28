<?php

namespace App\Http\Controllers;

use App\Services\GhnService;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    protected $ghnService;

    public function __construct(GhnService $ghnService)
    {
        $this->ghnService = $ghnService;
    }

    public function createShippingOrder(Request $request)
    {
        // Chuẩn bị dữ liệu cho đơn hàng GHN
        $orderData = [
            'payment_type_id' => 2, // ví dụ, 2 là người nhận trả tiền (COD)
            'note' => 'Giao hàng nhanh',
            'required_note' => 'KHONGCHOXEMHANG',
            'to_name' => $request->input('to_name'),
            'to_phone' => $request->input('to_phone'),
            'to_address' => $request->input('to_address'),
            'to_ward_code' => $request->input('to_ward_code'),
            'to_district_id' => $request->input('to_district_id'),
            'weight' => $request->input('weight'), // Trọng lượng gói hàng
            'length' => $request->input('length'), // Chiều dài
            'width' => $request->input('width'), // Chiều rộng
            'height' => $request->input('height'), // Chiều cao
            'insurance_value' => $request->input('insurance_value'), // Giá trị bảo hiểm
            'cod_amount' => $request->input('cod_amount'), // Số tiền thu hộ
        ];

        // Gọi hàm tạo đơn hàng từ GHN Service
        $response = $this->ghnService->createOrder($orderData);

        // Trả về kết quả cho client
        return response()->json($response);
    }
}
