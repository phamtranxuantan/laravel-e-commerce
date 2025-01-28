<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category; // Thêm dòng này để khai báo lớp Category
use App\Models\Product; // Thêm dòng này để khai báo lớp Product

class ProductCategoriesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Category::all();
    }

    /**
     * Display all products by categoryId
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function new($id) {
        // $products = Product::with('category')->where('category_id', $id)->orderBy('id', 'desc')->take(5)->get();
        $products = Product::with('category')
        ->where('category_id', $id)
        ->orderBy('id', 'desc')
        ->paginate(4); // Thêm paginate ở đây để hỗ trợ phân trang

        foreach($products as $product) {
            if($product->reviews()->exists()) {
                $product['review'] = $product->reviews()->avg('rating');
            }
        }

        return $products;
    }

    public function topSelling($id) {
        $products = Product::with('category')->where('category_id', $id)->take(6)->get();

        foreach($products as $product) {
            if($product->reviews()->exists())
                $product['review'] = $product->reviews()->avg('rating');

            if($product->stocks()->exists()) {
                $num_orders = 0;
                $stocks = $product->stocks()->get();

                foreach($stocks as $stock)
                    $num_orders += $stock->orders()->count();

                $product['num_orders'] = $num_orders;
            }  else {
                $product['num_orders'] = 0;
            }
        }

        return $products->sortByDesc('num_orders')->values()->all();
    }
}
