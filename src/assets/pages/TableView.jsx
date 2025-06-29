import { Link } from 'react-router-dom';

import '../css/styles.css';
import '../css/table_styles.css';

import BurgerMenu from '../components/BurgerMenu.js';

import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';

function TableView() {
  return (
    <>
      <noscript>
        <div className="noscript-container">
          <div className="noscript-content">
            <h2 className="noscript-header">JavaScript is Disabled!</h2>
            <p className="noscript-message">
              <strong>Attention:</strong> To experience the full functionality of our website, please enable JavaScript in your browser settings.
            </p>
            <p className="noscript-note">We apologize for any inconvenience!</p>
          </div>
        </div>
      </noscript>

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

      <div className="table-container">
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td className="merged-h" colSpan="2">Merged</td>
            </tr>
            <tr><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td></td><td></td><td></td><td></td><td></td></tr>
            <tr>
              <td className="merged-h" colSpan="2">Merged</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td className="merged-h" colSpan="3">Merged</td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td className="merged-h" colSpan="2"></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className="merged-h" colSpan="5">Merged</td>
            </tr>
            <tr></tr>
          </tbody>
        </table>
      </div>

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

export default TableView;