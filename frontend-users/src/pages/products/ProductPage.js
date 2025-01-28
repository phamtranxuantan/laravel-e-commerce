import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

const ProductPage = ({ title, showLogin, updateWishlistCount, currentCategory, searchResults }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);

  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setAllProductsLoaded(false);
    fetchProducts(1);
  }, [currentCategory]);

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setProducts(searchResults);
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
          setProducts(prevProducts => 
              page === 1
              ? (Array.isArray(response.data) ? response.data : response.data.data)
              : [...prevProducts, ...(Array.isArray(response.data) ? response.data : response.data.data)]
          );
          setLastPage(response.data.last_page || 1);

          if (page >= response.data.last_page) {
              setAllProductsLoaded(true);
          }
        } else {
          throw new Error('Invalid response structure');
        }
    } catch (error) {
        setError('Không có sản phẩm.');
        console.error('Error fetching products:', error);
    } finally {
        setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
  };

  const chunkArray = (array, size) => {
    if (!array || !array.length) return [];
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
  };
  const productRows = chunkArray(products, 4);

  return (
    <div>
      
    </div>
  );
};

ProductPage.propTypes = {
  title: PropTypes.string.isRequired,
  showLogin: PropTypes.func.isRequired,
  updateWishlistCount: PropTypes.func.isRequired,
  currentCategory: PropTypes.number,
  searchResults: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  searchResults: state.search_results,
  currentCategory: state.currentCategory,
});

const mapDispatchToProps = (dispatch) => ({
  showLogin: () => dispatch({ type: 'LOGIN_CONTROL', value: true }),
  updateWishlistCount: (count) => dispatch({ type: 'WISHLIST_COUNT', value: count }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductPage);
