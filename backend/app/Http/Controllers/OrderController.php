<?php

namespace App\Http\Controllers;
use App\Http\Controllers\GHNController;
use App\Models\Orders;
use App\Models\Address;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Product;
use App\Models\OrderDetail;
use App\Models\ShoppingCart;
use App\Services\GhnService;
use App\Models\Stock;
use Illuminate\Support\Facades\Log;
class OrderController extends Controller
{
    protected $ghnService;

    // Inject GHN Service thông qua constructor
    public function __construct(GhnService $ghnService)
    {
        $this->ghnService = $ghnService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store()
    {
      //
    }
    //tạo một đơn hàng trong csdl để lấy id đơn hàng
    public function createOrder(Request $request)
{
    Log::info('Dữ liệu ở frontend: ', $request->all());

    try {
        // Xác thực người dùng với JWT
        $user = JWTAuth::parseToken()->authenticate();
        $cartItems = ShoppingCart::where('user_id', $user->id)->get();

        // Kiểm tra giỏ hàng có trống không
        if ($cartItems->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        // Validate dữ liệu yêu cầu
        $request->validate([
            'fullname' => 'required|string|max:255', // Tên người đặt hàng
            'phone' => 'required|string|max:20', // Số điện thoại người đặt hàng
            'email' => 'required|email|max:255',
            'province' => 'required|array', // Thay đổi thành array
            'district' => 'required|array', // Thay đổi thành array
            'ward' => 'required|array', // Thay đổi thành array
            'address' => 'required|string|max:255', // Địa chỉ giao hàng
        ]);

        // Tính tổng số tiền và trọng lượng
        $totalAmount = 0;
        $totalWeight = 0;
        $items = [];

        foreach ($cartItems as $item) {
            Log::info('Checking product with stock_id: ' . $item->stock_id);

            // Lấy thông tin stock
            $stock = Stock::findOrFail($item->stock_id);

            // Kiểm tra sản phẩm có tồn tại
            $product = Product::find($stock->product_id);
            if (!$product) {
                return response()->json(['error' => 'Sản phẩm không tồn tại'], 404);
            }

            $totalAmount += $product->price * $item->quantity;
            $totalWeight += $product->weight * $item->quantity; // Cộng tổng trọng lượng

            // Thêm chi tiết sản phẩm vào danh sách để gửi đi
            $items[] = [
                'name' => $product->name,
                'code' => $product->sku,
                'quantity' => $item->quantity,
                'price' => $product->price,
                'weight' => $product->weight,
                'category' => [
                    'level1' => $product->category->name,
                ],
            ];
        }

        // Tính số tiền COD từ tổng số tiền sản phẩm
        $cod_amount = $totalAmount; // Gán số tiền COD bằng tổng số tiền sản phẩm

        // Gọi hàm tính phí vận chuyển từ GHNController
        $shippingController = app()->make(GHNController::class);
        $shippingRequest = new Request([
            'weight' => $totalWeight,
            'to_district_id' => (int) $request->district['code'],
            'to_ward_code' => $request->ward['code'],
            'items' => $items,
        ]);

        $shippingFeeResponse = $shippingController->calculateShippingFee($shippingRequest);

        if ($shippingFeeResponse->getStatusCode() != 200) {
            return response()->json(['error' => 'Không thể tính phí vận chuyển'], 400);
        }

        $shippingFee = json_decode($shippingFeeResponse->getContent(), true)['shippingFee'];

        // Tạo đơn hàng trong cơ sở dữ liệu
        $order = Orders::create([
            'user_id' => $user->id,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'shipping_fee' => $shippingFee,
        ]);

        // Tạo chi tiết đơn hàng
        foreach ($cartItems as $item) {
            $stock = Stock::findOrFail($item->stock_id);
            $product = Product::find($stock->product_id);

            OrderDetail::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $item->quantity,
                'price' => $product->price,
            ]);
        }

        // Gửi đơn hàng lên GHN
        $orderDetails = [
            'payment_type_id' => 2, // Gán cứng
            'note' => 'Đơn hàng dễ vỡ.', // Ghi chú
            'return_phone' => $request->phone, // Số điện thoại trả hàng
            'return_address' => $request->address, // Địa chỉ trả hàng
            'to_name' => $request->fullname, // Tên người đặt hàng
            'to_phone' => $request->phone, // Số điện thoại người đặt hàng
            'to_address' => $request->address, // Địa chỉ của người đặt hàng
            'to_ward_code' => $request->ward['code'], // Mã phường xã
            'to_district_id' => $request->district['code'], // Mã quận huyện
            'cod_amount' => $cod_amount, // Tổng tiền COD
            'content' => "Giao hàng từ {$user->name}", // Nội dung giao hàng
            'weight' => $totalWeight, // Tổng trọng lượng
            'pick_station_id' => 1444, // Gán cứng
            'service_type_id' => 2, // Gán cứng
            'pick_shift' => [2], // Ca lấy hàng
            'items' => $items, // Danh sách sản phẩm
            'required_note' => 'KHONGCHOXEMHANG', // Ghi chú yêu cầu
        ];

        // Gọi API GHN để tạo đơn hàng
        $responseData = $this->ghnService->createOrder($orderDetails);

        // Kiểm tra phản hồi từ GHN
        if (isset($responseData['code']) && $responseData['code'] == 200) {
            // Lưu mã đơn hàng GHN vào bảng orders
            $ghnOrderCode = $responseData['data']['order_code'];

            $order->ghn_order_code = $ghnOrderCode;
            $order->save();

            // Lưu địa chỉ vào cơ sở dữ liệu
            Address::create([
                'user_id' => $user->id,
                'fullname' => $request->fullname,
                'phone' => $request->phone,
                'email' => $request->email,
                'province' => $request->province['name'],
                'district' => $request->district['name'],
                'ward' => $request->ward['name'],
                'address' => $request->address,
                'orders_id' => $order->id,
            ]);
            ShoppingCart::where('user_id', $user->id)->delete();
            // Trả về phản hồi thành công với tổng số tiền
            return response()->json([
                'message' => 'Order created successfully',
                'order_id' => $order->id,
                'total_amount' => $totalAmount // Gửi tổng số tiền về frontend
            ], 200);

        } else {
            return response()->json(['message' => 'Error creating order', 'error' => $responseData], 400);
        }


    } catch (\Exception $e) {
        Log::error('Error in createOrder: ' . $e->getMessage());
        return response()->json(['message' => 'API Request failed', 'error' => $e->getMessage()], 500);
    }

}


    /**
     * Store a newly created resource in storage.
     */
    public function create(Request $request)
{
    Log::info('Dữ liệu ở frontend: ', $request->all());
    try {
        // Xác thực người dùng với JWT
        $user = JWTAuth::parseToken()->authenticate();
        $cartItems = ShoppingCart::where('user_id', $user->id)->get();

        // Kiểm tra giỏ hàng có trống không
        if ($cartItems->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        // Validate dữ liệu từ request
        $request->validate([
            'fullname' => 'required|string|max:255', // Tên người đặt hàng
            'phone' => 'required|string|max:20', // Số điện thoại người đặt hàng
            'email' => 'required|email|max:255',
            'province' => 'required|array', // Thay đổi thành array
            'district' => 'required|array', // Thay đổi thành array
            'ward' => 'required|array', // Thay đổi thành array
            'address' => 'required|string|max:255', // Địa chỉ giao hàng
        ]);

        // Gán cứng các giá trị
        $payment_type_id = 2; // Phương thức thanh toán
        $note = 'Đơn hàng dễ vỡ.'; // Ghi chú
        $pick_station_id = 1444; // ID của bưu cục lấy hàng
        $service_type_id = 2; // ID loại dịch vụ
        $required_note = 'KHONGCHOXEMHANG'; // Ghi chú yêu cầu

        // Tính tổng số tiền và trọng lượng
        $totalAmount = 0;
        $totalWeight = 0;
        $items = [];
        foreach ($cartItems as $item) {
            $stock = Stock::findOrFail($item->stock_id);
            $product = Product::find($stock->product_id);

            if (!$product) {
                return response()->json(['error' => 'Sản phẩm không tồn tại'], 404);
            }

            $totalAmount += $product->price * $item->quantity;
            $totalWeight += $product->weight * $item->quantity; // Cộng tổng trọng lượng

            // Thêm chi tiết sản phẩm vào đơn hàng
            $items[] = [
                'name' => $product->name,
                'code' => $product->sku, // Hoặc mã sản phẩm
                'quantity' => $item->quantity,
                'price' => $product->price,
                'weight' => $product->weight,
                'category' => [
                    'level1' => $product->category->name, // Lấy tên danh mục cấp 1
                ],
            ];
        }

        // Tính số tiền COD từ tổng số tiền sản phẩm
        $cod_amount = $totalAmount; // Gán số tiền COD bằng tổng số tiền sản phẩm
        // Gọi hàm tính phí vận chuyển từ ShippingController
        $shippingController = app()->make(GHNController::class);
        $shippingRequest = new Request([
            'weight' => $totalWeight,
            'to_district_id' => (int) $request->district['code'],
            'to_ward_code' => $request->ward['code'],
            'items' => $items
        ]);

        $shippingFeeResponse = $shippingController->calculateShippingFee($shippingRequest);

        if ($shippingFeeResponse->getStatusCode() != 200) {
            return response()->json(['error' => 'Không thể tính phí vận chuyển'], 400);
        }

        $shippingFee = json_decode($shippingFeeResponse->getContent(), true)['shippingFee'];

        // Tạo đơn hàng trong cơ sở dữ liệu
        $order = Orders::create([
            'user_id' => $user->id,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'shipping_fee' => $shippingFee,
            // Thêm trường ghn_order_code vào đây
        ]);

        // Gửi đơn hàng lên GHN
        $orderDetails = [
            'payment_type_id' => $payment_type_id, // Gán cứng
            'note' => $note, // Gán cứng
            'return_phone' => $request->phone, // Số điện thoại trả hàng
            'return_address' => $request->address, // Địa chỉ trả hàng
            'to_name' => $request->fullname, // Sử dụng tên của người đặt hàng
            'to_phone' => $request->phone, // Sử dụng số điện thoại của người đặt hàng
            'to_address' => $request->address, // Sử dụng địa chỉ của người đặt hàng
            'to_ward_code' => $request->ward['code'], // Lấy mã phường xã
            'to_district_id' => $request->district['code'], // Lấy mã quận huyện
            'cod_amount' => $cod_amount, // Tổng tiền COD được lấy từ tổng số tiền sản phẩm
            'content' => "Giao hàng từ {$user->name}", // Nội dung giao hàng
            'weight' => $totalWeight, // Tổng trọng lượng của đơn hàng
            'pick_station_id' => $pick_station_id, // Gán cứng
            'service_type_id' => $service_type_id, // Gán cứng
            'pick_shift' => [2], // Ca lấy hàng
            'items' => $items, // Danh sách sản phẩm
            'required_note' => $required_note, // Gán cứng
        ];

        // Gọi API GHN để tạo đơn hàng
        $responseData = $this->ghnService->createOrder($orderDetails);

        // Kiểm tra phản hồi từ GHN
        if (isset($responseData['code']) && $responseData['code'] == 200) {
            // Lưu mã đơn hàng GHN vào bảng orders
            $ghnOrderCode = $responseData['data']['order_code']; // Giả sử mã đơn hàng nằm trong phản hồi

            $order->ghn_order_code = $ghnOrderCode; // Cập nhật mã đơn hàng GHN
            $order->save(); // Lưu thông tin đơn hàng

            // Lưu địa chỉ vào cơ sở dữ liệu
            Address::create([
                'user_id' => $user->id,
                'fullname' => $request->fullname,
                'phone' => $request->phone,
                'email' => $request->email,
                'province' => $request->province['name'], // Gửi tên tỉnh
                'district' => $request->district['name'], // Gửi tên quận huyện
                'ward' => $request->ward['name'], // Gửi tên xã
                'address' => $request->address,
                'orders_id' => $order->id, // Liên kết địa chỉ với đơn hàng
            ]);

            // Xóa giỏ hàng sau khi tạo đơn hàng
            ShoppingCart::where('user_id', $user->id)->delete();

            return response()->json(['message' => 'Order created successfully', 'data' => $responseData], 200);
        } else {
            return response()->json(['message' => 'Error creating order', 'error' => $responseData], 400);
        }

    } catch (\Exception $e) {
        Log::error('Error in createOrder: ' . $e->getMessage());
        return response()->json(['message' => 'API Request failed', 'error' => $e->getMessage()], 500);
    }
}






    /**
     * Display the specified resource.
     */
    public function show(Orders $Orders)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Orders $Orders)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Orders $Orders)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Orders $Orders)
    {
        //
    }
    public function getUserOrders(Request $request)
    {
        try {
            // Lấy thông tin người dùng từ token
            $user = JWTAuth::parseToken()->authenticate();

            // Kiểm tra xem người dùng đã đăng nhập hay chưa
            if (!$user) {
                return response()->json(['error' => 'Bạn cần phải đăng nhập để xem đơn hàng.'], 401);
            }

            // Lấy đơn hàng của người dùng, kèm theo thông tin chi tiết sản phẩm
            $orders = Orders::where('user_id', $user->id)
                ->with(['orderDetails.product','addresses']) // Eager load thông tin sản phẩm cho mỗi chi tiết đơn hàng
                ->get();

            // Nếu không có đơn hàng, trả về thông báo
            if ($orders->isEmpty()) {
                return response()->json(['message' => 'Không có đơn hàng nào.'], 404);
            }

            // Duyệt qua các đơn hàng và thêm trường 'photo' từ sản phẩm vào chi tiết đơn hàng
            $orders->each(function ($order) {
                if ($order->orderDetails) {  // Kiểm tra nếu có orderDetails
                    $order->orderDetails->each(function ($detail) {
                        if ($detail->product) {
                            $detail->product_photo = $detail->product->photo;
                        } else {
                            $detail->product_photo = 'default-placeholder.jpg'; // Ảnh mặc định nếu không có
                        }
                    });
                }
            });

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }
}
