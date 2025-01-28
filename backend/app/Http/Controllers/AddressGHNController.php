<?php



namespace App\Http\Controllers;

use App\Services\GhnService;
use Illuminate\Http\Request;
class AddressGHNController extends Controller
{
    protected $ghnService;

    public function __construct(GhnService $ghnService)
    {
        $this->ghnService = $ghnService;
    }

    // Lấy danh sách tỉnh/thành phố
    public function getProvinces()
    {
        $provinces = $this->ghnService->getProvinces();
        return response()->json($provinces);
    }

    // Lấy danh sách quận/huyện theo mã tỉnh
    public function getDistricts($provinceId)
    {
        $districts = $this->ghnService->getDistricts($provinceId);
        return response()->json($districts);
    }

    // Lấy danh sách phường/xã theo mã quận/huyện
    public function getWards($districtId)
    {
        $wards = $this->ghnService->getWards($districtId);
        return response()->json($wards);
    }
}
