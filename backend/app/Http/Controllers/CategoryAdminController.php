<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Product;
use App\Models\Category;
class CategoryAdminController extends Controller
{
    public function index(Request $request)
    {
        // Lấy thông tin về phân trang nếu có
        $perPage = $request->input('perPage', 10); // Số lượng mỗi trang, mặc định là 10
        $page = $request->input('page', 1); // Trang hiện tại, mặc định là trang 1

        // Lấy các danh mục, sử dụng paginate để hỗ trợ phân trang
        $categories = Category::paginate($perPage, ['*'], 'page', $page);

        // Trả về một mảng các danh mục (không có bao bọc trong "data")
        return response()->json($categories->items())
            ->header('Content-Range', 'categories ' . ($perPage * ($page - 1)) . '-' . ($perPage * $page) . '/' . $categories->total());
    }
    public function show($id) {
        $Categories = Category::findOrFail($id);
        return response()->json($Categories);
    }
    public function store(Request $request)
    {
        // Kiểm tra dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'validation_error', 'messages' => $validator->errors()], 422);
        }

        // Tạo danh mục mới
        $category = new Category();
        $category->name = $request->input('name');
        $category->save();

        // Trả về danh mục vừa tạo dưới dạng object
        return response()->json($category, 201);
    }


    // Cập nhật danh mục
    public function update(Request $request, $id) {
        // Kiểm tra dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'validation_error', 'messages' => $validator->errors()], 422);
        }

        // Tìm danh mục theo id
        $category = Category::findOrFail($id);

        // Cập nhật tên danh mục
        $category->name = $request->input('name');
        $category->save();

        // Trả về dữ liệu danh mục sau khi cập nhật
        return response()->json($category);
    }


    // Xóa danh mục
    public function destroy($id)
    {
        // Tìm danh mục theo id
        $category = Category::findOrFail($id);

        // Xóa danh mục
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully'], 200);
    }
}
