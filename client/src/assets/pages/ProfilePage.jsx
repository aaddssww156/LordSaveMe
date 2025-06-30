import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import API from '../../api';
import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';
import BurgerMenu from '../components/BurgerMenu';
import '../css/styles.css';
import '../css/auth.css';
import '../css/profile.css';

const formatPhoneForDisplay = (phoneStr) => {
  if (!phoneStr) return '';
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length !== 10) return phoneStr;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
};

const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0,10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
};

const formatDate = (value) => {
  const digits = value.replace(/\D/g, '').slice(0,8);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
  return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
};

function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    city: '',
    date_of_birth: '',
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const initialDataRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');
  const isCurrentUser = userId ? parseInt(userId) === parseInt(currentUserId) : true;
  const [showContent, setShowContent] = useState(false); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let url = '/api/users/profile/';
        if (userId) {
          url = `/api/users/profile/${userId}/`;
        }
        
        const resp = await API.get(url);
        const data = resp.data;
        setUserData(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: formatPhoneForDisplay(data.phone_number || ''),
          city: data.city || '',
          date_of_birth: formatDateForDisplay(data.date_of_birth || ''),
        });
      } catch (err) {
        if (err.response?.status === 403) {
          navigate('/access-denied');
        } else if (err.response?.status === 404) {
          navigate('/profile-not-found');
        } else {
          localStorage.removeItem('accessToken');
          navigate('/login');
        }
      } finally {
        setTimeout(() => {
          setLoading(false);
          setShowContent(true); 
        }, 300); 
      }
    };
    fetchProfile();
  }, [navigate, userId]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone_number') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone_number: formatted }));
    } else if (name === 'date_of_birth') {
      const formatted = formatDate(value);
      setFormData(prev => ({ ...prev, date_of_birth: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const hasChanges = () => {
    if (!initialDataRef.current) return false;
    return Object.keys(formData).some(key => formData[key] !== initialDataRef.current[key]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveMessage('');

    if (!hasChanges()) {
      setSaveMessage('No changes detected');
      return;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email');
      return;
    }

    const parsedPhone = formData.phone_number.replace(/\D/g, '');
    const parsedDate = formData.date_of_birth.split('/').reverse().join('-');

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone_number: parsedPhone,
      city: formData.city,
      date_of_birth: parsedDate,
    };

    try {
      let url = '/api/users/profile/';
      if (userId) {
        url = `/api/users/profile/${userId}/`;
      }
      
      const resp = await API.patch(url, payload);
      const updated = resp.data;
      setUserData(updated);
      setFormData({
        first_name: updated.first_name || '',
        last_name: updated.last_name || '',
        email: updated.email || '',
        phone_number: formatPhoneForDisplay(updated.phone_number || ''),
        city: updated.city || '',
        date_of_birth: formatDateForDisplay(updated.date_of_birth || ''),
      });
      setSaveMessage('Data saved successfully');
      initialDataRef.current = { ...formData };
      setEditMode(false);
    } catch (error) {
      setErrorMessage(error.response?.data || 'Error saving data');
    }
  };

  const handleEditClick = () => {
    initialDataRef.current = { ...formData };
    setEditMode(true);
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setErrorMessage('');
    setDeletePassword('');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setErrorMessage('Please enter your password');
      return;
    }

    setDeleting(true);
    setErrorMessage('');

    try {
      await API.delete('/api/users/delete-account/', {
        data: { current_password: deletePassword }
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage('Session expired. Please login again.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      } else {
        setErrorMessage(
          error.response?.data?.detail || 
          'Failed to delete account. Please check your password and try again.'
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const isAuthenticated = !!localStorage.getItem('accessToken');

  if (loading || !showContent) { 
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Account Deletion Confirmation</h3>
            <p>Are you sure you want to delete your account? This action is irreversible.</p>
            <p>All your data will be permanently deleted.</p>
            <p>To confirm, please enter your current password:</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter password"
              className="modal-password-input"
            />
            {errorMessage && <div className="modal-error">{errorMessage}</div>}
            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="modal-confirm"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header>
        <div className="logo-title">
          <img src={guitarImg} alt="guitar" />
          <h1>Rythm Road</h1>
        </div>
        <BurgerMenu />
        <nav className="desktop-nav">
          <ul className="nav-list">
            <li><Link to="/">HOMEPAGE</Link></li>
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
                <li><Link to="/contact/contacts">Contacts</Link></li>
                {isAuthenticated && <li><Link to="/user_requests">Request</Link></li>}
              </ul>
            </li>
            <li><Link to="/cart"><img src={cartImg} alt="cart" className="icon" /></Link></li>
            <li className="active">
              <Link to={`/profile`}>
                <img src={userImg} alt="user" className="icon" />
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className="profile-section">
        <div className="profile-banner">
          <h1>Hello, Music Lover!</h1>
        </div>

        <div className="profile-container">
          <div className="profile-header">
            <h2>User Profile</h2>
          </div>

          {userData && (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  {editMode && isCurrentUser ? (
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="profile-input"
                    />
                  ) : (
                    <input
                      readOnly
                      value={formData.first_name || '-'}
                      className="profile-input profile-input-readonly"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  {editMode && isCurrentUser ? (
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="profile-input"
                    />
                  ) : (
                    <input
                      readOnly
                      value={formData.last_name || '-'}
                      className="profile-input profile-input-readonly"
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Email:</label>
                {editMode && isCurrentUser ? (
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      className="profile-input"
                      placeholder="example@domain.com"
                    />
                  ) : (
                    <input
                      readOnly
                      value={formData.email || '-'}
                      className="profile-input profile-input-readonly"
                    />
                  )}
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                {editMode && isCurrentUser ? (
                    <input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="profile-input"
                      placeholder="(123) 456-7890"
                    />
                  ) : (
                    <input
                      readOnly
                      value={formData.phone_number || '-'}
                      className="profile-input profile-input-readonly"
                    />
                  )}
              </div>
              <div className="form-group">
                <label>City:</label>
                {editMode && isCurrentUser ? (
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="profile-input"
                      placeholder="New York"
                    />
                  ) : (
                    <input
                      readOnly
                      value={formData.city || '-'}
                      className="profile-input profile-input-readonly"
                    />
                  )}
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                {editMode && isCurrentUser ? (
                    <input
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="profile-input"
                      placeholder="DD/MM/YYYY"
                    />
                  ) : (
                    <input
                      readOnly
                      value={formData.date_of_birth || '-'}
                      className="profile-input profile-input-readonly"
                    />
                  )}
              </div>

              <div className="fixed-message-space">
                <div className="form-messages">
                  {errorMessage && <div className="error-message">{errorMessage}</div>}
                  {saveMessage && <div className="success-message">{saveMessage}</div>}
                </div>
              </div>

              <div className="profile-actions">
                {editMode && isCurrentUser ? (
                  <>
                    <button type="submit" className="btn-save">Save Changes</button>
                    <button type="button" className="btn-cancel" onClick={() => { setEditMode(false); setSaveMessage(''); }}>Cancel</button>
                  </>
                ) : isCurrentUser && (
                  <>
                    <button type="button" className="btn-edit" onClick={handleEditClick}>Edit Profile</button>
                    <button type="button" className="btn-logout" onClick={handleLogout}>Log Out</button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={openDeleteModal}
                    >
                      Delete Account
                    </button>
                  </>
                )}
              </div>
            </form>
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
}

export default ProfilePage;