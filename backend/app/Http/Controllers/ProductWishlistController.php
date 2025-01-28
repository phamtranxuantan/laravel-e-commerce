<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Stock;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProductWishlistController extends Controller
{
    public function index(Request $request) {
        $user = JWTAuth::parseToken()->authenticate();

        if ($user) {
            $wishlist = Wishlist::where('user_id', $user->id)
                ->with('product.stocks')
                ->orderBy('id', 'desc')
                ->paginate(5);

            foreach ($wishlist as $item) {
                $item['stock'] = false;
                foreach ($item->product->stocks as $stock) {
                    if ($stock['quantity'] > 0) {
                        $item['stock'] = true;
                        break;
                    }
                }
                unset($item->product->stocks);
            }

            return response()->json($wishlist);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function store(Request $request) {
        $user = JWTAuth::parseToken()->authenticate();

        if ($user) {
            $product = Wishlist::where('user_id', $user->id)
                    ->where('product_id', $request->productId)
                    ->first();

            if ($product === null) {
                Wishlist::create([
                    'user_id' => $user->id,
                    'product_id' => $request->productId
                ]);

                return response()->json(['count' => $user->wishlistProducts()->count()]);
            } else {
                return response()->json(['error' => 'Product already in wishlist'], 405);
            }
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function destroy($id) {
        $user = JWTAuth::parseToken()->authenticate();

        if ($user) {
            $item = $user->wishlistProducts()->findOrFail($id);

            if ($item) {
                $item->delete();
            }

            return response()->json(['count' => $user->wishlistProducts()->count()]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function count(Request $request) {
        $user = JWTAuth::parseToken()->authenticate();

        if ($user) {
            return response()->json(['count' => $user->wishlistProducts()->count()]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }
}
