<?php

namespace App\Http\Controllers;


use App\Models\Category;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Product;
use Symfony\Component\HttpFoundation\File\UploadedFile;
class ProductAdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // Lấy danh sách sản phẩm
    // Lấy danh sách sản phẩm
    public function index(Request $request)
    {
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('perPage', 10);

        // Bao gồm danh mục cùng với sản phẩm
        $query = Product::with(['stocks', 'category']); // Thêm 'category' vào đây

        // Chuyển đổi chuỗi JSON thành mảng
        $filter = json_decode($request->input('filter'), true);
        $search = $filter['q'] ?? null;
        $descriptionId = $filter['description'] ?? null;
        $price = $filter['price'] ?? null;

        // Lọc theo tên sản phẩm (name)
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Lọc theo description ID
        if ($descriptionId !== null) {
            $description = Product::find($descriptionId)->description ?? null;
            if ($description) {
                $query->where('description', $description);
            }
        }

        // Lọc theo price
        if ($price !== null) {
            $query->where('price', '<=', $price);
        }

        // Pagination
        $total = $query->count();
        $products = $query->orderBy('id', 'ASC')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Cập nhật đường dẫn ảnh cho từng sản phẩm
        $products->transform(function ($product) {
            if ($this->isJson($product->photo)) {
                $photos = json_decode($product->photo);
                $product->photo = array_map(function($photo) {
                    return asset('img/' . $photo);
                }, $photos);
            } else {
                $product->photo = [asset('img/' . $product->photo)];
            }
            return $product;
        });

        // Trả về kết quả với thông tin paginated
        return response()->json($products)
            ->header('Content-Range', "products {$page}-{$total}/{$total}")
            ->header('X-Total-Count', $total);
    }

private function isJson($string)
{
    json_decode($string);
    return (json_last_error() === JSON_ERROR_NONE);
}
    // Lấy chi tiết một sản phẩm
    public function show($id)
{
    // Tìm sản phẩm theo ID
    $product = Product::with('stocks')->find($id);

    // Nếu không tìm thấy sản phẩm, trả về lỗi 404
    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    // Thêm đường dẫn ảnh cho sản phẩm
   // $product->photo = asset('img/' . json_decode($product->photo)[0]);

    // Trả về chi tiết sản phẩm mà không có trường data
    return response()->json($product);
}

    // Tạo một sản phẩm mới
    public function store(Request $request)
    {
        Log::info('Hàm store đã được gọi');

        // Xác thực dữ liệu
        $validatedData = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'details' => 'nullable|string',
            'price' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'brand' => 'required|string',
            'category_id' => 'required|integer',
            'weight' => 'nullable|numeric', // Trường weight
            'stocks' => 'nullable|array',   // Trường stocks
            'stocks.*.size' => 'required|string',
            'stocks.*.color' => 'required|string',
            'stocks.*.quantity' => 'required|integer',
        ]);

        // Tạo sản phẩm mới, mặc định trường photo là 'default_image.png'
        $product = Product::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'details' => $validatedData['details'],
            'price' => $validatedData['price'],
            'discount' => $validatedData['discount'],
            'brand' => $validatedData['brand'],
            'category_id' => $validatedData['category_id'],
            'user_id' => 1, // ID người dùng, có thể thay thế bằng giá trị thực
            'photo' => 'default_image.png', // Mặc định là ảnh default
            'weight' => $validatedData['weight'], // Trường weight
        ]);

        // Thêm thông tin stocks nếu có
        if (!empty($validatedData['stocks'])) {
            foreach ($validatedData['stocks'] as $stockData) {
                $product->stocks()->create([
                    'size' => $stockData['size'],
                    'color' => $stockData['color'],
                    'quantity' => $stockData['quantity'],
                ]);
            }
        }

        // Trả về dữ liệu sản phẩm kèm thông tin stocks
        $product->load('stocks'); // Tải quan hệ stocks để trả về dữ liệu đầy đủ

        return response()->json($product, 201); // Trả về sản phẩm đã tạo
    }

    // Cập nhật một sản phẩm
    // Cập nhật một sản phẩm
public function update(Request $request, $id)
{
    Log::info('Hàm update đã được gọi cho sản phẩm với ID: ' . $id);

    $product = Product::find($id);

    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    // Xác thực dữ liệu
    $validatedData = $request->validate([
        'name' => 'required|string',
        'description' => 'nullable|string',
        'details' => 'nullable|string',
        'price' => 'required|numeric',
        'discount' => 'nullable|numeric',
        'brand' => 'required|string',
        'category_id' => 'required|integer',
        'weight' => 'nullable|numeric', // Trường weight
        'stocks' => 'nullable|array',   // Trường stocks
        'stocks.*.size' => 'required|string',
        'stocks.*.color' => 'required|string',
        'stocks.*.quantity' => 'required|integer',
    ]);

    // Cập nhật thông tin sản phẩm
    $product->update([
        'name' => $validatedData['name'],
        'description' => $validatedData['description'],
        'details' => $validatedData['details'],
        'price' => $validatedData['price'],
        'discount' => $validatedData['discount'],
        'brand' => $validatedData['brand'],
        'category_id' => $validatedData['category_id'],
        'weight' => $validatedData['weight'], // Trường weight
        // Nếu cần cập nhật ảnh, có thể thêm dòng này
        // 'photo' => $validatedData['photo'] ?? $product->photo,
    ]);

    // Xóa các stocks cũ và thêm mới nếu có
    $product->stocks()->delete(); // Xóa tất cả stocks cũ

    // Thêm thông tin stocks mới nếu có
    if (!empty($validatedData['stocks'])) {
        foreach ($validatedData['stocks'] as $stockData) {
            $product->stocks()->create([
                'size' => $stockData['size'],
                'color' => $stockData['color'],
                'quantity' => $stockData['quantity'],
            ]);
        }
    }

    // Tải quan hệ stocks để trả về dữ liệu đầy đủ
    $product->load('stocks');

    return response()->json($product);
}


    // Xóa một sản phẩm
        public function destroy($id)
        {
            $product = Product::findOrFail($id);
            $product->delete();

            return response()->json(['message' => 'Product deleted successfully']);
        }
        public function getPhoto($id)
        {
            $product = Product::with('stocks')->find($id);

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            // Kiểm tra nếu photo là một chuỗi JSON thì mới giải mã
            if ($this->isJson($product->photo)) {
                $photos = json_decode($product->photo);
                // Tạo đường dẫn đầy đủ cho tất cả các ảnh
                $product->photo = array_map(function($photo) {
                    return asset('img/' . $photo);
                }, $photos);
            } else {
                // Nếu không phải là JSON, sử dụng giá trị trực tiếp
                $product->photo = [asset('img/' . $product->photo)];
            }

            return response()->json($product);
        }
        //hàm upload ảnh
        public function uploadImage(Request $request, $id)
        {
            $product = Product::findOrFail($id);

            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                $filename = time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('img/'), $filename);

                // Lấy mảng hiện tại của ảnh, nếu không có thì khởi tạo một mảng rỗng
                $photos = json_decode($product->photo, true) ?? [];
                // Thêm tên file mới vào mảng
                $photos[] = $filename;

                // Cập nhật trường photo trong CSDL
                $product->photo = json_encode($photos);
                $product->save();

                return response()->json(['message' => 'Ảnh đã được upload thành công!', 'photo' => $filename]);
            }

            return response()->json(['error' => 'Không có ảnh nào được chọn'], 400);
        }
        //hàm xóa ảnh
        public function removeImage(Request $request, $id)
        {
            // Lấy sản phẩm theo ID
            $product = Product::find($id);

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            // Lấy danh sách ảnh hiện có
            $photos = json_decode($product->photo, true);

            // Xóa ảnh từ storage
            if ($request->input('photo')) {
                $imageToRemove = $request->input('photo');

                // Chuyển đổi tên file thành đường dẫn đầy đủ
                $imageToRemoveBasename = basename($imageToRemove);

                // Kiểm tra xem ảnh có trong danh sách không
                $fullPathPhotos = array_map(function($photo) {
                    return url('img/' . $photo);
                }, $photos);

                if (($key = array_search($imageToRemove, $fullPathPhotos)) !== false) {
                    unset($photos[$key]); // Xóa ảnh khỏi mảng

                    // Xóa ảnh thực tế từ storage
                    Storage::delete('public/product/' . $imageToRemoveBasename); // xóa ảnh trong thư mục storage

                    // Cập nhật lại trường photo trong sản phẩm
                    $product->photo = json_encode(array_values($photos));
                    $product->save();

                    Log::info('Removed image: ', ['product_id' => $id, 'image' => $imageToRemove]);
                    return response()->json(['message' => 'Image removed successfully.']);
                } else {
                    return response()->json(['message' => 'Image not found in product photos.'], 404);
                }
            }

            return response()->json(['message' => 'Image parameter is required.'], 400);
        }
        // Hàm cập nhật ảnh
        //hàm này xử dụng phương thức PUT nhưng không thành công , cần xem lại
        //     public function updateImage(Request $request, $id)
        // {
        //     Log::info('Bắt đầu cập nhật ảnh cho sản phẩm với ID: ' . $id);

        //     $product = Product::findOrFail($id);
        //     $photos = json_decode($product->photo, true) ?? [];

        //     // Lấy đường dẫn ảnh cũ và ảnh mới từ request
        //     $oldImageUrl = $request->input('old_image'); // Kiểm tra xem có lấy được không
        //     $newImage = $request->file('photo'); // Kiểm tra xem có lấy được không

        //     Log::info('Ảnh cũ: ' . $oldImageUrl);
        //     Log::info('Ảnh mới: ' . ($newImage ? $newImage->getClientOriginalName() : 'Không có ảnh mới'));

        //     if (!$newImage) {
        //         Log::warning('Không có file ảnh mới nào được nhận.');
        //         return response()->json(['error' => 'Không có file ảnh mới nào được nhận.'], 400);
        //     }
        //     if ($oldImageUrl && $newImage) {
        //         // Chuyển đổi URL của ảnh cũ thành tên file
        //         $oldImageBasename = basename($oldImageUrl);
        //         // Kiểm tra và xóa ảnh cũ khỏi mảng
        //         if (($key = array_search($oldImageBasename, $photos)) !== false) {
        //             unset($photos[$key]); // Xóa ảnh cũ khỏi mảng
        //             // Xóa ảnh thực tế từ storage
        //             if (Storage::delete('public/product/' . $oldImageBasename)) {
        //                 Log::info('Đã xóa ảnh cũ: ' . $oldImageBasename);
        //             } else {
        //                 Log::warning('Không thể xóa ảnh cũ: ' . $oldImageBasename);
        //             }
        //         } else {
        //             Log::warning('Ảnh cũ không tìm thấy trong danh sách: ' . $oldImageBasename);
        //         }

        //         // Xử lý file ảnh mới
        //         $filename = time() . '.' . $newImage->getClientOriginalExtension();
        //         $newImage->move(public_path('img/'), $filename);

        //         // Thêm ảnh mới vào mảng
        //         $photos[] = $filename; // Chỉ lưu tên file mới
        //         Log::info('Đã thêm ảnh mới: ' . $filename);
        //     } else {
        //         Log::warning('Không thể cập nhật ảnh vì thiếu thông tin.');
        //     }

        //     // Cập nhật lại mảng ảnh
        //     $product->photo = json_encode(array_values($photos));
        //     $product->save();

        //     Log::info('Cập nhật ảnh thành công cho sản phẩm ID: ' . $id);

        //     return response()->json(['message' => 'Ảnh đã được cập nhật thành công!', 'photos' => $photos]);
        // }
        public function updateImage(Request $request, $id)
    {
        //Log::info('Bắt đầu cập nhật ảnh cho sản phẩm với ID: ' . $id);

        // Log toàn bộ dữ liệu nhận được
        //Log::info('Dữ liệu nhận được: ', $request->all());

        $product = Product::findOrFail($id);
        $photos = json_decode($product->photo, true) ?? [];

        // Lấy đường dẫn ảnh cũ và ảnh mới từ request
        $oldImageUrl = $request->input('old_image');
        $newImage = $request->file('photo');

        // Log::info('Ảnh cũ: ' . ($oldImageUrl ?: 'Không có ảnh cũ'));
        // Log::info('Ảnh mới: ' . ($newImage ? $newImage->getClientOriginalName() : 'Không có ảnh mới'));

        if (!$newImage) {
            //Log::warning('Không có file ảnh mới nào được nhận.');
            return response()->json(['error' => 'Không có file ảnh mới nào được nhận.'], 400);
        }

        if ($oldImageUrl && $newImage) {
            // Chuyển đổi URL của ảnh cũ thành tên file
            $oldImageBasename = basename($oldImageUrl);

            if (($key = array_search($oldImageBasename, $photos)) !== false) {
                unset($photos[$key]);
                if (Storage::delete('public/product/' . $oldImageBasename)) {
                    //Log::info('Đã xóa ảnh cũ: ' . $oldImageBasename);
                } else {
                    //Log::warning('Không thể xóa ảnh cũ: ' . $oldImageBasename);
                }
            } else {
                //Log::warning('Ảnh cũ không tìm thấy trong danh sách: ' . $oldImageBasename);
            }

            $filename = time() . '.' . $newImage->getClientOriginalExtension();
            $newImage->move(public_path('img/'), $filename);

            $photos[] = $filename;
            //Log::info('Đã thêm ảnh mới: ' . $filename);
        } else {
            //Log::warning('Không thể cập nhật ảnh vì thiếu thông tin.');
        }

        $product->photo = json_encode(array_values($photos));
        $product->save();

        // Log::info('Cập nhật ảnh thành công cho sản phẩm ID: ' . $id);

        return response()->json(['message' => 'Ảnh đã được cập nhật thành công!', 'photos' => $photos]);
    }

}
