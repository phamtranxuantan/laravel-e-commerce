<?php

namespace App\Http\Controllers;
use App\Models\Stock;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProduct;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('category', 'stocks')
            ->paginate(10)
            ->map(function ($product) {
                if (!is_null($product->discount) && $product->discount > 0) {
                    // Nếu có giảm giá, tính giá giảm giá
                    $discountAmount = $product->price * ($product->discount / 100);
                    $product->discounted_price = $product->price - $discountAmount;
                } else {
                    $product->discounted_price = $product->price;
                }
                return $product;
            });

        return response()->json($products);
    }


    public function getNewProducts()
    {
        $now = Carbon::now();
        $sevenDaysAgo = $now->subDays(7);

        $newProducts = Product::where('created_at', '>=', $sevenDaysAgo)
            ->orderBy('created_at', 'desc')
            ->limit(value: 10)
            ->get()
            ->map(function ($product) {
                if (is_null($product->price_before)) {
                    $product->price_before = $product->price;
                }

                // Tính giá khuyến mãi
                $discountAmount = $product->price * ($product->discount / 100);
                $product->discounted_price = $product->price - $discountAmount;

                return $product;
            });

        return response()->json($newProducts);
    }

    public function getDiscountedProducts(Request $request)
    {
        // Số lượng sản phẩm hiển thị trên mỗi trang, có thể lấy từ request hoặc đặt mặc định
        $perPage = $request->get('per_page', 4);

        // Sử dụng paginate thay vì get để phân trang
        $discountedProducts = Product::whereNotNull('discount')
            ->where('discount', '>', 0)
            ->orderBy('discount', 'desc') // Sắp xếp theo phần trăm khuyến mãi giảm dần
            ->paginate($perPage) // Phân trang

            // Thêm xử lý giá khuyến mãi vào mỗi sản phẩm
            ->through(function ($product) {
                if (is_null($product->price_before)) {
                    $product->price_before = $product->price;
                }

                // Tính giá khuyến mãi
                $discountAmount = $product->price * ($product->discount / 100);
                $product->discounted_price = $product->price - $discountAmount;

                return $product;
            });

        // Trả về response với dữ liệu phân trang
        return response()->json($discountedProducts);
    }


    public function indexAdmin()
    {
        return Product::with('category', 'stocks')->paginate(10);
    }

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
//     public function show($id)
// {
//     // Tìm sản phẩm theo ID và load các quan hệ category và stocks
//     $product = Product::with('category', 'stocks')->findOrFail($id);

//     // Kiểm tra xem sản phẩm có đánh giá không
//     if ($product->reviews()->exists()) {
//         // Tính toán trung bình đánh giá và số lượng đánh giá
//         $product['review'] = $product->reviews()->avg('rating');
//         $product['num_reviews'] = $product->reviews()->count();
//     }

//     // Trả về sản phẩm dưới dạng JSON bao gồm các thông tin về category, stocks, và review
//     return response()->json([
//         'product' => $product,
//     ]);
// }



    public function showpRODUCTADMIN($id)
    {
        $product = Product::findOrFail($id);

        return response()->json([
            'product' => $product,
        ]);
    }
    public function show1($id)
    {
        $product = Product::with('category', 'stocks')->findOrFail($id);
        if ($product->reviews()->exists()) {
            $product['review'] = $product->reviews()->avg('rating');
            $product['num_reviews'] = $product->reviews()->count();
        }
        return $product;
    }
    public function store(Request $request)
    {
        Log::info($request->all());

        // Xác thực dữ liệu đầu vào
        $validatedData = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'category_id' => 'required|integer|exists:categories,id',
            'deal_id' => 'nullable|integer|exists:deals,id',
            'photos' => 'nullable|array', // Có thể không gửi hình ảnh
            'photos.*' => 'image|mimes:jpg,jpeg,png,gif|max:2048', // Mỗi ảnh phải hợp lệ
            'brand' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'details' => 'required|string',
            'price' => 'required|numeric',
            'discount' => 'nullable|integer',
        ]);

        // Lấy user_id nếu có hoặc từ auth
        $validatedData['user_id'] = $request->user_id ?: auth()->id();

        $photoPaths = []; // Mảng lưu trữ tên ảnh
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $filename = $photo->store('product', 'public'); // Lưu ảnh và lấy đường dẫn
                $photoPaths[] = basename($filename); // Lưu tên file vào mảng
            }
        }

        $validatedData['photo'] = json_encode($photoPaths); // Chuyển đổi mảng thành chuỗi JSON

        // Tạo sản phẩm mới
        $product = Product::create($validatedData);

        // Trả về phản hồi
        return response()->json([
            'message' => 'Product created successfully!',
            'product' => $product,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        Log::info('Received request to update product with ID: ' . $id);
        Log::info('Request method: ' . $request->method());
        Log::info('Request data: ', $request->all());
        Log::info('Raw request: ' . $request->getContent());
        Log::info('Category ID: ' . $request->input('category_id')); // Thêm dòng này

        try {
            // Xác thực dữ liệu đầu vào
            $validatedData = $request->validate([
                'user_id' => 'nullable|integer|exists:users,id',
                'category_id' => 'required|integer|exists:categories,id',
                'deal_id' => 'nullable|integer|exists:deals,id',
                'photos' => 'nullable|array', // Có thể không gửi hình ảnh
                'photos.*' => 'image|mimes:jpg,jpeg,png,gif|max:2048', // Mỗi ảnh phải hợp lệ
                'brand' => 'required|string|max:255',
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'details' => 'required|string',
                'price' => 'required|numeric',
                'discount' => 'nullable|integer',
            ]);

            Log::info('Updating product with ID: ' . $id);
            Log::info('Validated data: ', $validatedData);

            // Tìm sản phẩm
            $product = Product::findOrFail($id);

            // Xử lý hình ảnh
            $photoPaths = [];
            if ($request->hasFile('photos')) {
                // Xóa ảnh cũ nếu có
                if (!empty($product->photo)) {
                    $oldPhotos = json_decode($product->photo, true);
                    if (is_array($oldPhotos)) {
                        foreach ($oldPhotos as $oldPhoto) {
                            Storage::disk('public')->delete('product/' . $oldPhoto);
                        }
                    }
                }

                // Lưu ảnh mới và lấy đường dẫn
                foreach ($request->file('photos') as $photo) {
                    $filename = $photo->store('product', 'public');
                    $photoPaths[] = basename($filename);
                }
            } else {
                // Nếu không có ảnh mới, giữ lại ảnh cũ
                $photoPaths = json_decode($product->photo, true);
            }

            $validatedData['photo'] = json_encode($photoPaths);

            // Cập nhật sản phẩm
            $product->update($validatedData);

            return response()->json([
                'message' => 'Product updated successfully!',
                'product' => $product,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating product: ' . $e->getMessage()], 422);
        }
    }






    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product) {
            if ($product->photo != null) {
                foreach (json_decode($product->photo) as $photo) {
                    unlink(public_path() . '\\img\\' . $photo);
                }
            }
            $product->delete();
        }
    }
}





