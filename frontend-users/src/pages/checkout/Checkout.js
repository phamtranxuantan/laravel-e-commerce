import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AddressCard from '../stripe/AddressCard';
import { toast } from "react-toastify";

const promise = loadStripe('your-public-key-here'); // Thay thế 'your-public-key-here' bằng khóa công khai Stripe của bạn

class Checkout extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			presistAddress: true, // Cờ để xác định có sử dụng địa chỉ đã lưu hay không
			fullname: '', // Thay đổi từ firstName và lastName thành fullname
			phone: '', // Thay đổi từ telephone thành phone
			email: '',
			address: '',
			province: '', // Thay đổi từ city thành province
			district: '', // Thay đổi từ country thành district
			ward: '', // Thay đổi từ zip thành ward
			password: '',
			passwordConfirm: '',
			note: '',
			total: 0,
			totalAmount: 0,
			redirect: false,
			checkoutList: [],
			error: '',
			provinces: [],
			districts: [],
			wards: [],
			selectedProvince: '',
			selectedDistrict: '',
			selectedProvinceName: '', 
			selectedDistrictName: '', 
		};
		this.handlePayPalPayment = this.handlePayPalPayment.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	
	componentDidMount() {
		this.fetchProvinces();
	}
	
	// Fetch list of provinces
	fetchProvinces = () => {
		axios.get('http://localhost:8000/api/provinces')
			.then(response => {
				if (response.data) {
					this.setState({ provinces: response.data });
				} else {
					console.error('Invalid data structure:', response.data);
				}
			})
			.catch(error => {
				console.error('Error fetching provinces:', error);
			});
	};
	
	// Fetch list of districts by province_id
	fetchDistricts = (provinceId) => {
		axios.get(`http://localhost:8000/api/districts/${provinceId}`)
			.then(response => {
				if (response.data) {
					this.setState({ districts: response.data });
				} else {
					console.error('Invalid data structure:', response.data);
				}
			})
			.catch(error => {
				console.error('Error fetching districts:', error);
			});
	};
	
	// Fetch list of wards by district_id
	fetchWards = (districtId) => {
		fetch(`http://localhost:8000/api/wards/${districtId}`)
			.then((response) => response.json())
			.then((data) => {
				this.setState({ wards: data });
				//console.log('Fetched Wards:', data);
			})
			.catch((error) => {
				console.error('Error fetching wards:', error);
			});
	};
	
	handleProvinceChange = (event) => {
		const provinceId = event.target.value;
		const selectedProvince = this.state.provinces.find(province => province.ProvinceID === parseInt(provinceId));
	
		this.setState({
			selectedProvince: provinceId, // Đã sửa lại để không gọi provinceId là một đối tượng
			selectedProvinceName: selectedProvince ? selectedProvince.ProvinceName : '',
			districts: [], // Reset danh sách quận/huyện
			wards: [] // Reset danh sách phường/xã
		}, () => {
			if (provinceId) {
				this.fetchDistricts(provinceId); // Lấy danh sách quận/huyện theo tỉnh
				//console.log('Selected Province:', this.state.selectedProvince, this.state.selectedProvinceName);
			}
		});
	};
	
	handleDistrictChange = (event) => {
		const districtId = event.target.value;
		const selectedDistrict = this.state.districts.find(district => district.DistrictID === parseInt(districtId));
	
		this.setState({
			selectedDistrict: districtId, // Đã sửa lại để không gọi districtId là một đối tượng
			selectedDistrictName: selectedDistrict ? selectedDistrict.DistrictName : '',
			wards: [] // Reset danh sách phường/xã
		}, () => {
			if (districtId) {
				this.fetchWards(districtId); // Lấy danh sách phường/xã theo quận/huyện
				//console.log('Selected District:', this.state.selectedDistrict, this.state.selectedDistrictName);
			}
		});
	};
	
	handleWardChange = (event) => {
		const wardId = event.target.value;
		const selectedWard = this.state.wards.find(ward => ward.WardCode === wardId);
	
		if (selectedWard) {
			this.setState({
				selectedWard: wardId, // Đã sửa lại để không gọi wardId là một đối tượng
				selectedWardName: selectedWard.WardName || '',
			}, () => {
				//console.log('Selected Ward:', this.state.selectedWard, this.state.selectedWardName);
				this.fetchShippingFee();
			});
		}
		
	};
	
	handleSubmit = async (e) => {
		e.preventDefault();
	
		const {
			fullname,
			phone,
			email,
			address,
			selectedProvinceName,
			selectedDistrictName,
			selectedWardName,
			selectedProvince,
			selectedDistrict,
			selectedWard,
			checkoutList,
			shippingFee 
		} = this.state;
		
		//console.log('State values:', { selectedProvinceName, selectedDistrictName, selectedWardName, shippingFee });
	
		// Kiểm tra các trường thông tin bắt buộc
		if (!selectedProvinceName || !selectedDistrictName || !selectedWardName) {
			toast.error('Vui lòng nhập đầy đủ thông tin tỉnh/thành phố, quận/huyện và phường/xã.');
			return;
		}
	
		try {
			const token = localStorage.getItem('token');
	
			const response = await axios.post(
				'http://localhost:8000/api/orders', // API URL
				{
					fullname,
					phone,
					email,
					address,
					province: {
						name: selectedProvinceName, 
						code: selectedProvince 
					},
					district: {
						name: selectedDistrictName, 
						code: selectedDistrict 
					},
					ward: {
						name: selectedWardName, 
						code: selectedWard 
					},
					cart_items: checkoutList, // Danh sách sản phẩm trong giỏ hàng
					shipping_fee: shippingFee // Thêm trường phí vận chuyển
				},
				{
					headers: {
						Authorization: `Bearer ${token}` // Thêm token vào headers để xác thực
					}
				}
			);
	
			if (response.data.token) {
				localStorage.setItem('token', response.data.token);
			}
	
			if (response.data.user) {
				this.props.addUser(response.data.user);
			}
	
			toast.success(response.data.message);
			this.setState({ persistAddress: false });
		} catch (error) {
			console.error('Lỗi đặt hàng:', error);
			toast.error('Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.');
		}
	};
	
	
	handleVnPayPayment = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			toast.error('Vui lòng đăng nhập để thanh toán.');
			return;
		}
		const {
			fullname,
			phone,
			email,
			address,
			selectedProvinceName,
			selectedDistrictName,
			selectedWardName,
			selectedProvince,
			selectedDistrict,
			selectedWard,
			checkoutList,
			shippingFee 
		} = this.state;
	
		// Kiểm tra các trường thông tin bắt buộc
		if (!selectedProvinceName || !selectedDistrictName || !selectedWardName) {
			toast.error('Vui lòng nhập đầy đủ thông tin tỉnh/thành phố, quận/huyện và phường/xã.');
			return;
		}
	
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				toast.error('Vui lòng đăng nhập để thanh toán.');
				return;
			}
	
			// Bước 1: Tạo đơn hàng từ dữ liệu tương tự handleSubmit
			const orderResponse = await axios.post('http://localhost:8000/api/create-order', {
				fullname,
				phone,
				email,
				address,
				province: {
					name: selectedProvinceName,
					code: selectedProvince
				},
				district: {
					name: selectedDistrictName,
					code: selectedDistrict
				},
				ward: {
					name: selectedWardName,
					code: selectedWard
				},
				cart_items: checkoutList,
				shipping_fee: shippingFee 
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});
	
			// Lưu token và user nếu có
			if (orderResponse.data.token) {
				localStorage.setItem('token', orderResponse.data.token);
			}
	
			if (orderResponse.data.user) {
				this.props.addUser(orderResponse.data.user);
			}
	
			// Bước 2: Lấy order_id và total_amount từ phản hồi của đơn hàng
			const { order_id, total_amount } = orderResponse.data;
			console.log('Order ID:', order_id);
			console.log('Total amount:', total_amount);
	
			// Bước 3: Gọi API thanh toán VNPay với order_id và total_amount
			const paymentResponse = await axios.post('http://localhost:8000/api/vnpay-payment', {
				order_id: order_id,
				total_amount: total_amount,
				items: checkoutList
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});
	
			// Bước 4: Xử lý URL trả về từ VNPay và chuyển hướng người dùng
			const { data } = paymentResponse;
			const orderData = {
				order_id,
				fullname,
				phone,
				email,
				address,
				selectedProvinceName,
				selectedDistrictName,
				selectedWardName,
				checkoutList,
				shippingFee,
				total_amount
			};
			localStorage.setItem('orderData', JSON.stringify(orderData)); // Lưu đơn hàng vào localStorage
        	window.location.href = data.data; // Chuyển hướng tới trang VNPay
			toast.success(orderResponse.data.message); // Thông báo sau khi tạo đơn hàng
			this.setState({ persistAddress: false });
		} catch (error) {
			console.error('Error processing VNPay payment:', error);
			toast.error('Có lỗi xảy ra khi xử lý thanh toán qua VNPay.');
		}
	};
	  
	// Hàm xử lý thanh toán PayPal
	handlePayPalPayment = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			toast.error('Vui lòng đăng nhập để thanh toán.');
			return;
		}
		const {
			fullname,
			phone,
			email,
			address,
			selectedProvinceName,
			selectedDistrictName,
			selectedWardName,
			selectedProvince,
			selectedDistrict,
			selectedWard,
			checkoutList,
			shippingFee 
		} = this.state;
	
		// Kiểm tra các trường thông tin bắt buộc
		if (!selectedProvinceName || !selectedDistrictName || !selectedWardName) {
			toast.error('Vui lòng nhập đầy đủ thông tin tỉnh/thành phố, quận/huyện và phường/xã.');
			return;
		}
	
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				toast.error('Vui lòng đăng nhập để thanh toán.');
				return;
			}
	
			// Bước 1: Tạo đơn hàng từ dữ liệu tương tự handleSubmit
			const orderResponse = await axios.post('http://localhost:8000/api/create-order', {
				fullname,
				phone,
				email,
				address,
				province: {
					name: selectedProvinceName,
					code: selectedProvince
				},
				district: {
					name: selectedDistrictName,
					code: selectedDistrict
				},
				ward: {
					name: selectedWardName,
					code: selectedWard
				},
				cart_items: checkoutList,
				shipping_fee: shippingFee 
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});
	
			// Lưu token và user nếu có
			if (orderResponse.data.token) {
				localStorage.setItem('token', orderResponse.data.token);
			}
	
			if (orderResponse.data.user) {
				this.props.addUser(orderResponse.data.user);
			}
	
			// Bước 2: Lấy order_id và total_amount từ phản hồi của đơn hàng
			const { order_id, total_amount } = orderResponse.data;
			console.log('Order ID:', order_id);
			console.log('Total amount:', total_amount);
	
			// Bước 2: Gọi API thanh toán PayPal
			const paymentResponse = await axios.post('http://localhost:8000/api/paypal-payment', {
				order_id: order_id, // Mã đơn hàng
				total_amount: total_amount, // Tổng số tiền cần thanh toán
				items: this.state.checkoutList, // Các mặt hàng trong giỏ hàng
				frontend_url: window.location.origin // Gửi URL của frontend đến backend
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});
	
			// Bước 3: Xử lý URL trả về từ PayPal và chuyển hướng người dùng
			const { redirect_url } = paymentResponse.data;
	
			if (redirect_url) {
				window.location.href = redirect_url; // Chuyển hướng tới trang thanh toán PayPal
			} else {
				console.error('No redirect URL received from PayPal');
				toast.error('Đã xảy ra lỗi khi nhận URL thanh toán. Vui lòng thử lại.');
			}
		} catch (error) {
			console.error('Error processing PayPal payment:', error);
		}
	};
	
		  
componentDidMount() {
	const selectedList = localStorage.getItem('selectedList');
	if (selectedList) {
		const token = localStorage.getItem('token');
		if (token) {
			this.getShoppingCartList(); // Lấy danh sách giỏ hàng của người dùng đã đăng nhập
		} else {
			this.getGuestShoppingCartList(localStorage.getItem('cartList')); // Lấy danh sách giỏ hàng của khách
		}
	} else {
		const checkoutList = localStorage.getItem('checkoutList');
		if (!checkoutList) {
			this.setState({ redirect: true }); // Nếu không có danh sách thanh toán, chuyển hướng đến trang chủ
		} else {
			const list = JSON.parse(checkoutList);
			this.setState({ checkoutList: list });
			this.calcTotal(list); // Tính tổng giá trị đơn hàng
			const token = localStorage.getItem('token');
			if (token && !this.props.user) {
				this.getAuth(token);
			}
		}
	}
	this.fetchProvinces();
}
	getAuth(token) {
		axios.get('http://localhost:8000/api/auth', {
			headers: { Authorization: `Bearer ${token}` }
		}).then(result => {
			this.props.addUser(result.data.user);
			if (result.data.user.address_id) {
				this.getUserDefaultAddress();
			}
		});
	}

	getShoppingCartList() {
		axios.get(`http://localhost:8000/api/product/cart-list/`, {
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
		}).then((response) => {
			this.setState({
				checkoutList: [...response.data]
			}, () => {
				this.generateCheckoutList();
				this.getUserDefaultAddress();
			});
		}).catch(function (error) {
			console.log(error);
		});
	}

	getGuestShoppingCartList(localCartList) {
		axios.post('http://localhost:8000/api/product/cart-list/guest', {
			cartList: localCartList,
		}).then(response => {
			this.setState({
				checkoutList: [...response.data],
			}, () => {
				this.generateCheckoutList();
			});
		});
	}

	generateCheckoutList() {
		let checkoutList = this.state.checkoutList;
		const selectedList = JSON.parse(localStorage.getItem('selectedList'));

		if (localStorage.getItem('token')) {
			checkoutList = checkoutList.filter(item => selectedList.includes(item.id));
		} else {
			checkoutList = checkoutList.filter((item, index) => selectedList.includes(index + 1));
		}

		localStorage.setItem('checkoutList', JSON.stringify(checkoutList));
		localStorage.removeItem('selectedList');

		this.setState({ checkoutList: [...checkoutList] });
		this.calcTotal(checkoutList);
	}

	calcTotal(list) {
		let subtotal = 0;
		let shipping = 0;
	
		list.forEach(item => {
			if (item.stock && item.stock.product) {
				subtotal += (item.stock.product.price * item.quantity);
			}
		});
	
		this.setState({
			total: (subtotal + shipping)
		});
	}

	handleChange(event) {
		const { name, value } = event.target;
		this.setState({
			[name]: value
		});
	}
	
	//tính phí vận chuyển ghn
	fetchShippingFee = async () => {
		try {
			const response = await axios.post('http://localhost:8000/api/calculate-shipping-fee', {
				from_district_id: 3695, // ID quận/huyện nơi lấy hàng
				service_type_id: 2, // Cập nhật từ service_id thành service_type_id
				to_district_id: parseInt(this.state.selectedDistrict, 10), // Chuyển đổi thành số nguyên
				to_ward_code: this.state.selectedWard, // Mã phường/xã đích
				weight: this.calculateTotalWeight(), // Tổng trọng lượng
				insurance_value: this.state.total || 0, // Giá trị đơn hàng (có thể là 0 nếu không có)
				items: this.state.checkoutList, // Thêm thông tin sản phẩm nếu cần
				
			});
	
			// Cập nhật phần kiểm tra phản hồi
			if (response.data.shippingFee) {
				this.setState({ shippingFee: response.data.shippingFee });
			} else {
				console.error('Không thể tính phí vận chuyển');
			}
		} catch (error) {
			console.error('Lỗi khi gọi API tính phí vận chuyển:', error.response?.data || error.message);
		}
	};
	
	// Hàm tính tổng trọng lượng của các sản phẩm trong giỏ hàng
	calculateTotalWeight = () => {
		const totalWeight = this.state.checkoutList.reduce((totalWeight, item) => {
			return totalWeight + (item.stock.product.weight * item.quantity);
		}, 0);
		console.log('Tổng trọng lượng (kg):', totalWeight); // Ghi chú đơn vị
		return totalWeight; // Đảm bảo đây là giá trị tính bằng kg
	};
	getUserDefaultAddress() {
		axios.get('http://localhost:8000/api/user/default-address/', {
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
		}).then(result => {
			if (result.status === 200 && result.data) {
				this.setState({
					fullname: `${result.data.firstname} ${result.data.lastname}`, // Ghép firstName và lastName thành fullname
					phone: result.data.telephone, // Thay đổi từ telephone thành phone
					email: this.props.user.email,
					address: result.data.address,
					province: result.data.city, // Thay đổi từ city thành province
					district: result.data.country, // Thay đổi từ country thành district
					ward: result.data.zip, // Thay đổi từ zip thành ward
					presistAddress: false
				});
			}
		}).catch(error => {
			if (error.response && error.response.status === 404) {
				console.log('Default address not found.');
			} else {
				console.error('Error fetching default address:', error);
			}
		});
	}
	
	
	render() {
		const { provinces, districts, wards, selectedProvince, selectedDistrict, selectedWard } = this.state;

		const address = {
		  persistingAddress: this.state.persistingAddress,
		  fullname: this.state.fullname, // Thay đổi từ firstName và lastName thành fullname
		  phone: this.state.phone, // Thay đổi từ telephone thành phone
		  email: this.state.email,
		  address: this.state.address,
		  province: this.state.province, // Thay đổi từ city thành province
		  district: this.state.district, // Thay đổi từ country thành district
		  ward: this.state.ward // Thay đổi từ zip thành ward
		};
	  
		// Kiểm tra nếu có redirect
		if (this.state.redirect) {
		  return <Navigate to="/" />;
		}

		return (
			
				<div className="section-content padding-y" style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div className="container" id="1" style={{maxWidth:'50%'}}>
				<div className="card mb-4">
					
						<div className="card-body">
							{localStorage.getItem('token') && !this.state.presistAddress ? (
								<div className="section-title">
									<h3 className="card-title mb-3">Thông tin giao hàng</h3>
									<AddressCard address={address} provinces={provinces}
										districts={districts}
										wards={wards}/>
								</div>
							) : (
								<form onSubmit={this.handleSubmit}>
									<div className="billing-details">
										<div className="section-title">
											<h3 className="card-title mb-3">Thông tin giao hàng</h3>
										</div>
										<div className="form-row">
											<div className="col form-group">
												<input
												className="form-control"
												onChange={this.handleChange}
												value={this.state.fullname} // Thay đổi từ firstName và lastName thành fullname
												type="text"
												name="fullname" // Thay đổi từ firstName thành fullname
												placeholder="Họ và tên"
											/>
											</div>
										</div>
										<div className="form-row">
										<div className="col form-group">
											<input
												className="form-control"
												onChange={this.handleChange}
												value={this.state.phone} // Thay đổi từ telephone thành phone
												type="tel"
												name="phone" // Thay đổi từ telephone thành phone
												placeholder="Số điện thoại"
											/>
										</div>
											
										</div>
										
											<div className="form-row">
												<div className="col form-group">
													<input
													className="form-control"
													onChange={this.handleChange}
													value={this.state.email}
													type="email"
												
													name="email"
													placeholder="Email"
												/>
												</div>
											</div>
										
										<div className="form-row">
										<div className="col form-group">
											<input
												className="form-control"
												onChange={this.handleChange}
												value={this.state.address}
												type="text"
												name="address"
												placeholder="Địa chỉ cụ thể"
											/>
										</div>
										</div>
										<fieldset style={{
										fontFamily: 'Arial, sans-serif',
										margin: '20px',
										padding: '20px',
										border: '1px solid #ddd',
										borderRadius: '8px',
										backgroundColor: '#f9f9f9'
										}}>
										<legend style={{
											fontSize: '18px',
											fontWeight: 'bold',
											color: '#333'
										}}>Địa chỉ nhận hàng</legend>
										<div>
                      <div style={{ marginBottom: '15px' }}>
                        <label
                          style={{
                            display: 'block',
                            fontWeight: 'bold',
                            marginBottom: '5px',
                            color: '#333'
                          }}
                        >
                          Tỉnh/Thành phố:
                        </label>
                        <select value={selectedProvince} onChange={this.handleProvinceChange}>
                          {provinces.map((province) => (
                            <option key={province.ProvinceID} value={province.ProvinceID}>
                              {province.ProvinceName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedProvince && (
                        <div style={{ marginBottom: '15px' }}>
                          <label
                            style={{
                              display: 'block',
                              fontWeight: 'bold',
                              marginBottom: '5px',
                              color: '#333'
                            }}
                          >
                            Quận/Huyện:
                          </label>
                          <select value={selectedDistrict} onChange={this.handleDistrictChange}>
                            {districts.map((district) => (
                              <option key={district.DistrictID} value={district.DistrictID}>
                                {district.DistrictName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {selectedDistrict && (
                        <div style={{ marginBottom: '15px' }}>
                          <label
                            style={{
                              display: 'block',
                              fontWeight: 'bold',
                              marginBottom: '5px',
                              color: '#333'
                            }}
                          >
                            Phường/Xã:
                          </label>
                          <select value={selectedWard} onChange={this.handleWardChange}>
                            {wards.map((ward) => (
                              <option key={ward.WardCode} value={ward.WardCode}>
                                {ward.WardName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
										</fieldset>

										{/* <button type="submit" className="subscribe btn btn-primary btn-block">Lưu đơn hàng</button> */}
										<button 
											type="button" // Thay đổi từ "submit" sang "button" để không gửi form
											onClick={this.handleVnPayPayment} 
											className="subscribe btn btn-primary btn-block"
											name="redirect"
											>
											Thanh toán VNPay
											</button>
											{/* <button 
											type="button" // Thay đổi từ "submit" sang "button" để không gửi form
											onClick={this.handlePayPalPayment}
											className="subscribe btn btn-primary btn-block"
											name="redirect"
											>
											Thanh toán PAYPAL
											</button> */}
									</div>
								</form>
							)}
						</div>
						
					</div>
						{/* <button type="submit">Thanh toán</button> */}
					{/* <div className="row">
						<div className="col-md-12">
							<Elements stripe={promise}>
								<CheckoutForm />
							</Elements>
						</div>
					</div> */}
				</div>
				<div className="container" id="2" style={{
      padding: '20px',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ddd',
      borderRadius: '10px',
      width: '100%',
      maxWidth: '600px',
    }}>
				<div
  className="order-summary"
  style={{
    padding: '20px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto'
  }}
>
  <div
    className="order-col"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px'
    }}
  >
    <div>
      <strong>Sản Phẩm</strong>
    </div>
    <div>
      <strong>Tổng cộng</strong>
    </div>
  </div>
  <div className="order-products">
    {this.state.checkoutList.map((item) => (
      <div
        key={item.id}
        className="order-col"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '10px',
          padding: '10px',
          backgroundColor: '#f1f1f1',
          borderRadius: '5px'
        }}
      >
        <div>
          {item.stock && item.stock.product && `${item.quantity}x ${item.stock.product.name}`}
        </div>
        <div>
          {item.stock && item.stock.product && `${item.stock.product.price.toFixed(2)} VND`}
        </div>
      </div>
    ))}
  </div>
  <div
    className="order-col"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px'
    }}
  >
    <div>Phí Vận Chuyển</div>
    <div>
        <strong>
            {this.state.shippingFee ? `${this.state.shippingFee.toFixed(2)} VND` : 'Đang tính phí...'}
        </strong>
    </div>
  </div>
  <div
    className="order-col"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px'
    }}
  >
    <div>
      <strong>Tổng Cộng</strong>
    </div>
    <div>
      <strong
        className="order-total"
        style={{ fontSize: '18px', color: '#d9534f' }}
      >
        {this.state.total.toFixed(2)} VND
      </strong>
    </div>
  </div>
</div>

							</div>
			</div>
			
			
		);
	}
}

const mapStateToProps = state => ({
	user: state.user
});

const mapDispatchToProps = dispatch => ({
	addUser: user => dispatch({ type: 'ADD_USER', payload: user })
});

export default connect(mapStateToProps, mapDispatchToProps)(Checkout);
