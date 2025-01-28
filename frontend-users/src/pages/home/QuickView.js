import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Spinner from 'react-bootstrap/Spinner'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Slider from 'react-slick'


function QucikView(props) {
    
    const [userId, setUserId] = useState('')
    const [loading, setloading] = useState(true)
    const [cartLoading, setCartLoading] = useState(false)
    const [cartButtonInit, setCartButtonInit] = useState(true)
    const [productId, setProductId] = useState('')
    const [product, setProduct] = useState('')
    const [stocks, setStocks] = useState([])
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [cartCount, setCartCount] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [avaibleQuantity, setAvaibleQuantity] = useState(0)
    const [availableQuantity, setAvailableQuantity] = useState(0);
    const [settings] = useState({
        dots: true,
        arrows: true,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1
    })
 
    const handleClose = () => {
        props.updateCartCount(cartCount)
        props.hideQuickView()
    }

    function getProduct(id) {
        setloading(true)
        axios.get(`http://localhost:8000/api/productssss/${id}`).then((
            response
        ) => {
            setProductId(id)
            setProduct(response.data)
            setStocks([...response.data.stocks])
            setloading(false)
        })
    }

    

    function handleClick() {

        setCartLoading(true)
        setCartButtonInit(false)

        let stock = stocks.filter(item => (item.size == selectedSize && item.color == selectedColor))
        if (!stock) {
            // Xử lý khi không tìm thấy sản phẩm
            console.error('No stock found with selected size and color');
            return;
        }        
        stock = stock[0]

        if(localStorage.getItem('token')) {
            axios.post('http://localhost:8000/api/product/cart-list', {
                stockId: stock.id,
                quantity: quantity
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
            }).then(response => {
                setCartCount(response.data)
                setCartLoading(false)
            })

        } else {
            let cartItem = [
                {
                    'stock_id': stock.id,
                    'quantity': quantity
                }
            ]
            
            let items = []
            
            if(localStorage.getItem('cartList')) {
                items = JSON.parse(localStorage.getItem('cartList'))

                items.map(item => {
                    if (item[0].stock_id == stock.id) {
                        if (avaibleQuantity > (item[0].quantity + quantity)) {
                            item[0].quantity += quantity;
                        } else {
                            item[0].quantity = avaibleQuantity;
                        }                        
                        cartItem = '';
                    } 
                })
            }
            
            if(cartItem)
                items.unshift(cartItem) 
            
            setCartCount(items.length)
            localStorage.setItem('cartList', JSON.stringify(items))
            setCartLoading(false)
        }
    }   

    const handleIncrement = () => {
        if (quantity < availableQuantity) {
            setQuantity(prevQuantity => prevQuantity + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };
    
    const handleChange = (e) => {
        const value = e.target.value;

        if (e.target.className === 'input-select') {
            let found = false;
            stocks.forEach((stock) => {
                if (stock.size === value && !found) {
                    setSelectedSize(value);
                    setAvailableQuantity(stock.quantity);
                    found = true;
                }
                if (stock.color === value) {
                    setSelectedColor(value);
                    setAvailableQuantity(stock.quantity);
                }
            });
        }

        if (e.target.type === 'number') {
            const numValue = parseInt(value, 10);
            if (numValue >= 1 && numValue <= availableQuantity) {
                setQuantity(numValue);
            } else if (numValue < 1) {
                setQuantity(1);
            }
        }
    };

    function handleMouseLeave() {
        setCartButtonInit(true)
    }

    function handleWishlist(e) {

        e.preventDefault()

		if(!localStorage.getItem('token')) {
			this.props.showLogin()
		} else {
			axios.post('http://localhost:8000/api/product/wishlist', {
				productId: e.target.id
			}, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
			}).then(response => {
				if(response.status === 200) {
					props.updateWishlistCount(response.data)
					props.showToast('Added to wishlist!')
				} 
			}).catch(error => {
				props.showToast('Product is already in the wishlist!')
			})
		}
	}

    useEffect(() => {

        if(props.productId > 0 ) {
            if(productId != props.productId) {
                setProduct('')
                setStocks([])
                setSelectedSize('')
                setSelectedColor('')
                setAvaibleQuantity('')
            }
            
            getProduct(props.productId)
        }
        

    }, [props.productId])


    return (
        <React.Fragment>
        <Modal size="lg" show={props.showModal} onHide={handleClose}>
                
                <Modal.Header closeButton>
                    <Modal.Title>
                        <h4>Xem Nhanh</h4>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {loading ? <div className="spinner-container"><Spinner animation="border" /></div> :
                product && <React.Fragment>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                            <div id="product-img-container" className="col-md-6" style={{ paddingRight: '20px' }}>
                                {/* <!-- Product thumb imgs --> */}
                                <div id="product-imgs">
                                <Slider {...settings}>
                                    {JSON.parse(product.photo).map((photo, index) => (
                                    <div key={index} className="product-preview" style={{ textAlign: 'center', marginBottom: '10px' }}>
                                        <img
                                        height="300"
                                        width="300"
                                        src={product.photo ? `http://localhost:8000/img/${JSON.parse(product.photo)[index]}` : 'default-placeholder.jpg'}
                                        alt={photo}
                                        style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                                        />
                                    </div>
                                    ))}
                                </Slider>
                                </div>
                                {/* <!-- /Product thumb imgs --> */}
                            </div>
                            <div id="product-detail-container" className="col-md-6" style={{ paddingLeft: '20px' }}>
                                {/* <!-- Product details --> */}
                                <div className="product-details">
                                <h2 className="product-name" style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{product.name}</h2>
                                <div>
                                    <a className="review-link" href="#" style={{ color: '#ff6a00', textDecoration: 'none', marginBottom: '10px', display: 'inline-block' }}>
                                    {product.num_reviews} Review(s) | Add your review
                                    </a>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    {(new Date(product.sale_expires).getTime() > new Date().getTime()) ? (
                                    <h3 className="product-price" style={{ color: '#ff6a00', fontWeight: 'bold' }}>
                                        ${product.price - (product.price * product.sale)} <del className="product-old-price" style={{ color: '#7f8c8d' }}>${product.price}</del>
                                    </h3>
                                    ) : (
                                    <h3 className="product-price" style={{ color: '#ff6a00', fontWeight: 'bold' }}>${product.price}</h3>
                                    )}
                                    <span className="product-available" style={{ color: avaibleQuantity ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                                    {avaibleQuantity ? 'In' : 'Out of'} Stock
                                    </span>
                                </div>
                                <p style={{ color: '#555', lineHeight: '1.6' }}>{product.description}</p>

                                <div className="product-options" style={{ marginBottom: '15px' }}>
                                    <label style={{ marginRight: '15px' }}>
                                    Kích cỡ
                                    <select className="input-select" onChange={handleChange} style={{ marginLeft: '5px', padding: '5px', borderRadius: '5px' }}>
                                        {stocks.length && [...new Set(stocks.map(stock => stock.size))].map((stockSize, index) => (
                                        <React.Fragment key={index}>
                                            {(selectedSize === '' && index === 0) && setSelectedSize(stockSize)}
                                            <option value={stockSize}>{stockSize}</option>
                                        </React.Fragment>
                                        ))}
                                    </select>
                                    </label>
                                    <label>
                                    Màu sắc
                                    <select className="input-select" onChange={handleChange} style={{ marginLeft: '5px', padding: '5px', borderRadius: '5px' }}>
                                        {stocks.length && stocks.map((stock, index) => (
                                        <React.Fragment key={stock.id}>
                                            {(selectedColor === '' && index === 0) && setSelectedColor(stock.color)}
                                            {(avaibleQuantity === '' && index === 0) && setAvaibleQuantity(stock.quantity)}
                                            {selectedSize === stock.size && <option value={stock.color}>{stock.color}</option>}
                                        </React.Fragment>
                                        ))}
                                    </select>
                                    </label>
                                </div>

                                <div className="add-to-cart" style={{ marginBottom: '15px' }}>
                                    <div className="qty-label" style={{ marginBottom: '10px' }}>
                                    Số lượng
                                    <div className="input-number" style={{ display: 'inline-block', marginLeft: '10px' }}>
                                        <input
                                        type="number"
                                        disabled={!availableQuantity}
                                        value={availableQuantity ? quantity : 1}
                                        onChange={handleChange}
                                        style={{ width: '50px', padding: '5px', borderRadius: '5px', textAlign: 'center' }}
                                        />
                                    </div>
                                    </div>

                                    <button
                                    className="add-to-cart-btn"
                                    onMouseLeave={handleMouseLeave}
                                    onClick={handleClick}
                                    disabled={!avaibleQuantity}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: avaibleQuantity ? '#ff6a00' : '#95a5a6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: avaibleQuantity ? 'pointer' : 'not-allowed',
                                        fontWeight: 'bold',
                                    }}
                                    >
                                    {cartButtonInit ? (
                                        <>
                                        <i className="fa fa-shopping-cart"></i>
                                        <span style={{ marginLeft: '5px' }}>Thêm vào giỏ hàng</span>
                                        </>
                                    ) : cartLoading ? (
                                        <>
                                        <i><Spinner
                                            as="span"
                                            animation="grow"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        /></i>
                                        <span>Đang thêm...</span>
                                        </>
                                    ) : (
                                        <>
                                        <i className="fa fa-check"></i>
                                        <span style={{ marginLeft: '5px' }}>Đã thêm</span>
                                        </>
                                    )}
                                    </button>
                                    <br />
                                    <sub>{avaibleQuantity ? 'Chỉ ' : 'There are '} {avaibleQuantity} (Các) mặt hàng có sẵn!</sub>
                                </div>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>Danh mục: {product.category.name}</span>
                                </div>
                                {/* <!-- /Product details --> */}
                            </div>
                            </div>

                            <Link to={`/product-detail/${props.productId}`}>
                                <Button 
                                    bsPrefix="qv" 
                                    style={{
                                    backgroundColor: '#ff6a00',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    borderRadius: '5px',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#e65c00'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#ff6a00'}
                                >
                                    <span>Chi tiết</span>
                                </Button>
                                </Link>

                    </React.Fragment>}
                </Modal.Body>
        </Modal>
        </React.Fragment>
    )
}

const mapStateToProps = state => {
    return {
        productId: state.product_id,
        showModal: state.show_modal
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateCartCount: ( (count) => dispatch({type: 'CART_COUNT', value: count})),
        updateWishlistCount: ( (count) => dispatch({type: 'WISHLIST_COUNT', value: count})),
        showToast: ( (msg) => dispatch({type: 'SHOW_TOAST', value: msg})),
        hideQuickView: ( () => dispatch({type: 'MODAL_CONTROL', value: false}))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QucikView)