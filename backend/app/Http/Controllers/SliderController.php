<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Slider;
class SliderController extends Controller
{
    /**
     * Get all sliders.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Lấy tất cả slider từ cơ sở dữ liệu
        $sliders = Slider::all();

        // Thay đổi URL của ảnh để phản ánh cấu trúc thư mục public
        $sliders->map(function ($slider) {
            $slider->image_url = url('storage/sliders/' . $slider->image_url);
            return $slider;
        });

        // Trả về dữ liệu dưới dạng JSON
        return response()->json($sliders);
    }
}
