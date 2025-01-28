// actions.js
import axios from "axios";
export const updateSearchResults = (results) => ({
    type: 'UPDATE_SEARCH_RESULTS',
    value: results,
});
export const setCurrentCategory = (categoryId) => ({
  type: 'SET_CURRENT_CATEGORY',
  value: categoryId,
});
export const fetchProductDetails = (productId) => async (dispatch) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/products/${productId}`);
    dispatch({
      type: 'SET_PRODUCT',
      value: response.data // Sử dụng `value` thay vì `payload`
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
  }
};