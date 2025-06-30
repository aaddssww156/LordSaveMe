import React, { useState, useEffect } from 'react';
import API from '../../api';

import ProductItem from '../components/ProductItem';

import '../css/marketplace.css';


const DrumsCategoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrums = async () => {
      try {
        const response = await API.get('/api/products/?category=electric-guitars');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to load drums');
      } finally {
        setLoading(false);
      }
    };

    fetchDrums();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading electric-guitars...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="marketplace-page">
      <h1>Electric-guitars</h1>
      <div className="products-grid">
        {products.map(product => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default DrumsCategoryPage;