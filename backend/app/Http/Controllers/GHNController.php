<?php

namespace App\Http\Controllers;

use App\Services\GhnService;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;
class GHNController extends Controller
{
    protected $ghnService;

    public function __construct(GhnService $ghnService)
    {
        $this->ghnService = $ghnService;
    }

    public function calculateShippingFee(Request $request)
{
    // Ghi log dữ liệu nhận từ frontend
    Log::info('Dữ liệu ở frontend: ', $request->all());

    // Lấy thông tin từ request
    $totalWeight = $request->input('weight'); // Lấy tổng trọng lượng
    $toDistrictCode = $request->input('to_district_id'); // Mã quận/huyện đích
    $toWardCode = $request->input('to_ward_code'); // Mã phường/xã đích

    // Kiểm tra đầu vào
    if (!$totalWeight || !$toDistrictCode || !$toWardCode) {
        Log::warning('Thiếu dữ liệu đầu vào: ', [
            'totalWeight' => $totalWeight,
            'toDistrictCode' => $toDistrictCode,
            'toWardCode' => $toWardCode,
        ]);
        return response()->json(['error' => 'Thiếu dữ liệu đầu vào'], 400);
    }

    // Các mã đã được sử dụng trong hàm trước
    $shippingData = [
        'from_district_id' => 3695,
        'service_type_id' => 2,
        'to_district_id' => $toDistrictCode,
        'to_ward_code' => $toWardCode,
        'weight' => $totalWeight, // Tổng trọng lượng
        'insurance_value' => 0, // Giá trị bảo hiểm
        'items' => $request->input('items', [])
        // 'items' => [
        //     [
        //         'name' => 'vivo3', // Tên sản phẩm
        //         'code' => 'VN123', // Mã sản phẩm (nếu có)
        //         'quantity' => 1, // Số lượng
        //         'weight' => 1000, // Trọng lượng của sản phẩm

        //     ]
        // ],
    ];


    // Ghi log thông tin chi tiết về dữ liệu vận chuyển
    Log::info('Dữ liệu gửi đến GHN:', $shippingData);

    try {
        $response = $this->ghnService->ShippingFee($shippingData);

        // Ghi log phản hồi từ GHN
        Log::info('Phản hồi từ GHN:', $response);

        // Kiểm tra phản hồi từ GHN
        if (isset($response['code']) && $response['code'] == 200) {
            return response()->json(['shippingFee' => $response['data']['total']]); // Trả về phí vận chuyển
        } else {
            // Ghi log lỗi nếu mã không phải 200
            Log::error('Lỗi từ GHN: ', [
                'message' => $response['message'],
                'code' => $response['code'],
            ]);
            throw new \Exception('Không thể tính phí vận chuyển: ' . $response['message']);
        }
    } catch (\Exception $e) {
        // Ghi log lỗi và trả về phản hồi lỗi cho client
        Log::error('Có lỗi xảy ra trong quá trình tính phí vận chuyển: ' . $e->getMessage());
        return response()->json(['error' => 'Có lỗi xảy ra trong quá trình tính phí vận chuyển'], 500);
    }
}

}
