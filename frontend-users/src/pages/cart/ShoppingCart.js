import axios from 'axios'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

class ShoppingCart extends Component {
	constructor(props) {
		super(props)

		this.state = {
			userId: '',
			loading: false,
			subtotal: 0,
			total: 0,
			cartList: [],
			selectedList: []
		}

		this.handleChange = this.handleChange.bind(this)
		this.handleDelete = this.handleDelete.bind(this)
		this.handleCheckout = this.handleCheckout.bind(this)
	}

	componentDidMount() {
		
		if(localStorage.getItem('token'))
			this.getAuth(localStorage.getItem('token'))
		else if(localStorage.getItem('cartList'))
			this.getGuestShoppingCartList(localStorage.getItem('cartList'))
	}

	componentDidUpdate() {

		if (this.props.user && this.props.user != 'guest' )
			if (this.props.user.id != this.state.userId)
				this.getAuth(localStorage.getItem('token'))

		if(this.props.user === 'guest' && this.state.userId != '') 
			this.getGuestShoppingCartList(localStorage.getItem('cartList'))
	}

	getAuth(token) {
        axios.get('http://localhost:8000/api/auth', {
            headers: { Authorization: `Bearer ${token}`}
        }).then(result => {
			this.setState({userId: result.data.user.id})

			if(localStorage.getItem('cartList'))
				this.saveToShopppingCart(localStorage.getItem('cartList'))
			else
				this.getShoppingCartList(result.data.user.id)

        }).catch(error => {
			console.log(error)
			if(localStorage.getItem('cartList') !== null)
				this.getGuestShoppingCartList(localStorage.getItem('cartList'))
		})
    }

	getShoppingCartList() {

		this.setState({loading: true})

		axios.get(`http://localhost:8000/api/product/cart-list/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
        }).then(( response ) => {

			let localCartList = null
			if(localStorage.getItem('cartList') !== null)
				localCartList = localStorage.getItem('cartList')

            this.setState({
				cartList: [...response.data],
				localCartList: localCartList,
				loading: false
			})

			this.props.updateCartCount(this.state.cartList.length)
        }).catch(function (error) {
            console.log(error)
        })
	}

	getGuestShoppingCartList(localCartList) {

		this.setState({userId: '', loading: true})
		axios.post('http://localhost:8000/api/product/cart-list/guest', {
            cartList: localCartList,
        }).then(response => {
            this.setState({
				loading: false,
				cartList: [...response.data],
			})
			this.props.updateCartCount(this.state.cartList.length)
        })		
	}

	saveToShopppingCart(localCartList) {

		axios.post('http://localhost:8000/api/product/cart-list', {
			localCartList: localCartList
		}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
        }).then(response => {
			this.getShoppingCartList(this.state.userId)
		}).catch(function (error) {
			console.log(error)
		})

	}

	handleChange(e) {
		if(e.target.type === 'checkbox') {
			let list = this.state.selectedList
			let id = parseInt(e.target.id)
	
			if(id === 0) {
				if(list.length === 0 || list.length < this.state.cartList.length)
					list = this.state.cartList.map(item => item.id)
				else
					list = []
			} else if(this.state.selectedList.includes(id)) {
				list = list.filter(item => item !== id)
			} else {
				list = [...list, id]
			}
	
			this.setState({
				selectedList: list,
			})
	
			this.calcTotal(list)
	
		} else {
	
			let item = this.state.cartList.filter(item => (item.id == e.target.id))
			if (item[0] && item[0].stock) {
				let quantity = item[0].quantity 
	
				if (e.target.className === 'qty-up') {
					quantity += 1
				} else if(e.target.className === 'qty-down') {
					quantity -= 1
				} else if (e.target.type === 'number') {
					quantity = parseInt(e.target.value)
				}
	
				let list = this.state.cartList
				list.map(item => {
					if(item.id == e.target.id) {
						if(quantity > 0) {
							if(item.stock.quantity >= quantity) {
								item.quantity = quantity 
							} else {
								item.quantity = item.stock.quantity
							}
						} else {
							item.quantity = 1
						}
					}
				})
	
				this.setState({cartList: list})
				
				axios.put(`http://localhost:8000/api/product/cart-list/${e.target.id}`, {
					quantity: quantity
				}).then(response => {
					if (response.status === 200) {
						this.calcTotal(this.state.selectedList)
					}
				})
			}
		}
	}
	

	calcTotal(list) {
		let subtotal = 0
		let shipping = 0
	
		this.state.cartList.forEach(item => {
			if (item.stock && item.stock.product) {
				if (list.includes(item.id)) {
					subtotal += (item.stock.product.price * item.quantity)
				}
			}
		})
	
		this.setState({
			subtotal: subtotal,
			total: (subtotal + shipping)
		})
	}
	

	handleDelete(e) {

		let id = parseInt(e.target.id)

		if(this.state.userId) {
			axios.delete(`http://localhost:8000/api/product/cart-list/${id}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
			}).then(response => {
				if(response.status === 200) {
					let list = this.state.selectedList
					list = list.filter(item => item !== id)
					this.calcTotal(list)
					this.setState({selectedList: list})
					
					if (localStorage.getItem('cartList')) {
						let items = JSON.parse(localStorage.getItem('cartList'))
						items = items.filter((item) => 
							(item[0].stock_id !== response.data.stock_id && item[0].userId !== response.data.user_id)
						)
						localStorage.setItem('cartList', JSON.stringify(items))
					}

					this.getShoppingCartList(this.state.userId)
				}
			})		
		} else {
			let items = JSON.parse(localStorage.getItem('cartList'))
			items = items.filter((item, index) => index+1 !== id)
			
			let selectedItems = this.state.selectedList
			selectedItems = selectedItems.filter(item => item != id)
			this.setState({selectedList: selectedItems})

			localStorage.setItem('cartList', JSON.stringify(items))
			this.getGuestShoppingCartList(JSON.stringify(items))

			this.calcTotal(selectedItems)
		}
	}

	handleCheckout(e) {
	
		const id = parseInt(e.target.id)
		
		let selectCheckout = []
		
		if(id !== 0)
			selectCheckout = [id]
		else
			selectCheckout = this.state.selectedList
		
		localStorage.setItem('selectedList', JSON.stringify(selectCheckout))

	} 
	
	render() {
		const selectedItemId = this.state.selectedList.length > 0 ? this.state.selectedList[0] : 0;
		return (
			<React.Fragment>			
			{/* <!-- BREADCRUMB --> */}
			<div id="breadcrumb" className="section">
				{/* <!-- container --> */}
				<div className="container">
					{/* <!-- row --> */}
					<div className="row">
						<div className="col-md-12">
							<h3 className="breadcrumb-header">Giỏ hàng</h3>
							
						</div>
					</div>
					{/* <!-- /row --> */}
				</div>
				{/* <!-- /container --> */}
			</div>
			{/* <!-- /BREADCRUMB --> */}
		
			{localStorage.getItem("token") ? (
				
				<section className="section-content padding-y">
					<div className="container">
						<div className="row">
							
							<form >
								<main className="col-md-9">
									<div className="card">
										<table className="table table-borderless table-shopping-cart">
											<thead className="text-muted">
												<tr className="small text-uppercase">
													<th scope="col">Chọn</th>
													<th scope="col">Sản phẩm</th>
													<th scope="col" width="120">Số lượng</th>
													<th scope="col" width="120">Giá</th>
													<th scope="col" className="text-right" width="200"></th>
												</tr>
											</thead>
											<tbody>
												{this.state.cartList.length > 0 ? (
													this.state.cartList.map((item) => (
														item && item.stock && item.stock.product ? (
															<tr key={item.id}>
																<td>
																	<div className="input-checkbox" style={{ margin: 'center' }}>
																		<input
																			type="checkbox"
																			id={item.id}
																			checked={this.state.selectedList.includes(item.id)}
																			onChange={this.handleChange}
																		/>
																		<label htmlFor={item.id}>
																			<span></span>
																		</label>
																	</div>
																</td>
																<td>
																	<figure className="itemside">
																		<div className="aside">
																			<img
																				src={`http://localhost:8000/img/${JSON.parse(item.stock.product.photo)[0]}`}
																				className="img-sm"
																				alt={item.stock.product.name}
																			/>
																		</div>
																		<figcaption className="info">
																			<a href={`/products/${item.stock.product.id}`} className="title text-dark">
																				{item.stock.product.name}
																			</a>
																			<p className="text-muted small">
																				Kích cỡ: {item.stock.size}, Màu sắc: {item.stock.color}
																			</p>
																		</figcaption>
																	</figure>
																</td>
																<td>
																	<div className="buy-item">
																		<div className="qty-label">
																			Số lượng
																			<div className="input-number">
																				<input
																					id={item.id}
																					type="number"
																					value={item.quantity}
																					onChange={this.handleChange}
																				/>
																				<span id={item.id} className="qty-up" onClick={this.handleChange}></span>
																				<span id={item.id} className="qty-down" onClick={this.handleChange}></span>
																			</div>
																		</div>
																	</div>
																</td>
																<td>
																	<div className="price-wrap">
																		<var className="price">${item.stock.product.price}</var>
																	</div>
																</td>
																<td className="text-right">
																	
																	<a href="#" className="btn btn-light" id={item.id} onClick={this.handleDelete} >
																		Xoá
																	</a>
																</td>
															</tr>
														) : null
													))
												) : (
													<tr>
														<td colSpan="4" className="text-center">Giỏ hàng của bạn đang trống!</td>
													</tr>
												)}
											</tbody>
										</table>
		
										<div className="card-body border-top">
											<Link onClick={this.handleCheckout} to={'/checkout'}>
												<button
												
												total={this.state.total} items={this.state.items}
													id={selectedItemId}
													onClick={this.handleCheckout}
													className="btn btn-primary float-md-right"
												>
													Thanh toán <i className="fa fa-chevron-right"></i>
												</button>
											</Link>
											<Link to="/" className="btn btn-light">
												<i className="fa fa-chevron-left"></i> Tiếp tục mua hàng
											</Link>
										</div>
									</div>
								</main>
							</form>
							
							<aside className="col-md-3">
								<div className="card mb-3">
									<div className="card-body">
										<form>
											<div className="form-group">
												<label>Bạn có mã giảm giá?</label>
												<div className="input-group">
													<input type="text" className="form-control" placeholder="Mã giảm giá" />
													<span className="input-group-append">
														<button className="btn btn-primary">Áp dụng</button>
													</span>
												</div>
											</div>
										</form>
									</div>
								</div>
		
								<div className="card" style={{ backgroundColor: "#ff6a00" }}>
									<div className="card-body">
										<div className="dlist-align">
											<div>Tổng giá trị:</div>
											<div className="text-right">${this.state.subtotal.toFixed(2)}</div>
										</div>
										<div className="dlist-align">
											<div>Tổng cộng:</div>
											<div className="text-right h5">
												<strong className={this.state.selectedList.length !== 0 ? "order-total" : "order-total-disabled"}>
													${this.state.total.toFixed(2)}
												</strong>
											</div>
										</div>
									</div>
								</div>
							</aside>
						</div>
					</div>
				</section>
			) : (
				<h3>
                                Vui lòng đăng nhập để có thể thêm hoặc xem sản phẩm trong danh sách
                                giỏ hàng của bạn!
                            </h3>
			)}
		</React.Fragment>
		
		)
	}
} 

const mapStateToProps = state => {
    return {
		user: state.user_data
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateCartCount: ( (cartCount) => dispatch({type: 'CART_COUNT', value: cartCount})),
		showLogin: (() => dispatch({type: 'LOGIN_CONTROL', value: true})),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShoppingCart)