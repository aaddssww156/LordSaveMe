import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';
import '../css/styles.css';
import '../css/marketplace.css';
import '../css/cart.css';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice
  } = useCart();
  
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const currentUserId = localStorage.getItem('userId');

  const toggleDropdown = (menu) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
  };

  const closeDropdowns = () => {
    setDropdownOpen(null);
  };

  return (
    <div className="category-page">
      <header>
        <div className="logo-title">
          <img src={guitarImg} alt="guitar" />
          <h1>Rythm Road</h1>
        </div>
        <nav className="desktop-nav">
          <ul className="nav-list">
            <li><NavLink exact to="/" activeClassName="active">HOMEPAGE</NavLink></li>
            <li className="dropdown" onMouseLeave={closeDropdowns}>
              <NavLink 
                to="/marketplace" 
                activeClassName="active"
                onMouseEnter={() => toggleDropdown('marketplace')}
                onClick={closeDropdowns}
              >
                MARKETPLACE
              </NavLink>
              <ul 
                className={`dropdown-content ${dropdownOpen === 'marketplace' ? 'active' : ''}`}
                onClick={closeDropdowns}
              >
                <li><Link to="/marketplace/guitars">Guitars</Link></li>
                <li><Link to="/marketplace/drums">Drums</Link></li>
              </ul>
            </li>
            <li className="dropdown" onMouseLeave={closeDropdowns}>
              <NavLink 
                to="/table" 
                activeClassName="active"
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
            <li className="dropdown" onMouseLeave={closeDropdowns}>
              <NavLink 
                to="/contact" 
                activeClassName="active"
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
            <li><Link to="/cart"><img src={cartImg} alt="cart" className="icon" /></Link></li>
            <li>
              <Link to={`/profile/${currentUserId}`}>
                <img src={userImg} alt="user" className="icon" />
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className="cart-section">
        <div className="cart-banner">
          <h1>Your Shopping Cart</h1>
          <p>Review your items and proceed to checkout</p>
        </div>

        <div className="cart-container">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-content">
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything to your cart yet</p>
                <button 
                  onClick={() => navigate('/marketplace/guitars')}
                  className="continue-shopping-btn"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <img 
                      src={item.image || '/placeholder.jpg'} 
                      alt={item.name} 
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">${Number(item.price).toFixed(2)}</p>
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="quantity-btn"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span className="total-price">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  className="checkout-btn"
                  onClick={() => alert('Order placed successfully!')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
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

export default CartPage;