import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setCurrentCategory } from '../../components/store/actions';

const CategoryFilter = ({ currentCategory, setCurrentCategory }) => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleClick = (categoryId, event) => {
    event.preventDefault();
    setCurrentCategory(categoryId); // Cập nhật danh mục được chọn
     // Thời gian delay để đảm bảo điều hướng hoàn tất trước khi cuộn
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {categories.map((category) => (
          <li
            key={category.id}
          >
            <a
              id={category.id}
              onClick={(event) => handleClick(category.id, event)}
              href="#"
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

CategoryFilter.propTypes = {
  currentCategory: PropTypes.number,
  setCurrentCategory: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currentCategory: state.currentCategory, // Kết nối với state từ Redux
});

const mapDispatchToProps = {
  setCurrentCategory, // Action creator để cập nhật danh mục
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryFilter);
