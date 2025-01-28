import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import ProductItem from './ProductItem';
import { toast } from "react-toastify";
import Slider from "react-slick";

// Cấu hình cho slick slider
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};

const NewProducts = ({ showLogin, showQuickView }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/new-products')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the products!', error);
        setLoading(false);
      });
  }, []);

  const handleAddToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showLogin();
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/api/product/wishlist',
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đã thêm vào yêu thích');
      console.log('Add to wishlist response:', response.data);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  return (
    <div className="container">
      {loading ? (
        <p>Đang tải dữ liệu...</p> // Hiển thị trạng thái đang tải
      ) : products.length > 0 ? (
        <>
        
        <Slider {...settings}>
          {products.map(product => (
            <ProductItem
              key={product.id}
              product={product}
              handleWishlist={handleAddToWishlist}
              handleClick={showQuickView}
            />
          ))}
        </Slider>
       
        </>
        
      ) : (
        <p>Không có sản phẩm nào.</p> // Hiển thị khi đã tải xong mà không có sản phẩm
      )}
    </div>
  );
};

NewProducts.propTypes = {
  showLogin: PropTypes.func.isRequired,
  showQuickView: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  searchResults: state.search_results,
  currentCategory: state.currentCategory,
});

const mapDispatchToProps = (dispatch) => ({
  showQuickView: (id) => dispatch({ type: 'QUICKVIEW_CONTROL', value: id }),
  showLogin: () => dispatch({ type: 'LOGIN_CONTROL', value: true }),
  updateWishlistCount: (count) => dispatch({ type: 'WISHLIST_COUNT', value: count }),
  showToast: (msg) => dispatch({ type: 'SHOW_TOAST', value: msg }),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewProducts);
