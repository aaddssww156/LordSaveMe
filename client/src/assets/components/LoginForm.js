import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api';

function LoginForm({ onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    if (name === 'email') {
      if (!value.trim()) return "Please enter your email";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
    }
    if (name === 'password') {
      if (!value) return "Please enter your password";
    }
    return '';
  };

  useEffect(() => {
    const newErrors = {};
    if (touched.email) newErrors.email = validateField('email', form.email);
    if (touched.password) newErrors.password = validateField('password', form.password);
    setErrors(newErrors);
  }, [form, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (!touched[name]) setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateAll = () => {
    const newTouched = {
      email: true,
      password: true
    };
    setTouched(newTouched);
    
    const newErrors = {
      email: validateField('email', form.email),
      password: validateField('password', form.password)
    };
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateAll();
    if (isValid) {
      setLoading(true);
      try {
        const response = await login(form);
        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        navigate('/profile', { replace: true });
      } catch (error) {
        if (error.response?.data) {
          if (error.response.data.detail) {
            setErrors({ general: error.response.data.detail });
          } else if (error.response.data.non_field_errors) {
            setErrors({ general: error.response.data.non_field_errors[0] });
          } else {
            setErrors({ general: 'Invalid email or password' });
          }
        } else {
          setErrors({ general: 'Network error. Please try again.' });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="form-title">Sign In</h2>
      
      <form onSubmit={handleSubmit} noValidate className="compact-form">
        <div className="form-group">
          <div className="field">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? 'auth-input has-error' : 'auth-input'}
            />
          </div>
          {touched.email && errors.email && (
            <div className="error-tooltip visible">{errors.email}</div>
          )}
        </div>
        
        <div className="form-group">
          <div className="field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.password && errors.password ? 'auth-input has-error' : 'auth-input'}
            />
          </div>
          {touched.password && errors.password && (
            <div className="error-tooltip visible">{errors.password}</div>
          )}
        </div>
        
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        <button 
          type="submit" 
          className="auth-button" 
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;