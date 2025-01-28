<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');




//login facebook user
Route::post('/facebook-login','App\Http\Controllers\UserController@facebookLogin');
//admin
//Route:: resource('/products/admin', ProductAdminController::class);
////////////////////////
Route::get('/product/categories','App\Http\Controllers\CategoryController@index');
Route::get('/dashboard','App\Http\Controllers\DashboardController@index');
//login,register,view users,updateUser,updatePassword,createPhone,checkPhone

Route::post('/register','App\Http\Controllers\UserController@register');
Route::post('/login','App\Http\Controllers\UserController@login');
Route::post('/refresh-token','App\Http\Controllers\UserController@refreshToken');
Route::get('/auth','App\Http\Controllers\UserController@getUser');
Route::put('/update/{id}','App\Http\Controllers\UserController@updateUser');
Route::put('/update-password','App\Http\Controllers\UserController@updatePassword');
Route::post('/phones','App\Http\Controllers\PhoneController@store');
Route::put('/phones/{id}','App\Http\Controllers\PhoneController@updatePhone');
Route::get('/check-phone/{phone}', 'App\Http\Controllers\PhoneController@checkPhone');
//address
Route::get('/user/show-address','App\Http\Controllers\UserAddressController@show');
Route::post('/user/create-user','App\Http\Controllers\UserAddressController@createUser');
Route::post('/user/store-address','App\Http\Controllers\UserAddressController@store');
Route::get('/productssss/{id}','App\Http\Controllers\ProductController@show1');

//Product
Route::get('/productsUser','App\Http\Controllers\ProductController@index');
Route::post('/productsUser', 'App\Http\Controllers\ProductController@store');
Route::post('/productsUser/{id}', 'App\Http\Controllers\ProductController@update');
Route::get('/productsUser/{id}', 'App\Http\Controllers\ProductController@showpRODUCTADMIN');
//product New
Route::get('/new-products','App\Http\Controllers\ProductController@getNewProducts');
//khuyen mai
Route::get('/discounted-products','App\Http\Controllers\ProductController@getDiscountedProducts');

//productAdmin

Route::get('/productsAdmin','App\Http\Controllers\ProductController@indexAdmin');
Route::delete('/productsAdmin/{id}', 'App\Http\Controllers\ProductController@destroy');
//Product categorys
// Route::get('/product/categories','App\Http\Controllers\CategoryController@index');
Route::get('/product/categories/{id}/top-selling','App\Http\Controllers\CategoryController@topSelling');
Route::get('/product/categories/{id}/new', 'App\Http\Controllers\ProductCategoriesController@new');

Route::get('/product/categories/{id}', 'App\Http\Controllers\CategoryController@show');
Route::post('/product/categories', 'App\Http\Controllers\CategoryController@store');
Route::delete('/product/categories/{id}', 'App\Http\Controllers\CategoryController@destroy');
Route::put('/product/categories/{id}', 'App\Http\Controllers\CategoryController@update');

//Product Wishlist
Route::get('/product/wishlist/count', 'App\Http\Controllers\ProductWishlistController@count');
Route::get('/product/wishlist', 'App\Http\Controllers\ProductWishlistController@index');
Route::post('/product/wishlist', 'App\Http\Controllers\ProductWishlistController@store');
Route::delete('/product/wishlist/{id}', 'App\Http\Controllers\ProductWishlistController@destroy');

// Product Shopping Cart

Route::get('/product/cart-list/count', 'App\Http\Controllers\ProductShoppingCartController@cartCount');
Route::get('/product/cart-list/', 'App\Http\Controllers\ProductShoppingCartController@index');
Route::post('/product/cart-list', 'App\Http\Controllers\ProductShoppingCartController@store');
Route::post('/product/cart-list/guest', 'App\Http\Controllers\ProductShoppingCartController@guestCart');
Route::put('/product/cart-list/{id}', 'App\Http\Controllers\ProductShoppingCartController@update');
Route::delete('/product/cart-list/{id}', 'App\Http\Controllers\ProductShoppingCartController@destroy');
Route::get('/product/hot-deal', 'App\Http\Controllers\ProductDealsController@hotDeals');
//search product
Route::get('/search','App\Http\Controllers\SearchController@search');
//sliders
Route::get('/sliders','App\Http\Controllers\SliderController@index');

/// xử lí thêm sản phẩm vào giỏ hàng
// Route::post('/orders', 'App\Http\Controllers\OrderController@create');
//lưu thông tin khách hàng
// Đảm bảo rằng người dùng đã đăng nhập mới có thể truy cập phương thức store
//Route::middleware('jwt.auth')->post('/addresses', 'App\Http\Controllers\AddressController@store');
Route::group(['middleware' => ['jwt.auth']], function () {
    Route::post('/orders', 'App\Http\Controllers\OrderController@create');
});
///thanh toán vnpay
Route::group(['middleware' => ['jwt.auth']], function () {
Route::post('/create-order','App\Http\Controllers\OrderController@createOrder');});

Route::post('/vnpay-payment','App\Http\Controllers\PaymentController@createVnPayPayment');
Route::post('/payment-callback','App\Http\Controllers\PaymentController@handlePaymentCallback');
/////paypal
// Route xử lý thanh toán PayPal
Route::post('paypal-payment', 'App\Http\Controllers\PayPalController@payment')->name('paypal.payment');

// Route xử lý khi thanh toán thành công
Route::get('paypal/payment/success', 'App\Http\Controllers\PayPalController@paymentSuccess')->name('paypal.payment.success');

// Route xử lý khi người dùng hủy thanh toán
Route::get('paypal/payment/cancel', 'App\Http\Controllers\PayPalController@paymentCancel')->name('paypal.payment.cancel');

Route::post('/payment-success', 'App\Http\Controllers\PayPalController@paymentSuccess');

//Route xử lí việc lấy địa chỉ bằng api GHN
Route::get('/provinces', 'App\Http\Controllers\AddressGHNController@getProvinces');
Route::get('/districts/{provinceId}', 'App\Http\Controllers\AddressGHNController@getDistricts');
Route::get('/wards/{districtId}', 'App\Http\Controllers\AddressGHNController@getWards');


//Route::post('/create-gn-order', 'App\Http\Controllers\GHNController@createOrder');

//route tính phí vận chuyển ghn
Route::post('/calculate-shipping-fee', 'App\Http\Controllers\GHNController@calculateShippingFee');


/// lấy đơn hàng của users
Route::get('/user-orders', 'App\Http\Controllers\OrderController@getUserOrders');




//api chức năng Message
Route::get('/conversations', 'App\Http\Controllers\ConversationController@index');
Route::post('/conversations', 'App\Http\Controllers\ConversationController@store');
Route::get('/conversations/{id}', 'App\Http\Controllers\ConversationController@show');
Route::delete('/conversations/{id}', 'App\Http\Controllers\ConversationController@destroy');


Route::get('/conversations/{conversation_id}/messages', 'App\Http\Controllers\MessageController@index');
Route::post('/conversations/{conversation_id}/messages', 'App\Http\Controllers\MessageController@store');


















//////////////////////////////////////////////////////////////
/////ROUTE API DANH CHO TRANG ADMIN
use App\Http\Controllers\UserAdminController;
use App\Http\Controllers\ProductAdminController;
use App\Http\Controllers\CategoryAdminController;

// //UserAdmin
Route::apiResource('users', UserAdminController::class);
//ProductsAdmin
Route::apiResource('products', ProductAdminController::class);
Route::apiResource('categories', CategoryAdminController::class);
//api upload ảnh ở react-admin
Route::post('/products/{id}/upload-image', 'App\Http\Controllers\ProductAdminController@uploadImage');
Route::get('/product/photo/{id}', 'App\Http\Controllers\ProductAdminController@getPhoto');
Route::delete('/product/photo/{id}', 'App\Http\Controllers\ProductAdminController@removeImage');
Route::post('product/photo/{id}', 'App\Http\Controllers\ProductAdminController@updateImage');
