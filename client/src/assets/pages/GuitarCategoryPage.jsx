import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductsByCategory } from '../../api';
import ProductItem from '../components/ProductItem';
import BurgerMenu from '../components/BurgerMenu';
import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';
import '../css/styles.css';
import '../css/marketplace.css';

const GuitarCategoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { categorySlug } = useParams();
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductsByCategory(categorySlug);
        setProducts(response.data);
      } catch (err) {
        setError(`Failed to load ${categorySlug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading guitars...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="guitar-category-page">
      <header>
        <div className="logo-title">
          <img src={guitarImg} alt="guitar" />
          <h1>Rythm Road</h1>
        </div>
        <BurgerMenu />
        <nav className="desktop-nav">
          <ul className="nav-list">
            <li><Link to="/">HOMEPAGE</Link></li>
            <li className="dropdown active">
              <Link to="/marketplace">MARKETPLACE</Link>
              <ul className="dropdown-content">
                <li><Link to="/marketplace/guitars">Guitars</Link></li>
                <li><Link to="/marketplace/drums">Drums</Link></li>
              </ul>
            </li>
            <li className="dropdown">
              <Link to="/table">ABOUT US</Link>
              <ul className="dropdown-content">
                <li><Link to="/quiz">Quiz</Link></li>
                <li><Link to="/table">Table</Link></li>
              </ul>
            </li>
            <li className="dropdown">
              <Link to="/contact">CONTACT</Link>
              <ul className="dropdown-content">
                <li><Link to="/contact/contacts">Contacts</Link></li>
                {isAuthenticated && <li><Link to="/user_requests">Request</Link></li>}
              </ul>
            </li>
            <li><Link to="/cart"><img src={cartImg} alt="cart" className="icon" /></Link></li>
            <li>
              <Link to={`/profile/${currentUserId}`}>
                <img src={userImg} alt="user" className="icon" />
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className="marketplace-page">
        <h1>{categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}</h1>
        <div className="products-grid">
          {products.map(product => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      </div>

      <footer>
        <nav className="footer-nav">
          <Link to="/">Homepage</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/table">About Us</Link>
          <Link to="/promo">Promo</Link>
          <Link to="/quiz">Contact</Link>
        </nav>
        <p>© 2025 All rights reserved - Rythm Road</p>
      </footer>
    </div>
  );
};

export default GuitarCategoryPage;