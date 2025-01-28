import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { connect } from 'react-redux';
import Slider from 'react-slick';

function Product(props) {
    
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
  const [avaibleQuantity, setAvaibleQuantity] = useState('')
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
      stock = stock[0]

      if(localStorage.getItem('token')) {
          axios.post('http://localhost:8000/api/product/cart-list', {
              stockId: stock.id,
              quantity: quantity,
              
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
                      if (avaibleQuantity > (item[0].quantity + quantity))
                          item[0].quantity += quantity
                      else
                          item[0].quantity = avaibleQuantity
                          
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


    if (loading) {
        return (
            <div className="spinner-container">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <section className="section-content bg-white padding-y">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="gallery-wrap">
                                <div className="img-big-wrap">
                                <Slider {...settings}>
                                        {product && JSON.parse(product.photo).map((photo, index) => (
                                            <div key={index} className="thumbs-wrap">
                                                <img
                                                    src={photo ? `http://localhost:8000/img/${photo}` : 'default-placeholder.jpg'}
                                                    alt="Product"
                                                />
                                            </div>
                                        ))}
                                    </Slider>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="product-info-aside">
                            <h2 className="title mt-3">{product.name}</h2>
                            <div className="rating-wrap my-3">
                                <ul className="rating-stars">
                                    <li style={{width: `${(product.review / 5) * 100}%`}} className="stars-active">
                                        <i className="fa fa-star"></i> <i className="fa fa-star"></i> 
                                        <i className="fa fa-star"></i> <i className="fa fa-star"></i> 
                                        <i className="fa fa-star"></i> 
                                    </li>
                                    <li>
                                        <i className="fa fa-star"></i> <i className="fa fa-star"></i> 
                                        <i className="fa fa-star"></i> <i className="fa fa-star"></i> 
                                        <i className="fa fa-star"></i> 
                                    </li>
                                </ul>
                                <small className="label-rating text-muted">{product.num_reviews} reviews</small>
                                <small className="label-rating text-success"> <i className="fa fa-clipboard-check"></i> {product.orders} orders </small>
                            </div>
                            <div className="mb-3">
                                {new Date(product.sale_expires).getTime() > new Date().getTime() ? (
                                    <React.Fragment>
                                        <var className="price h4"> USD {product.price - (product.price * product.sale)} </var>
                                        <span className="text-muted">
                                            USD {product.price} incl. VAT
                                        </span>
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <var className="price h4"> USD {product.price} </var>
                                        <span className="text-muted">
                                            USD {product.price} incl. VAT
                                        </span>
                                    </React.Fragment>
                                )}
                                
                                <span className="product-available">{avaibleQuantity ? 'In Stock' : 'Out of Stock'}</span>
                            </div>
                            <p>{product.description}</p>
                            <div className="product-options">
                            <label>
                                            Size
                                            <select className="input-select" onChange={handleChange}>
                                                { stocks.length && [...new Set(stocks.map(stock => stock.size))].map((stockSize,index) => (
                                                    <React.Fragment key={index}>
                                                        { (selectedSize == '' && index == 0) && setSelectedSize(stockSize)}
                                                        <option value={stockSize}>{stockSize}</option>
                                                    </React.Fragment>
                                                ))}
                                            </select>
                                        </label>
                                        <label>
                                            Color
                                            <select className="input-select" onChange={handleChange}>
                                                { stocks.length && stocks.map( (stock, index) => (
                                                    <React.Fragment key={stock.id}>
                                                        { (selectedColor === '' && index == 0) && setSelectedColor(stock.color)}
                                                        { (avaibleQuantity === '' && index == 0) && setAvaibleQuantity(stock.quantity)}
                                                        { selectedSize === stock.size && <option value={stock.color}>{stock.color}</option>}
                                                    </React.Fragment>
                                                ))}
                                            </select>
                                        </label>
                            </div>
                            <sub>{(avaibleQuantity ? 'Chỉ ' : 'There are ')} {avaibleQuantity} (Các) mặt hàng có sẵn!</sub>   
                            <div className="form-row mt-4">
                                <div className="form-group col-md flex-grow-0">
                                    <div className="input-group mb-3 input-spinner">
                                        <div className="input-group-prepend">
                                            <button className="btn btn-light" type="button" onClick={handleIncrement}> + </button>
                                        </div>
                                        <input type="text" className="form-control" value={quantity} onChange={handleChange} />
                                        <div className="input-group-append">
                                            <button className="btn btn-light" type="button" onClick={handleDecrement}> &minus; </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group col-md">
                                    <button className="btn btn-primary" onMouseLeave={handleMouseLeave} onClick={handleClick} disabled={!avaibleQuantity}>
                                            { cartButtonInit ?
                                            <React.Fragment>
                                            <i className="fa fa-shopping-cart"></i>
                                            <span className="text">them vo gio hang</span>
                                            </React.Fragment>   
                                            :
                                            cartLoading ?
                                                <React.Fragment>
                                                    <i><Spinner
                                                        as="span"
                                                        animation="grow"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                    /></i>
                                                    <span>Adding...</span>
                                                </React.Fragment>
                                                :
                                                <React.Fragment>
                                                    <i className="fa fa-check"></i>
                                                    <span>Added</span>
                                                </React.Fragment>
                                            }
                                        </button>
                                    <button className="btn btn-light">
                                        <i className="fas fa-envelope"></i> <span className="text">Contact supplier</span>
                                    </button>
                                </div>
                            </div>
                            <ul className="product-btns">
                                <li>
                                    <a href="#" onClick={handleWishlist}>
                                        <i className="fa fa-heart-o"></i> Add to wishlist
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div id="product-tab">
                            <ul className="tab-nav">
                                <li className="active">
                                    <a data-toggle="tab" href="#tab1"> Description</a> 
                                </li>
                                <li>
                                    <a data-toggle="tab" href="#tab2">Details</a> 
                                </li>
                                <li>
                                    <a data-toggle="tab" href="#tab3">Reviews ({product.reviews_count})</a>
                                </li>
                            </ul>
                            <div className="tab-content">
                                {/* Tab contents go here */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Product)
