<?php

namespace App\Http\Controllers;
use App\Models\Product;
use Illuminate\Http\Request;
class SearchController extends Controller
{
    public function search(Request $request)
    {
        $keyword = $request->input('keyword');

        if (!$keyword) {
            return response()->json([
                'message' => 'Vui lòng nhập từ khóa để tìm kiếm.'
            ], 400);
        }

        $products = Product::where('name', 'LIKE', "%{$keyword}%")
            ->orWhere('description', 'LIKE', "%{$keyword}%")
            ->with('category', 'stocks')
            ->get();

        if ($products->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm nào phù hợp.'
            ], 404);
        }

        return response()->json($products);
    }
}
