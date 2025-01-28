import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ProductItem from './ProductItem';
import { toast } from "react-toastify";

const AllProducts = ({ title, showLogin, updateWishlistCount, showQuickView, currentCategory, searchResults }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    console.log('Fetching products for page:', currentPage);
    fetchProducts(currentPage);
  }, [currentPage, currentCategory]);

  useEffect(() => {
    console.log('Current Page:', currentPage);
    console.log('Last Page:', lastPage);
  }, [currentPage, lastPage]);

  useEffect(() => {
    // Khi có kết quả tìm kiếm, ưu tiên hiển thị kết quả tìm kiếm
    if (searchResults && searchResults.length > 0) {
      setProducts(searchResults); // Nếu có kết quả tìm kiếm, cập nhật sản phẩm với kết quả tìm kiếm
    }
  }, [searchResults]);

  const fetchProducts = async (page) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (currentCategory !== null) {
        response = await axios.get(`http://localhost:8000/api/product/categories/${currentCategory}/new?page=${page}`);
      } else {
        response = await axios.get(`http://localhost:8000/api/productsUser?page=${page}`);
      }
      if (response.data && (response.data.data || Array.isArray(response.data))) {
        // Nếu là trang đầu tiên, thiết lập lại dữ liệu
        if (page === 1) {
          setProducts(Array.isArray(response.data) ? response.data : response.data.data);
        } else {
          // Nếu không phải trang đầu tiên, thêm dữ liệu mới vào danh sách hiện tại
          setProducts(prevProducts =>
            [...prevProducts, ...(Array.isArray(response.data) ? response.data : response.data.data)]
          );
        }
  
        setLastPage(response.data.last_page || 1);
  
        if (page >= response.data.last_page) {
          setAllProductsLoaded(true);
        }
      } else {
        throw new Error('Cấu trúc phản hồi không hợp lệ');
      }
    } catch (error) {
      setError('Không có sản phẩm.');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/product/categories');
      // Thêm mục "Tất cả sản phẩm" vào đầu danh sách
      setCategories([{ id: null, name: 'Tất cả sản phẩm' }, ...response.data]);
    } catch (error) {
      setError('Error fetching categories: ' + error.message);
      console.error('Error fetching categories:', error);
    }
  };

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

  const handlePageChange = (page) => {
    if (page > 0 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductItem
              key={product.id}
              product={product}
              handleWishlist={handleAddToWishlist}
              handleClick={showQuickView}
            />
          ))
        ) : (
          <p>Không có sản phẩm nào.</p>
        )}
      </div>
      
    </div>
  );
};

AllProducts.propTypes = {
  title: PropTypes.string.isRequired,
  showLogin: PropTypes.func.isRequired,
  updateWishlistCount: PropTypes.func.isRequired,
  showQuickView: PropTypes.func.isRequired,
  currentCategory: PropTypes.number,
  searchResults: PropTypes.array.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(AllProducts);
