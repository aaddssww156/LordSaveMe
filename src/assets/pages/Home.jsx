import { Link } from 'react-router-dom';

import '../css/styles.css';

import ContactForm from '../components/ContactForm.js';
import BurgerMenu from '../components/BurgerMenu.js';
import Slider from '../components/Slider.js';

import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';

function Home() {
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
                <li><Link to="/contact/email">Email</Link></li>
                <li><Link to="/contact/phone">Phone</Link></li>
              </ul>
            </li>
            <li>
              <Link to="/cart"><img src={cartImg} alt="cart" className="icon" /></Link>
            </li>
            <li>
              <Link to="/profile"><img src={userImg} alt="user" className="icon" /></Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className="main">
        <div className="main-text">
          <h1>MUSICAL INSTRUMENTS STORE</h1>
          <div className="headline-wrapper">
            <div className="line"></div>
          </div>
          <p>Your Melodic Destination:</p>
          <p>Discover, Dream, and Play On!</p>
        </div>
        <div className="main-slider-wrapper">
          <Slider />
        </div>
      </section>

      <ContactForm />

      <footer>
        <nav className="footer-nav">
          <Link to="/">Homepage</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/table">About us</Link>
          <Link to="/promo">Promo</Link>
          <Link to="/quiz">Contact</Link>
        </nav>
        <p>&copy; 2025 All rights reserved - Rhythm Road</p>
      </footer>
    </>
  );
}

export default Home;