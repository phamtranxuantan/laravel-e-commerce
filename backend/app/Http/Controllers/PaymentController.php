<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Orders;
use Illuminate\Support\Facades\DB;
class PaymentController extends Controller
{


    public function createVnPayPayment(Request $request)
    {
        $orderId = $request->order_id; // Lấy mã đơn hàng từ request
        $vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        $vnp_Returnurl = "http://localhost:3000/payment-callback";
        $vnp_TmnCode = "M0DGLK3R";//Mã website tại VNPAY
        $vnp_HashSecret = "BDCFBO3QOZMV809YX91BPZ8F5ZJHZB40"; //Chuỗi bí mật

        $vnp_TxnRef =$orderId; //Mã đơn hàng. Trong thực tế Merchant cần insert đơn hàng vào database và gửi mã này sang VNPAY
        $vnp_OrderInfo = "Thanh toan don hang " . $vnp_TxnRef;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $request->total_amount * 100;
        $vnp_Locale = 'vn';
        $vnp_BankCode = 'NCB';
        $vnp_IpAddr = request()->ip();
        //Add Params of 2.0.1 Version
        //$vnp_ExpireDate = $_POST['txtexpire'];
        //Billing
        // $vnp_Bill_Mobile = $_POST['txt_billing_mobile'];
        // $vnp_Bill_Email = $_POST['txt_billing_email'];
        // $fullName = trim($_POST['txt_billing_fullname']);
        // if (isset($fullName) && trim($fullName) != '') {
        //     $name = explode(' ', $fullName);
        //     $vnp_Bill_FirstName = array_shift($name);
        //     $vnp_Bill_LastName = array_pop($name);
        // }
        // $vnp_Bill_Address=$_POST['txt_inv_addr1'];
        // $vnp_Bill_City=$_POST['txt_bill_city'];
        // $vnp_Bill_Country=$_POST['txt_bill_country'];
        // $vnp_Bill_State=$_POST['txt_bill_state'];
        // // Invoice
        // $vnp_Inv_Phone=$_POST['txt_inv_mobile'];
        // $vnp_Inv_Email=$_POST['txt_inv_email'];
        // $vnp_Inv_Customer=$_POST['txt_inv_customer'];
        // $vnp_Inv_Address=$_POST['txt_inv_addr1'];
        // $vnp_Inv_Company=$_POST['txt_inv_company'];
        // $vnp_Inv_Taxcode=$_POST['txt_inv_taxcode'];
        // $vnp_Inv_Type=$_POST['cbo_inv_type'];
        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef
            // "vnp_ExpireDate"=>$vnp_ExpireDate,
            // "vnp_Bill_Mobile"=>$vnp_Bill_Mobile,
            // "vnp_Bill_Email"=>$vnp_Bill_Email,
            // "vnp_Bill_FirstName"=>$vnp_Bill_FirstName,
            // "vnp_Bill_LastName"=>$vnp_Bill_LastName,
            // "vnp_Bill_Address"=>$vnp_Bill_Address,
            // "vnp_Bill_City"=>$vnp_Bill_City,
            // "vnp_Bill_Country"=>$vnp_Bill_Country,
            // "vnp_Inv_Phone"=>$vnp_Inv_Phone,
            // "vnp_Inv_Email"=>$vnp_Inv_Email,
            // "vnp_Inv_Customer"=>$vnp_Inv_Customer,
            // "vnp_Inv_Address"=>$vnp_Inv_Address,
            // "vnp_Inv_Company"=>$vnp_Inv_Company,
            // "vnp_Inv_Taxcode"=>$vnp_Inv_Taxcode,
            // "vnp_Inv_Type"=>$vnp_Inv_Type
        );

        if (isset($vnp_BankCode) && $vnp_BankCode != "") {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        }
        if (isset($vnp_Bill_State) && $vnp_Bill_State != "") {
            $inputData['vnp_Bill_State'] = $vnp_Bill_State;
        }

        //var_dump($inputData);
        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $vnp_Url . "?" . $query;
        if (isset($vnp_HashSecret)) {
            $vnpSecureHash =   hash_hmac('sha512', $hashdata, $vnp_HashSecret);//
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }
        $returnData = array('code' => '00'
            , 'message' => 'success'
            , 'data' => $vnp_Url);
            if (isset($_POST['redirect'])) {
                header('Location: ' . $vnp_Url);
                die();
            } else {
                echo json_encode($returnData);
            }
            // vui lòng tham khảo thêm tại code demo
    }
    // Xử lý kết quả VNPay trả về
    public function handlePaymentCallback(Request $request)
    {
          // Lấy tham số từ VNPay gửi về
    $vnp_ResponseCode = $request->input('vnp_ResponseCode');
    $vnp_TxnRef = $request->input('vnp_TxnRef');
    $vnp_TransactionNo = $request->input('vnp_TransactionNo'); // Mã giao dịch VNPay
    $vnp_PayDate = $request->input('vnp_PayDate'); // Thời gian thanh toán từ VNPay (YYYYMMDDHHmmss)
    $vnp_SecureHash = $request->input('vnp_SecureHash');

    // Cấu hình hash secret
    $vnp_HashSecret = "BDCFBO3QOZMV809YX91BPZ8F5ZJHZB40"; // Chuỗi bí mật

    // Tạo dữ liệu để mã hóa
    $inputData = $request->except('vnp_SecureHash');
    ksort($inputData);
    $hashData = '';
    foreach ($inputData as $key => $value) {
        $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
    }
    $hashData = substr($hashData, 1); // Loại bỏ ký tự '&' đầu tiên
    $vnpSecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

    // Kiểm tra hash có khớp không
    if ($vnpSecureHash !== $vnp_SecureHash) {
        return response()->json(['success' => false, 'message' => 'Dữ liệu bảo mật không hợp lệ.']);
    }

    // Kiểm tra kết quả thanh toán
    if ($vnp_ResponseCode == '00') {
        // Thanh toán thành công
        $paymentMethod = 'vnpay'; // Gán giá trị phương thức thanh toán

        // Cập nhật phương thức thanh toán và các thông tin khác cho đơn hàng
        $this->updatePaymentMethodAndDetails($vnp_TxnRef, $paymentMethod, $vnp_TransactionNo, $vnp_ResponseCode, $vnp_PayDate);

        return response()->json(['success' => true, 'message' => 'Thanh toán thành công.']);
    } else {
        // Thanh toán thất bại
        return response()->json(['success' => false, 'message' => 'Thanh toán thất bại.']);
    }
    }

    private function generateSecureHash(Request $request)
    {
        // Tạo chữ ký bảo mật để so sánh
        $vnp_HashSecret = config('vnpay.vnp_HashSecret');
        $inputData = $request->except('vnp_SecureHash');
        ksort($inputData);
        $query = http_build_query($inputData);
        return hash_hmac('sha512', $query, $vnp_HashSecret);
    }



    // Phương thức dùng chung để cập nhật phương thức thanh toán
    // Phương thức dùng chung để cập nhật phương thức thanh toán và các thông tin khác
    private function updatePaymentMethodAndDetails($orderId, $paymentMethod, $transactionId, $responseCode, $paymentTime)
    {
        $order = Orders::find($orderId);
        if ($order) {
            $order->payment_method = $paymentMethod; // Cập nhật phương thức thanh toán
            $order->transaction_id = $transactionId; // Cập nhật mã giao dịch VNPay
            $order->vnp_response_code = $responseCode; // Cập nhật mã phản hồi từ VNPay
            $order->payment_time = \Carbon\Carbon::createFromFormat('YmdHis', $paymentTime); // Cập nhật thời gian thanh toán
            $order->status = 'completed'; // Cập nhật trạng thái đơn hàng
            $order->save(); // Lưu thay đổi vào cơ sở dữ liệu
        }
    }


}
