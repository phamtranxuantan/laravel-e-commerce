<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Orders;
use App\Models\OrderDetail;
use App\Models\Address;
use App\Models\ShoppingCart;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Product;
class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $cartItems = ShoppingCart::where('user_id', $user->id)->get();

            // Validate that there are items in the cart
            if ($cartItems->isEmpty()) {
                return response()->json(['error' => 'Cart is empty'], 400);
            }

            // Calculate the total amount
            $totalAmount = 0;
            foreach ($cartItems as $item) {
                $product = Product::findOrFail($item->stock_id);
                $totalAmount += $product->price * $item->quantity;
            }

            // Create a new Order
            $order = Orders::create([
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'status' => 'pending',
            ]);

            // Create Order details
            foreach ($cartItems as $item) {
                $product = Product::findOrFail($item->stock_id);
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $item->stock_id,
                    'quantity' => $item->quantity,
                    'price' => $product->price,
                ]);
            }

            // Save the shipping address
            Address::create([
                'user_id' => $user->id,
                'fullname' => $request->fullname,
                'phone' => $request->phone,
                'email' => $request->email,
                'province' => $request->province,
                'district' => $request->district,
                'ward' => $request->ward,
                'address' => $request->address,
                'orders_id' => $order->id,
            ]);

            // Clear the cart
            ShoppingCart::where('user_id', $user->id)->delete();

            return response()->json(['message' => 'Đơn hàng đã được đặt thành công!'], 201);
        } catch (\Exception $e) {
            Log::error($e);
            return response()->json(['error' => 'Đã xảy ra lỗi'], 500);
        }
    }
}
