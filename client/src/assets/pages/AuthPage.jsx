import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import LoginForm from '../components/LoginForm';
import BurgerMenu from '../components/BurgerMenu';
import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';
import '../css/auth.css';
import '../css/styles.css';

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const isAuthenticated = !!localStorage.getItem('accessToken');
  // const userId = localStorage.getItem('userId');

  return (
    <>
      <header>
        <div className="logo-title">
          <img src={guitarImg} alt="guitar" />
          <h1>Rythm Road</h1>
        </div>
        <BurgerMenu />
        <nav className="desktop-nav">
          <ul className="nav-list">
            <li>
              <Link to="/">HOMEPAGE</Link>
            </li>
            <li className="dropdown">
              <Link to="/marketplace">MARKETPLACE</Link>
              <ul className="dropdown-content">
                <li>
                  <Link to="/marketplace/guitars">Guitars</Link>
                </li>
                <li>
                  <Link to="/marketplace/drums">Drums</Link>
                </li>
              </ul>
            </li>
            <li className="dropdown">
              <Link to="/table">ABOUT US</Link>
              <ul className="dropdown-content">
                <li>
                  <Link to="/quiz">Quiz</Link>
                </li>
                <li>
                  <Link to="/table">Table</Link>
                </li>
              </ul>
            </li>
            <li className="dropdown">
              <Link to="/contact">CONTACT</Link>
              <ul className="dropdown-content">
                <li>
                  <Link to="/contact/contacts">Contacts</Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link to="/user_requests">Request</Link>
                  </li>
                )}
              </ul>
            </li>
            <li>
              <Link to="/cart">
                <img src={cartImg} alt="cart" className="icon" />
              </Link>
            </li>
            <li>
              <Link to={isAuthenticated ? `/profile/${localStorage.getItem('userId')}` : '/login'}>
                <img src={userImg} alt="user" className="icon" />
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className="auth-section">
        <div className="auth-banner">
          <h1>Unlock your soundtrack — it all starts here!</h1>
        </div>
        <div className="auth-box">
          {showLogin ? <LoginForm /> : <RegisterForm />}
          <p className="auth-toggle">
            {showLogin ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => setShowLogin(false)} 
                  className="auth-link"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => setShowLogin(true)} 
                  className="auth-link"
                >
                  Login
                </button>
              </>
            )}
          </p>
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
    </>
  );
}