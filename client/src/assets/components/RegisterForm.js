import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../../api';

const AgreementModal = ({ show, onClose, onAgree, title, text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{title}</h2>
        
        <div className="expand-button-container">
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>{isExpanded ? '▼' : '▶'}</span>
            <span>View {title}</span>
          </button>
        </div>
        
        {isExpanded && (
          <div className="agreement-text">
            {text.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
        
        <div className="modal-buttons">
          <button onClick={onAgree}>Accept</button>
          <button onClick={onClose}>Decline</button>
        </div>
      </div>
    </div>
  );
};

function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    re_password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showUserAgreementModal, setShowUserAgreementModal] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userAgreementText = `Terms of Service for Rhythm Road

By creating an account, you agree to be bound by these Terms of Service. Please read them carefully.

1. Account Registration
- You must be at least 13 years old to use our services
- You are responsible for maintaining the confidentiality of your account credentials
- You agree to provide accurate and complete registration information

2. Acceptable Use
- Do not engage in illegal activities or violate others' rights
- No harassment, hate speech, or abusive behavior
- Do not upload malicious content or spam
- Respect intellectual property rights

3. Content Responsibility
- You retain ownership of your content
- We may remove content that violates our policies
- You grant us a license to display and distribute your content

4. Service Modifications
- We may update or discontinue services at any time
- Terms may be revised periodically
- Continued use constitutes acceptance of changes`;

  const privacyPolicyText = `Rhythm Road Privacy Policy

Your privacy is important to us. This policy explains how we collect, use, and protect your information.

1. Information We Collect
- Account registration details (name, email)
- Profile information you choose to provide
- Usage data and analytics
- Device and connection information

2. How We Use Your Data
- To provide and improve our services
- For authentication and security
- To communicate with you
- For legal compliance and protection

3. Data Sharing
- With service providers who assist our operations
- When required by law or legal process
- In connection with business transfers

4. Your Rights
- Access and update your personal information
- Request deletion of your data
- Opt-out of marketing communications
- Withdraw consent where applicable`;

  const capitalizeName = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const validateName = (name, fieldName) => {
    if (!name.trim()) return `Please enter your ${fieldName.toLowerCase()}`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters`;
    if (!/^[a-zA-Z\s'-]+$/.test(name))
      return `Invalid characters in ${fieldName.toLowerCase()}`;
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email address is required';
    if (email.length < 8) return 'Email is too short';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (/\s/.test(password)) return 'Password cannot contain spaces';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    const digitCount = (password.match(/\d/g) || []).length;
    if (digitCount < 2) return 'Include at least 2 numbers';
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  useEffect(() => {
    const newErrors = {};
    if (touched.email) newErrors.email = validateEmail(form.email);
    if (touched.first_name) newErrors.first_name = validateName(form.first_name, 'First name');
    if (touched.last_name) newErrors.last_name = validateName(form.last_name, 'Last name');
    if (touched.password) newErrors.password = validatePassword(form.password);
    if (touched.re_password) newErrors.re_password = validateConfirmPassword(form.password, form.re_password);
    setErrors(newErrors);
  }, [form, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'first_name' || name === 'last_name') {
      setForm(prev => ({ ...prev, [name]: capitalizeName(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateAll = () => {
    const newTouched = {
      email: true,
      first_name: true,
      last_name: true,
      password: true,
      re_password: true,
    };
    setTouched(newTouched);
    
    const newErrors = {
      email: validateEmail(form.email),
      first_name: validateName(form.first_name, 'First name'),
      last_name: validateName(form.last_name, 'Last name'),
      password: validatePassword(form.password),
      re_password: validateConfirmPassword(form.password, form.re_password),
    };
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleRegistration = async () => {
    setLoading(true);
    try {
      const formattedForm = {
        ...form,
        first_name: capitalizeName(form.first_name),
        last_name: capitalizeName(form.last_name)
      };
      await register(formattedForm);
      const response = await login({ email: form.email, password: form.password });
      const { access } = response.data;
      localStorage.setItem('accessToken', access);
      setSuccessMessage(`Welcome, ${capitalizeName(form.first_name)}!`);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      if (error.response?.data) {
        const newErrors = {};
        for (const key in error.response.data) {
          if (Array.isArray(error.response.data[key])) {
            newErrors[key] = error.response.data[key][0];
          } else {
            newErrors[key] = error.response.data[key];
          }
        }
        setErrors(newErrors);
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      setShowUserAgreementModal(true);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="form-title">Create Account</h2>
      
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
        
        <div className="form-row">
          <div className="form-group">
            <div className="field">
              <input
                type="text"
                name="first_name"
                placeholder="First name"
                value={form.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.first_name && errors.first_name ? 'auth-input has-error' : 'auth-input'}
              />
            </div>
            {touched.first_name && errors.first_name && (
              <div className="error-tooltip visible">{errors.first_name}</div>
            )}
          </div>
          
          <div className="form-group">
            <div className="field">
              <input
                type="text"
                name="last_name"
                placeholder="Last name"
                value={form.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.last_name && errors.last_name ? 'auth-input has-error' : 'auth-input'}
              />
            </div>
            {touched.last_name && errors.last_name && (
              <div className="error-tooltip visible">{errors.last_name}</div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <div className="field">
              <input
                type="password"
                name="password"
                placeholder="Create password"
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
          
          <div className="form-group">
            <div className="field">
              <input
                type="password"
                name="re_password"
                placeholder="Confirm password"
                value={form.re_password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.re_password && errors.re_password ? 'auth-input has-error' : 'auth-input'}
              />
            </div>
            {touched.re_password && errors.re_password && (
              <div className="error-tooltip visible">{errors.re_password}</div>
            )}
          </div>
        </div>
        
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <AgreementModal
        show={showUserAgreementModal}
        onClose={() => setShowUserAgreementModal(false)}
        onAgree={() => {
          setShowUserAgreementModal(false);
          setShowPrivacyPolicyModal(true);
        }}
        title="Terms of Service"
        text={userAgreementText}
      />
      
      <AgreementModal
        show={showPrivacyPolicyModal}
        onClose={() => setShowPrivacyPolicyModal(false)}
        onAgree={() => {
          setShowPrivacyPolicyModal(false);
          handleRegistration();
        }}
        title="Privacy Policy"
        text={privacyPolicyText}
      />
    </div>
  );
}

export default RegisterForm;