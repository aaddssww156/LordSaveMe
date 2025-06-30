import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductItem = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-item">
      <Link to={`/product/${product.id}`}>
        <img 
          src={product.image || 'https://via.placeholder.com/250'} 
          alt={product.name} 
          className="product-image" 
        />
      </Link>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
      </div>
      <div className="product-footer">
        <span className="product-price">${product.price}</span>
        <button 
          className="add-to-cart-btn" 
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductItem;