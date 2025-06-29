import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import '../css/burger.css';

import cartImg from '../images/cart.png';
import userImg from '../images/user.png';

function BurgerMenu() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  const toggleMenu = () => setMobileMenuOpen(prevState => !prevState);

  const toggleDropdown = (item) => {
    setActiveDropdown(activeDropdown === item ? null : item);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !burgerRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="burger-container">
      <div className={`burger ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMenu} ref={burgerRef} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`burger-nav ${isMobileMenuOpen ? 'active' : ''}`} ref={menuRef}>
        <ul className="burger-nav-list">
          <li className="burger-nav-item simple-item">
            <Link to="/" className="nav-item">
              <span>HOMEPAGE</span>
            </Link>
          </li>

          <li className="burger-nav-item">
            <div className="nav-item-main" onClick={() => toggleDropdown('marketplace')}>
              <span>MARKETPLACE</span>
              <span className="dropdown-arrow">{activeDropdown === 'marketplace' ? '−' : '+'}</span>
            </div>
            <ul className={`burger-submenu ${activeDropdown === 'marketplace' ? 'active' : ''}`}>
              <li><Link to="/marketplace/guitars" className="nav-item">Guitars</Link></li>
              <li><Link to="/marketplace/drums" className="nav-item">Drums</Link></li>
            </ul>
          </li>

          <li className="burger-nav-item">
            <div className="nav-item-main" onClick={() => toggleDropdown('about')}>
              <span>ABOUT US</span>
              <span className="dropdown-arrow">{activeDropdown === 'about' ? '−' : '+'}</span>
            </div>
            <ul className={`burger-submenu ${activeDropdown === 'about' ? 'active' : ''}`}>
              <li><Link to="/quiz" className="nav-item">Quiz</Link></li>
              <li><Link to="/table" className="nav-item">Table</Link></li>
            </ul>
          </li>

          <li className="burger-nav-item">
            <div className="nav-item-main" onClick={() => toggleDropdown('contact')}>
              <span>CONTACT</span>
              <span className="dropdown-arrow">{activeDropdown === 'contact' ? '−' : '+'}</span>
            </div>
            <ul className={`burger-submenu ${activeDropdown === 'contact' ? 'active' : ''}`}>
              <li><Link to="/contact/email" className="nav-item">Email</Link></li>
              <li><Link to="/contact/phone" className="nav-item">Phone</Link></li>
            </ul>
          </li>

          <li className="burger-nav-item simple-item">
            <Link to="/cart" className="nav-item with-icon">
              <img src={cartImg} alt="cart" className="icon" />
              <span>Cart</span>
            </Link>
          </li>

          <li className="burger-nav-item simple-item">
            <Link to="/profile" className="nav-item with-icon">
              <img src={userImg} alt="user" className="icon" />
              <span>Profile</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default BurgerMenu;