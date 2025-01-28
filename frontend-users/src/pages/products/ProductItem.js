import PropTypes from 'prop-types';
import React from "react";
import Button from 'react-bootstrap/Button';

const ProductItem = ({ product, handleWishlist, handleClick }) => {
  const { name, description, price, discounted_price, created_at, discount } = product;

  return (
    <div className="col-md-3">
      <figure className="card card-product-grid">
        <div className="img-wrap">
          <img 
            src={product.photo ? `http://localhost:8000/img/${JSON.parse(product.photo)[0]}` : 'default-placeholder.jpg'}
            alt={name}
          />
        </div>
        <figcaption className="info-wrap">
          <a href="#" className="title mb-2">{name}</a>
          <div className="price-wrap">
            {discount > 0 ? (
              <>
                <span className="price">{discounted_price} VNĐ</span>
                <small className="text-muted" style={{ textDecoration: 'line-through', marginLeft: '10px' }}>{price} VNĐ</small>
              </>
            ) : (
              <span className="price">{price} VNĐ</span>
            )}
          </div>
          <p className="mb-2">{description}</p>
          <hr />
          {created_at && <span className="badge new-badge">Mới</span>}
          {discount > 0 && <span className="badge sale-badge">Khuyến mãi</span>}
          <label className="custom-control mb-3 custom-checkbox">
            <input type="checkbox" className="custom-control-input" />
            <div className="custom-control-label">Add to compare</div>
          </label>
          <Button 
            id={product.id} 
            className="add-to-wishlist" 
            onClick={() => handleClick(product.id)} 
            bsPrefix="q"
            style={{ display: 'block', backgroundColor: '#007bff', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', width: '100%', textAlign: 'center', marginTop: '10px' }}
          >
            <i className="fa fa-eye"></i>
            <span className="tooltipp" style={{ marginLeft: '5px' }}>Xem Nhanh</span>
          </Button>
          <Button 
            id={product.id} 
            className="add-to-wishlist" 
            onClick={() => handleWishlist(product.id)}
            style={{ display: 'block', backgroundColor: '#28a745', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', width: '100%', textAlign: 'center', marginTop: '10px' }}
          >
            <i className="fa fa-heart-o"></i>
            <span className="tooltipp" style={{ marginLeft: '5px' }}>Thêm yêu thích</span>
          </Button>
        </figcaption>
      </figure>
    </div>
  );
};

ProductItem.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    discounted_price: PropTypes.number,
    isNew: PropTypes.bool,
    discount: PropTypes.number,
    photo: PropTypes.string,
  }).isRequired,
  handleWishlist: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
};

export default ProductItem;
