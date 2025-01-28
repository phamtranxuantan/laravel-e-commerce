import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PaymentCallback = () => {
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [orderData, setOrderData] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const params = {};
        queryParams.forEach((value, key) => {
            params[key] = value;
        });

        // Gửi request tới API để xử lý phản hồi từ VNPay
        axios.post('http://localhost:8000/api/payment-callback', params)
            .then(response => {
                if (response.data.success) {
                    setPaymentStatus('success');
                    setMessage('Thanh toán thành công! Cảm ơn bạn đã mua hàng.');

                    // Lấy thông tin đơn hàng từ localStorage
                    const savedOrderData = localStorage.getItem('orderData');
                    if (savedOrderData) {
                        setOrderData(JSON.parse(savedOrderData));
                    }
                } else {
                    setPaymentStatus('failure');
                    setMessage('Thanh toán thất bại. Vui lòng thử lại.');
                }
            })
            .catch(error => {
                console.error('Error processing payment callback:', error);
                setPaymentStatus('error');
                setMessage('Có lỗi xảy ra trong quá trình xử lý thanh toán.');
            });
    }, [location.search]);

    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
      <h1 style={{ color: '#ff6a00' }}>Kết quả thanh toán</h1>
      <p style={{ fontSize: '16px', color: '#333' }}>{message}</p>
      {paymentStatus === 'success' && orderData && (
          <div style={{ marginTop: '20px' }}>
              <h2 style={{ color: '#28a745' }}>Thông tin đơn hàng</h2>
              <p><strong>Mã đơn hàng:</strong> {orderData.order_id}</p>
              <p><strong>Họ tên:</strong> {orderData.fullname}</p>
              <p><strong>Số điện thoại:</strong> {orderData.phone}</p>
              <p><strong>Email:</strong> {orderData.email}</p>
              <p>
                  <strong>Địa chỉ:</strong> {orderData.address}, {orderData.selectedWardName}, {orderData.selectedDistrictName}, {orderData.selectedProvinceName}
              </p>
              <p><strong>Phí vận chuyển:</strong> {orderData.shippingFee} VND</p>
              <p><strong>Tổng tiền đơn hàng (CHƯA TÍNH) Phí vận chuyển:</strong> {orderData.total_amount} VND</p>
              
              <button
                  onClick={() => window.location.href = '/'}
                  style={{
                      padding: '10px 20px',
                      backgroundColor: '#ff6a00',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#e65c00'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#ff6a00'}
              >
                  Tiếp tục mua hàng!
              </button>
          </div>
      )}
      {paymentStatus === 'failure' && (
          <button
              onClick={() => window.location.href = '/checkout'}
              style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  marginTop: '10px',
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#c82333'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
              Quay lại Checkout
          </button>
      )}
      {paymentStatus === 'error' && (
          <p style={{ color: '#dc3545', fontWeight: 'bold' }}>Có lỗi xảy ra, vui lòng thử lại sau.</p>
      )}
  </div>
  
    );
};

export default PaymentCallback;
