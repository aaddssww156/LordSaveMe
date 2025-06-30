import React, { useState, useEffect } from 'react';
import { Link, useParams, NavLink } from 'react-router-dom';
import { getProductsByCategory } from '../../api';
import ProductItem from '../components/ProductItem';
import BurgerMenu from '../components/BurgerMenu';
import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';
import '../css/marketplace.css';

const GuitarCategoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { categorySlug } = useParams();
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const currentUserId = localStorage.getItem('userId');
  const [sortOption, setSortOption] = useState('default');
  const [dropdownOpen, setDropdownOpen] = useState(null);

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

  const toggleDropdown = (menu) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
  };

  const closeDropdowns = () => {
    setDropdownOpen(null);
  };

  const sortProducts = (option) => {
    let sorted = [...products];
    switch (option) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return sorted;
  };

  const sortedProducts = sortProducts(sortOption);

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
    <div className="category-page">
      <header>
        <div className="logo-title">
          <img src={guitarImg} alt="guitar" />
          <h1>Rythm Road</h1>
        </div>
        <BurgerMenu />
        <nav className="desktop-nav">
          <ul className="nav-list">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => (isActive ? "nav-active" : undefined)}
                onClick={closeDropdowns}
              >
                HOMEPAGE
              </NavLink>
            </li>
            <li 
              className="dropdown" 
              onMouseLeave={closeDropdowns}
            >
              <NavLink 
                to="/marketplace" 
                className={({ isActive }) => (isActive ? "nav-active" : undefined)}
                onMouseEnter={() => toggleDropdown('marketplace')}
                onClick={closeDropdowns}
              >
                MARKETPLACE
              </NavLink>
              <ul 
                className={`dropdown-content ${dropdownOpen === 'marketplace' ? 'active' : ''}`}
                onClick={closeDropdowns}
              >
                <li><Link to="/marketplace/acoustic-guitars">Guitars</Link></li>
                <li><Link to="/marketplace/electric-guitars">Electric-guitars</Link></li>
              </ul>
            </li>
            <li 
              className="dropdown" 
              onMouseLeave={closeDropdowns}
            >
              <NavLink 
                to="/table" 
                className={({ isActive }) => (isActive ? "nav-active" : undefined)}
                onMouseEnter={() => toggleDropdown('about')}
                onClick={closeDropdowns}
              >
                ABOUT US
              </NavLink>
              <ul 
                className={`dropdown-content ${dropdownOpen === 'about' ? 'active' : ''}`}
                onClick={closeDropdowns}
              >
                <li><Link to="/quiz">Quiz</Link></li>
                <li><Link to="/table">Table</Link></li>
              </ul>
            </li>
            <li 
              className="dropdown" 
              onMouseLeave={closeDropdowns}
            >
              <NavLink 
                to="/contact" 
                className={({ isActive }) => (isActive ? "nav-active" : undefined)}
                onMouseEnter={() => toggleDropdown('contact')}
                onClick={closeDropdowns}
              >
                CONTACT
              </NavLink>
              <ul 
                className={`dropdown-content ${dropdownOpen === 'contact' ? 'active' : ''}`}
                onClick={closeDropdowns}
              >
                <li><Link to="/contact/contacts">Contacts</Link></li>
                {isAuthenticated && <li><Link to="/user_requests">Request</Link></li>}
              </ul>
            </li>
            <li>
              <Link to="/cart">
                <img src={cartImg} alt="cart" className="icon" />
              </Link>
            </li>
            <li>
              <Link to={`/profile/${currentUserId}`}>
                <img src={userImg} alt="user" className="icon" />
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className="category-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>{categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}</h1>
          <p>Find your perfect instrument from our curated collection</p>
        </div>
      </section>

      <section className="category-content">
        <div className="category-tools">
          <div className="results-count">
            {products.length} {products.length === 1 ? 'item' : 'items'} found
          </div>
          <div className="sort-options">
            <label htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              <option value="default">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="products-grid">
          {sortedProducts.map(product => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="no-products">
            <h3>No products found in this category</h3>
            <p>Check back later or browse other categories</p>
          </div>
        )}
      </section>

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