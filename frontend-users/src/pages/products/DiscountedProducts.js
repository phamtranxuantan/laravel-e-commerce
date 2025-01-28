import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ProductItem from './ProductItem';
import { toast } from "react-toastify";

const DiscountedProducts = ({ showQuickView, showLogin }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Theo dõi trang hiện tại
  const [hasMore, setHasMore] = useState(true); // Kiểm tra còn sản phẩm không
  const [loading, setLoading] = useState(false);

  // Hàm tải sản phẩm từ API
  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/discounted-products?page=${page}`);
      if (response.data.length === 0) {
        setHasMore(false); // Nếu không có sản phẩm nào nữa, ngừng tải thêm
      } else {
        setProducts(prevProducts => [...prevProducts, ...response.data.data]); // Thêm sản phẩm mới vào danh sách hiện tại
      }
    } catch (error) {
      console.error('There was an error fetching the products!', error);
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu trang đầu tiên khi component mount
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Hàm xử lý khi nhấn vào nút "Xem thêm sản phẩm"
  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1); // Tăng số trang hiện tại để tải thêm sản phẩm
  };

  // Hàm xử lý thêm vào danh sách yêu thích
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
    <div>
    {products.length > 0 ? (
      <>
        {/* Thêm style trực tiếp để chỉnh layout của các sản phẩm */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            
          }}
        >
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              handleWishlist={handleAddToWishlist}
              handleClick={showQuickView}
              
            />
          ))}
        </div>
        {loading && <p>Đang tải thêm sản phẩm...</p>}
        {hasMore ? (
          <button
            onClick={handleLoadMore}
            style={loadMoreStyle}
          >
            Xem thêm sản phẩm
          </button>
        ) : (
          <p>Đã hết sản phẩm để xem.</p>
        )}
      </>
    ) : (
      <p>Không có sản phẩm nào.</p>
    )}
  </div>
  
  );
};

// CSS cho nút "Xem thêm sản phẩm"
const loadMoreStyle = {
  padding: '10px 20px',
  backgroundColor: '#ff6a00',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  margin: '20px auto',
  display: 'block',
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

export default connect(mapStateToProps, mapDispatchToProps)(DiscountedProducts);
