// reducers.js

const initialState = {
    user_data: '',
    show_modal: false,
    show_login: false,
    product_id: '',
    cart_count: parseInt(localStorage.getItem('cart_count')) || 0,
    wishlist_count: parseInt(localStorage.getItem('wishlist_count')) || 0,
    toast_show: false,
    toast_message: '',
    search_results: [],// Thêm trạng thái tìm kiếm
    currentCategory: null,
    product:'',
  };
  
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case 'USER':
        return {
          ...state,
          user_data: action.value
        };
      case 'MODAL_CONTROL':
        return {
          ...state,
          show_modal: action.value
        };
      case 'LOGIN_CONTROL':
        return {
          ...state,
          show_login: action.value
        };
      case 'QUICKVIEW_CONTROL':
        return {
          ...state,
          product_id: action.value,
          show_modal: true
        };
      case 'CART_COUNT':
        localStorage.setItem('cart_count', action.value);
        return {
          ...state,
          cart_count: action.value
        };
      case 'WISHLIST_COUNT':
        localStorage.setItem('wishlist_count', action.value);
        return {
          ...state,
          wishlist_count: action.value
        };
      case 'SHOW_TOAST':
        return {
          ...state,
          toast_show: true,
          toast_message: action.value
        };
      case 'HIDE_TOAST':
        return {
          ...state,
          toast_show: false
        };
      case 'UPDATE_SEARCH_RESULTS':
        return { 
          ...state,
          search_results: action.value };
      case 'SET_CURRENT_CATEGORY':
        return {
          ...state,
          currentCategory: action.value,
        };
      case 'SET_PRODUCT':
        return { ...state,
          product: action.value };
      default:
        return state;
    }
  };
  
  export default reducer;