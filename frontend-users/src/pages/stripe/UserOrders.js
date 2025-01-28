import axios from 'axios';
import React, { Component } from 'react';

class UserOrders extends Component {
    state = {
        orders: [],
        loading: true,
        error: null,
    };

    componentDidMount() {
        this.fetchUserOrders();
    }

    fetchUserOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/user-orders', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            this.setState({ orders: response.data, loading: false });
        } catch (error) {
            this.setState({ error: 'Không thể lấy thông tin đơn hàng.', loading: false });
        }
    };

    render() {
        const { orders, loading, error } = this.state;

        if (loading) {
            return <div>Đang tải...</div>;
        }

        if (error) {
            return <div>{error}</div>;
        }

        return (
            <div className="container">
                <h1>Danh Sách Đơn Hàng Của Bạn</h1>
                {orders.length > 0 ? (
                    orders.map(order => (
                        <article className="card mb-4" key={order.id}>
                            <header className="card-header">
                                <strong className="d-inline-block mr-3">Mã đơn hàng: {order.id}</strong>
                                <span>Ngày tạo: {new Date(order.created_at).toLocaleDateString()}</span>
                            </header>
                            <div className="card-body">
                                <div className="row">
                                    {/* Thông tin địa chỉ giao hàng */}
                                    {order.addresses.length > 0 && (
                                        <div className="col-md-8">
                                            <h6 className="text-muted">
                                            Giao hàng đến</h6>
                                            <p>
                                                Tên:{order.addresses[0].fullname} <br />
                                                Điện thoại: {order.addresses[0].phone} <br />
                                                Email: {order.addresses[0].email} <br />
                                                Địa chỉ: {order.addresses[0].address}, {order.addresses[0].ward}, {order.addresses[0].district}, {order.addresses[0].province}
                                            </p>
                                        </div>
                                    )}
                                    <div className="col-md-4">
                                        <h6 className="text-muted">Sự chi trả</h6>
                                        <span className="text-success">
                                            <i className="fab fa-lg fa-cc-visa"></i>
                                            {order.payment_method} - ID giao dịch: {order.transaction_id}
                                        </span>
                                        <p>
                                            Tổng Sản phẩm: {order.total_amount} VND <br />
                                            Phí di chuyển: {order.shipping_fee} VND <br />
                                            <strong>Tổng cộng: {(parseFloat(order.total_amount) + parseFloat(order.shipping_fee)).toFixed(2)} VND</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Danh sách sản phẩm trong đơn hàng */}
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ảnh</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.order_details.map(detail => (
                                            <tr key={detail.id}>
                                                <td width="65">
                                                    <img
                                                        src={`http://localhost:8000/img/${JSON.parse(detail.product_photo)[0]}`}
                                                        className="img-xs border"
                                                        alt={detail.product.name}
                                                    />
                                                </td>
                                                <td>
                                                    <p className="title mb-0">{detail.product.name}</p>
                                                </td>
                                                <td>{detail.quantity}</td>
                                                <td>{detail.price} VND</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    ))
                ) : (
                    <p>Không có đơn hàng nào.</p>
                )}
            </div>
        );
    }
}

export default UserOrders;
