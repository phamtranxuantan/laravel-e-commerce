<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Category::all();
    }
    public function new($categoryId) {

        $products = Product::with('category')->where('category_id', $categoryId)->orderBy ('id', 'desc')->take(4)->get();
        foreach ($products as $product) {
                if ($product->reviews()->exists()) {
                    $product['review'] = $product->reviews()->avg('rating');
        }
    }
        return $products;
    }
    public function topSelling($id, Request $request) {
        $page = $request->query('page', 1); // Lấy trang từ request, mặc định là trang 1
        $perPage = 3; // Số lượng sản phẩm trên mỗi trang

        // Tính chỉ số bắt đầu và kết thúc của danh sách sản phẩm dựa vào trang hiện tại
        $startIndex = ($page - 1) * $perPage;

        // Lấy danh sách sản phẩm theo category và sắp xếp theo số lượng đơn hàng giảm dần
        $products = Product::with('category')
            ->where('category_id', $id)
            ->get();

        // Tính toán số lượng đánh giá trung bình và số lượng đơn hàng cho từng sản phẩm
        foreach ($products as $product) {
            if ($product->reviews()->exists()) {
                $product['review'] = $product->reviews()->avg('rating');
            } else {
                $product['review'] = 0; // Nếu không có đánh giá, review sẽ là 0
            }

            if ($product->stocks()->exists()) {
                $num_orders = 0;
                $stocks = $product->stocks()->get();
                foreach ($stocks as $stock) {
                    $num_orders += $stock->orders()->count();
                }
                $product['num_orders'] = $num_orders;
            } else {
                $product['num_orders'] = 0; // Nếu không có hàng trong kho, num_orders sẽ là 0
            }
        }

        // Sắp xếp sản phẩm theo số lượng đơn hàng giảm dần và lấy ra các sản phẩm trong phạm vi của trang hiện tại
        $sortedProducts = $products->sortByDesc('num_orders')->values()->slice($startIndex, $perPage)->all();

        return response()->json($sortedProducts);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create([
            'name' => $request->name,
            // Add any other fields you need to save here
        ]);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category, $id)
    {
        try {
            // Find the category by ID
            $category = Category::findOrFail($id);

            // Optionally, load related products with category and paginate if needed
            // $category->load('products');

            // You may include additional logic here as needed

            return response()->json([
                'category' => $category,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch category details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        try {
            $category = Category::findOrFail($id);
            return response()->json([
                'category' => $category,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Category not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required',
        ]);
        try {
            $category = Category::findOrFail($id);
            $category->update([
                'name' => $request->name,
                // Add other fields to update here if needed
            ]);

            return response()->json([
                'message' => 'Category updated successfully',
                'category' => $category,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category, $id)
    {
        $category = Category::findOrFail($id);

        if ($category) {
            $category->delete();
        }
    }
}
