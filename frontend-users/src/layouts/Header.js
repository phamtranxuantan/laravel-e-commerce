import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { setCurrentCategory, updateSearchResults } from '../components/store/actions';
import Authentification from '../pages/auth/Authentification';
import CategoryFilter from '../pages/home/CategoryFilter';
import './dropdown.css';

const Header = (props) => {
    const [cartItemCount, setCartItemCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getShoppingCartCount();
            getWishlistCount();
        } else {
            const cartList = localStorage.getItem('cartList');
            if (cartList) {
                props.updateCartCount(JSON.parse(cartList).length);
            }
            const wishlistCount = parseInt(localStorage.getItem('wishlist_count')) || 0;
            props.updateWishlistCount(wishlistCount);
        }
    }, [props.cartCount, props.wishlistCount]);

    const getShoppingCartCount = () => {
        axios.get('http://localhost:8000/api/product/cart-list/count', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(result => {
            const localCartList = JSON.parse(localStorage.getItem('cartList')) || [];
            const stockList = localCartList.map(list => list[0]?.stock_id || null).filter(Boolean);
            const cartList = [...stockList, ...result.data];
            const uniqueCartList = [...new Set(cartList)];
            setCartItemCount(uniqueCartList.length);
            props.updateCartCount(uniqueCartList.length);
        }).catch(error => {
            console.error('Error fetching cart count:', error);
        });
    };

    const getWishlistCount = () => {
        axios.get('http://localhost:8000/api/product/wishlist/count', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(result => {
            setWishlistCount(result.data);
            props.updateWishlistCount(result.data.data);
        }).catch(error => {
            console.error('Error fetching wishlist count:', error);
        });
    };

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get('http://localhost:8000/api/search', {
                params: { keyword: query }
            });
            const searchResults = response.data || [];
            console.log('Search results:', searchResults);
            props.updateSearchResults(searchResults);
        } catch (error) {
            console.error('Error searching for products:', error.message);
            props.updateSearchResults([]);
        }
    };

    const toggleCategoryDropdown = () => {
        setIsCategoryDropdownOpen(prevState => !prevState);
    };

    const handleCategoryChange = (categoryId) => {
        props.setCurrentCategory(categoryId); // Dispatch action to Redux
        setIsCategoryDropdownOpen(false); // Đóng dropdown sau khi chọn danh mục
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const logout = () => {
        localStorage.removeItem('token');
        props.removeUser(); // Call removeUser from props
    };

    const handleClick = (e) => {
        if (e.target.id === 'logout') {
            logout();
        }
    };

    const { user } = props;

    return (
        <header className="section-header">
            <section className="header-main border-bottom">
                <div className="container flex-row">
                    <div className="row align-items-center">
                        <div className="imglogo">
                            <Link to="/" className="brand-wrap">
                                <img style={{minHeight: 70, width: 150}} className="logo" src="./images/hotdeal.png" alt="Logo" />
                            </Link>
                        </div>
                        <div className="dropdown">
                            <button
                                type="button"
                                className="btn btn-light dropdown-toggle dropbtn"
                                onClick={toggleCategoryDropdown}
                            >
                                Danh mục
                            </button>
                            <div class="dropdown-content">
                                <CategoryFilter
                                    currentCategory={props.currentCategory} // Lấy từ Redux
                                    setCurrentCategory={handleCategoryChange} // Cập nhật qua Redux
                                />
                            </div>
                        </div>
                        <div className="col-lg-4 col-xl-5 col-sm-8 col-md-4 d-none d-md-block">
                            <form onSubmit={handleSearch} className="search-wrap">
                                <div className="input-group w-100">
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ width: '55%' }}
                                        placeholder="Tìm kiếm sản phẩm..."
                                        onChange={handleQueryChange}
                                    />
                                    <div className="input-group-append">
                                        <button className="btn btn-primary" type="submit">
                                            <i className="fa fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="col-lg-5 col-xl-4 col-sm-8 col-md-4 col-7">
                            <div className="widgets-wrap d-flex justify-content-end">
                                <div className="widget-header">
                                    <Link to="/wishlist" className="ml-4 icontext">
                                        <div className="icon"><i className="text-primary fa fa-lg fa-heart"></i></div>
                                        <div className="text">
                                            <small className="text-muted">Yêu thích</small>
                                            <div>{props.wishlistCount} Sản phẩm</div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="widget-header">
                                    <Link to="/shopping-cart" className="ml-4 icontext">
                                        <div className="icon"><i className="text-primary fa fa-lg fa-shopping-cart"></i></div>
                                        <div className="text">
                                            <small className="text-muted">Giỏ hàng</small>
                                            <div>{props.cartCount} Sản phẩm</div>
                                        </div>
                                    </Link>
                                </div>
                                <div 
                                    className="widget-header dropdown" 
                                    style={{
                                        position: 'relative', 
                                        display: 'inline-block'
                                    }}>
                                    <Authentification 
                                        style={{
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            cursor: 'pointer',
                                            listStyle: 'none',
                                            padding: '0',
                                            margin: '0'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </header>
    );
};

const mapStateToProps = (state) => ({
    cartCount: state.cart_count,
    wishlistCount: state.wishlist_count,
    searchResults: state.search_results,
    currentCategory: state.currentCategory,
    user: state.user_data
});

const mapDispatchToProps = (dispatch) => ({
    updateCartCount: (count) => dispatch({ type: 'CART_COUNT', value: count }),
    updateWishlistCount: (count) => dispatch({ type: 'WISHLIST_COUNT', value: count }),
    updateSearchResults: (results) => dispatch(updateSearchResults(results)),
    setCurrentCategory: (categoryId) => dispatch(setCurrentCategory(categoryId)),
    removeUser: () => dispatch({ type: 'USER', value: 'guest' })
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
