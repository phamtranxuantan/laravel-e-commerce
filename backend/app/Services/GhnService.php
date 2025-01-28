<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;

class GhnService
{
    protected $apiUrl;
    protected $apiToken;
    protected $shopId;

    public function __construct()
    {
        $this->apiUrl = env('SHIPPING_API_URL');
        $this->apiToken = env('SHIPPING_API_TOKEN');
        $this->shopId = env('SHIPPING_SHOP_ID');
    }

    // Phương thức tạo đơn hàng
    public function createOrder($orderData)
    {
        $headers = [
            'Content-Type' => 'application/json',
            'Token' => $this->apiToken,
            'ShopId' => $this->shopId,
        ];

        $response = Http::withHeaders($headers)->post($this->apiUrl, $orderData);

        if ($response->successful()) {
            return $response->json();
        } else {
            return $response->throw()->json();
        }
    }

    // Phương thức lấy danh sách tỉnh/thành phố
    public function getProvinces()
    {
        $url = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province';
        $headers = [
            'Token' => $this->apiToken,
        ];

        $response = Http::withHeaders($headers)->get($url);

        if ($response->successful()) {
            return $response->json()['data']; // Trả về danh sách tỉnh
        } else {
            return $response->throw()->json();
        }
    }

    // Phương thức lấy danh sách quận/huyện theo mã tỉnh
    public function getDistricts($provinceId)
    {
        $url = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=' . $provinceId;
        $headers = [
            'Token' => $this->apiToken,
        ];

        $response = Http::withHeaders($headers)->get($url);

        if ($response->successful()) {
            return $response->json()['data']; // Trả về danh sách quận/huyện
        } else {
            return $response->throw()->json();
        }
    }

    // Phương thức lấy danh sách phường/xã theo mã quận/huyện
    public function getWards($districtId)
    {
        $url = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=' . $districtId;
        $headers = [
            'Token' => $this->apiToken,
        ];

        $response = Http::withHeaders($headers)->get($url);

        if ($response->successful()) {
            return $response->json()['data']; // Trả về danh sách phường/xã
        } else {
            return $response->throw()->json();
        }
    }
    public function ShippingFee($shippingFeeDetails)
    {
        // Lấy mã định danh cửa hàng từ file .env
        $storeId = env('SHIPPING_SHOP_ID'); // Lấy mã định danh cửa hàng từ .env

        // Thêm mã định danh cửa hàng vào chi tiết phí vận chuyển
        $shippingFeeDetails['shop_id'] = $storeId; // Thêm mã định danh cửa hàng vào request
        // Thay đổi service_type_id thành service_id nếu cần
        // $shippingFeeDetails['service_type_id'] = 5; // Thay số này theo yêu cầu của bạn

        // URL của API GHN
        $url = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee';

        // Gửi yêu cầu POST với tiêu đề và dữ liệu
        $response = Http::withHeaders([
            'Token' => $this->apiToken, // Thêm token từ file .env
            'ShopId' => $storeId, // Thêm mã định danh cửa hàng
        ])->post($url, $shippingFeeDetails);

        // Trả về phản hồi dưới dạng JSON
        return $response->json();
    }


}
