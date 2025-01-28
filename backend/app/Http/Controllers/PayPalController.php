<?php

namespace App\Http\Controllers;

use Srmklive\PayPal\Services\PayPal as PayPalClient;
use Illuminate\Http\Request;
use App\Models\Orders;
use Tymon\JWTAuth\Facades\JWTAuth;
class PayPalController extends Controller
{
    public function payment(Request $request)
    {
        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $paypalToken = $provider->getAccessToken();

        // Convert total_amount from VND to USD if necessary
        $total_amount_usd = $request->total_amount / 24580; // Example conversion rate from VND to USD

        $response = $provider->createOrder([
            "intent" => "CAPTURE",
            "application_context" => [
                "return_url" => route('paypal.payment.success'),
                "cancel_url" => route('paypal.payment.cancel'),
            ],
            "purchase_units" => [
                0 => [
                    "amount" => [
                        "currency_code" => "USD",
                        "value" => number_format($total_amount_usd, 2, '.', '')
                    ]
                ]
            ]
        ]);

        if (isset($response['id']) && $response['id'] != null) {
            foreach ($response['links'] as $links) {
                if ($links['rel'] == 'approve') {
                    return response()->json(['redirect_url' => $links['href']]);
                }
            }
            return response()->json(['error' => 'Something went wrong.'], 400);
        } else {
            return response()->json(['error' => $response['message'] ?? 'Something went wrong.'], 400);
        }
    }


    public function paymentCancel()
    {
        return response()->json(['redirect_url' => route('checkout')]);
    }

public function paymentSuccess(Request $request)
{
    $provider = new PayPalClient;
    $provider->setApiCredentials(config('paypal'));
    $accessToken = $provider->getAccessToken();

    $orderId = $request->query('token'); // Hoặc lấy từ phương thức khác nếu cần

    // Lưu orderId vào session
    session(['orderId' => $orderId]);

    $response = $provider->capturePaymentOrder($orderId);

    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
    if (isset($response['status']) && $response['status'] == 'COMPLETED') {
        return redirect($frontendUrl . '/checkout');
    } else {
        return response()->json(['error' => $response['message'] ?? 'Đã xảy ra lỗi.'], 400);
    }
}






}
