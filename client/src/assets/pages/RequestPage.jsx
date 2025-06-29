import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';
import BurgerMenu from '../components/BurgerMenu';
import '../css/styles.css';
import '../css/auth.css';
import '../css/profile.css';
import '../css/request.css';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const Modal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Notification</h2>
        <p className="modal-message">{capitalizeFirstLetter(message)}</p>
        <button type="button" className="btn-close-modal" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Confirmation</h2>
        <p className="modal-message">{capitalizeFirstLetter(message)}</p>
        <div className="modal-buttons">
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn-confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

function RequestPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    files: [],
  });
  const [filePreviews, setFilePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('all-requests');
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    ordering: '-created_at'
  });
  const [modal, setModal] = useState({ 
    isOpen: false, 
    message: '' 
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: '',
    action: null,
    requestId: null
  });
  const [newRequestErrors, setNewRequestErrors] = useState({
    title: '',
    description: ''
  });
  const [newRequestTouched, setNewRequestTouched] = useState({
    title: false,
    description: false
  });
  const [adminResponses, setAdminResponses] = useState({});
  const [adminErrors, setAdminErrors] = useState({});
  const [adminTouched, setAdminTouched] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  const closeModal = () => setModal({ isOpen: false, message: '' });

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      message: '',
      action: null,
      requestId: null
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const resp = await API.get('/api/users/profile/');
        setIsAdmin(resp.data.is_staff || false);
        setCurrentUserId(resp.data.id);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login');
        } else {
          setModal({
            isOpen: true,
            message: 'Failed to load user data'
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const params = {
        status: filters.status || undefined,
        date: filters.date || undefined,
        ordering: filters.ordering || undefined
      };
      
      const resp = await API.get('/api/user_requests/', { params });
      setRequests(resp.data);
    } catch (error) {
      handleApiError(error, 'Failed to load requests');
    }
  }, [filters, navigate]);

  useEffect(() => {
    if (!loading) {
      fetchRequests();
    }
  }, [loading, filters, fetchRequests]);

  const handleApiError = (error, defaultMessage) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('accessToken');
          navigate('/login');
          break;
        case 403:
          setModal({ isOpen: true, message: 'You do not have permission for this action' });
          break;
        case 404:
          setModal({ isOpen: true, message: 'Resource not found' });
          break;
        default:
          setModal({ isOpen: true, message: defaultMessage });
      }
    } else {
      setModal({ isOpen: true, message: 'Network error. Please check your connection.' });
    }
  };

  const validateNewRequestField = (name, value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'This field is required';
    if (/^\d+$/.test(trimmedValue)) return 'Field cannot consist of only digits';
    return '';
  };

  const validateAdminResponse = (requestId, value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Response is required';
    if (/^\d+$/.test(trimmedValue)) return 'Response cannot consist of only digits';
    return '';
  };

  const handleNewRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
    
    if (newRequestTouched[name]) {
      const error = validateNewRequestField(name, value);
      setNewRequestErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleNewRequestBlur = (e) => {
    const { name, value } = e.target;
    setNewRequestTouched(prev => ({ ...prev, [name]: true }));
    const error = validateNewRequestField(name, value);
    setNewRequestErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newRequest.files.length > 5) {
      setModal({
        isOpen: true,
        message: 'You can upload maximum 5 files'
      });
      return;
    }

    const newFilePreviews = files.map(file => ({
      id: URL.createObjectURL(file),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setFilePreviews(prev => [...prev, ...newFilePreviews]);
    setNewRequest(prev => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const removeFile = (index) => {
    const newFiles = [...newRequest.files];
    const newPreviews = [...filePreviews];
    const removedPreview = newPreviews[index];
    URL.revokeObjectURL(removedPreview.url);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setNewRequest({ ...newRequest, files: newFiles });
    setFilePreviews(newPreviews);
  };

  const handleAdminResponseChange = (requestId, value) => {
    setAdminResponses(prev => ({ ...prev, [requestId]: value }));
    if (adminTouched[requestId]) {
      const error = validateAdminResponse(requestId, value);
      setAdminErrors(prev => ({ ...prev, [requestId]: error }));
    }
  };

  const handleAdminResponseBlur = (requestId) => {
    setAdminTouched(prev => ({ ...prev, [requestId]: true }));
    const value = adminResponses[requestId] || '';
    const error = validateAdminResponse(requestId, value);
    setAdminErrors(prev => ({ ...prev, [requestId]: error }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      date: '',
      ordering: '-created_at'
    });
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    
    const newTouched = { title: true, description: true };
    const newErrors = {
      title: validateNewRequestField('title', newRequest.title),
      description: validateNewRequestField('description', newRequest.description)
    };
    
    setNewRequestTouched(newTouched);
    setNewRequestErrors(newErrors);
    
    if (newErrors.title || newErrors.description) return;

    const tempRequest = {
      id: `temp-${Date.now()}`,
      title: newRequest.title,
      description: newRequest.description,
      created_at: new Date().toISOString(),
      status: 'pending',
      files: filePreviews.map(preview => ({
        id: preview.id,
        name: preview.name,
        url: preview.url,
        preview: preview.url
      })),
      admin_response: null
    };

    setRequests(prev => [tempRequest, ...prev]);

    const formData = new FormData();
    formData.append('title', newRequest.title);
    formData.append('description', newRequest.description);
    newRequest.files.forEach(file => formData.append('files', file));

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const resp = await API.post('/api/user_requests/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setRequests(prev => prev.map(req => 
        req.id === tempRequest.id ? { ...resp.data, files: tempRequest.files } : req
      ));
      
      setNewRequest({ title: '', description: '', files: [] });
      setFilePreviews([]);
      setNewRequestErrors({ title: '', description: '' });
      setNewRequestTouched({ title: false, description: false });
      setModal({ isOpen: true, message: 'Request submitted successfully!' });
    } catch (error) {
      setRequests(prev => prev.filter(req => req.id !== tempRequest.id));
      handleApiError(error, 'Failed to submit request');
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    setAdminTouched(prev => ({ ...prev, [requestId]: true }));
    const responseText = adminResponses[requestId] || '';
    const error = validateAdminResponse(requestId, responseText);
    
    if (error) {
      setAdminErrors(prev => ({ ...prev, [requestId]: error }));
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const resp = await API.patch(`/api/user_requests/${requestId}/`, {
        status,
        admin_response: responseText,
      });
      
      setRequests(prev => prev.map(req => req.id === requestId ? resp.data : req));
      
      setAdminResponses(prev => { const { [requestId]: _, ...rest } = prev; return rest; });
      setAdminErrors(prev => { const { [requestId]: _, ...rest } = prev; return rest; });
      setAdminTouched(prev => { const { [requestId]: _, ...rest } = prev; return rest; });
      
      setModal({ isOpen: true, message: 'Request status updated!' });
    } catch (error) {
      handleApiError(error, 'Failed to update request');
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await API.delete(`/api/user_requests/${requestId}/`);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      setModal({ isOpen: true, message: 'Request deleted successfully!' });
    } catch (error) {
      handleApiError(error, 'Failed to delete request');
    }
  };

  const closeRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await API.patch(`/api/user_requests/${requestId}/close/`);
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'closed' } : req
      ));
      setModal({ isOpen: true, message: 'Request closed successfully!' });
    } catch (error) {
      handleApiError(error, 'Failed to close request');
    }
  };

  const openConfirmation = (action, requestId, message) => {
    setConfirmationModal({
      isOpen: true,
      message: message,
      action: action,
      requestId: requestId
    });
  };

  const handleConfirmation = () => {
    if (confirmationModal.action === 'delete') {
      deleteRequest(confirmationModal.requestId);
    } else if (confirmationModal.action === 'close') {
      closeRequest(confirmationModal.requestId);
    }
    closeConfirmationModal();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Invalid Date';
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Pending', className: 'status-pending' },
      in_progress: { text: 'In Progress', className: 'status-in-progress' },
      completed: { text: 'Completed', className: 'status-completed' },
      rejected: { text: 'Rejected', className: 'status-rejected' },
      closed: { text: 'Closed', className: 'status-closed' },
    };
    const statusInfo = statusMap[status] || { text: status, className: '' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span>;
  };

  const canModifyRequest = (request) => {
    return !isAdmin && request.user && request.user.id === currentUserId;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="order-request-page">
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
                <li><Link to="/user_requests">Request</Link></li>
              </ul>
            </li>
            <li><Link to="/cart"><img src={cartImg} alt="cart" className="icon" /></Link></li>
            <li><Link to="/profile"><img src={userImg} alt="user" className="icon" /></Link></li>
          </ul>
        </nav>
      </header>

      <section className="request-section">
        <div className="request-banner">
          <h1>Order Your Dream Instrument</h1>
          <p>Request any instrument you'd like to purchase</p>
        </div>

        <div className="request-container">
          {isAdmin && (
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'all-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('all-requests')}
              >
                All Requests
              </button>
            </div>
          )}

          {!isAdmin && (
            <form className="request-form" onSubmit={submitRequest}>
              <h2>Create New Request</h2>
              <div className="form-group">
                <input
                  type="text"
                  name="title"
                  value={newRequest.title}
                  onChange={handleNewRequestChange}
                  onBlur={handleNewRequestBlur}
                  placeholder="Instrument Name"
                  className={`request-input ${newRequestTouched.title && newRequestErrors.title ? 'has-error' : ''}`}
                />
                {newRequestTouched.title && newRequestErrors.title && (
                  <div className="error-tooltip visible">
                    {capitalizeFirstLetter(newRequestErrors.title)}
                  </div>
                )}
              </div>
              <div className="form-group">
                <textarea
                  name="description"
                  value={newRequest.description}
                  onChange={handleNewRequestChange}
                  onBlur={handleNewRequestBlur}
                  placeholder="Describe the instrument you want to order..."
                  className={`request-textarea ${newRequestTouched.description && newRequestErrors.description ? 'has-error' : ''}`}
                  rows="4"
                />
                {newRequestTouched.description && newRequestErrors.description && (
                  <div className="error-tooltip visible">
                    {capitalizeFirstLetter(newRequestErrors.description)}
                  </div>
                )}
              </div>
              <div className="form-group">
                <div className="file-upload">
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Choose Files
                  </button>
                  <input
                    type="file"
                    id="file-input"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    style={{ display: 'none' }}
                  />
                  <span className="file-hint">Max 5 files, 10MB each</span>
                </div>
                {filePreviews.length > 0 && (
                  <div className="file-previews">
                    {filePreviews.map((preview, index) => (
                      <div key={preview.id} className="file-preview">
                        {preview.url.startsWith('blob:') ? (
                          <div className="preview-content">
                            <img src={preview.url} alt="Preview" className="preview-image" />
                            <span>{preview.name}</span>
                          </div>
                        ) : (
                          <div className="preview-content">
                            <div className="file-icon">📄</div>
                            <span>{preview.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="remove-file"
                          onClick={() => removeFile(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="btn-submit">
                Submit Request
              </button>
            </form>
          )}

          <div className="requests-list">
            <h2>{isAdmin ? 'All Requests' : 'My Requests'}</h2>
            <div className="filters-container">
              <div className="filter-group">
                <label>Filter by Status:</label>
                <select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Filter by Date:</label>
                <select 
                  name="date" 
                  value={filters.date} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort by Date:</label>
                <select 
                  name="ordering" 
                  value={filters.ordering} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                </select>
              </div>
              
              <button 
                type="button"
                className="btn-clear-filters"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="no-requests">
                <p>No requests found</p>
              </div>
            ) : (
              <div className="request-items">
                {requests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-header">
                      <h3>{request.title}</h3>
                      {renderStatusBadge(request.status)}
                      <span className="request-date">{formatDate(request.created_at)}</span>
                    </div>
                    <div className="request-body">
                      <p className="request-description">{request.description}</p>
                      {request.files && request.files.length > 0 && (
                        <div className="request-files">
                          <strong>Attachments:</strong>
                          <div className="file-list">
                            {request.files.map((file, index) => (
                              <a
                                key={`${request.id}-file-${index}`}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="file-link"
                              >
                                📄 {file.name || `File ${index + 1}`}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {request.admin_response && (
                        <div className="admin-response">
                          <strong>Admin Response:</strong>
                          <p>{request.admin_response}</p>
                        </div>
                      )}
                    </div>
                    <div className="request-actions">
                      {canModifyRequest(request) && (
                        <>
                          {request.status === 'pending' && (
                            <button
                              type="button"
                              className="btn-action btn-close"
                              onClick={() => openConfirmation(
                                'close', 
                                request.id, 
                                'Are you sure you want to close this request?'
                              )}
                            >
                              Close Request
                            </button>
                          )}
                          {(request.status === 'pending' || request.status === 'closed') && (
                            <button
                              type="button"
                              className="btn-action btn-delete"
                              onClick={() => openConfirmation(
                                'delete', 
                                request.id, 
                                'Are you sure you want to delete this request?'
                              )}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                      {isAdmin && request.status === 'pending' && (
                        <div className="admin-actions">
                          <div className="admin-response-input">
                            <textarea
                              value={adminResponses[request.id] || ''}
                              onChange={(e) => handleAdminResponseChange(request.id, e.target.value)}
                              onBlur={() => handleAdminResponseBlur(request.id)}
                              placeholder="Add your response..."
                              className={`response-textarea ${adminTouched[request.id] && adminErrors[request.id] ? 'has-error' : ''}`}
                              rows="3"
                            />
                            {adminTouched[request.id] && adminErrors[request.id] && (
                              <div className="error-tooltip visible">
                                {capitalizeFirstLetter(adminErrors[request.id])}
                              </div>
                            )}
                          </div>
                          <div className="admin-buttons">
                            <button
                              type="button"
                              className="btn-action btn-approve"
                              onClick={() => updateRequestStatus(request.id, 'completed')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn-action btn-reject"
                              onClick={() => updateRequestStatus(request.id, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
      
      <Modal 
        isOpen={modal.isOpen} 
        message={modal.message} 
        onClose={closeModal} 
      />
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        message={confirmationModal.message}
        onConfirm={handleConfirmation}
        onCancel={closeConfirmationModal}
      />
    </div>
  );
}

export default RequestPage;