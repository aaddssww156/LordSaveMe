import React, { useState, useCallback } from 'react';
import '../css/contact_form.css';

const ContactForm = () => {
  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  const validateField = useCallback((name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'We\'d like to know your name!';
        } else if (value.trim().length < 2) {
          error = 'Name should be at least 2 characters long';
        } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-']+$/.test(value.trim())) {
          error = 'Name should contain only letters, spaces, hyphens or apostrophes';
        }
        break;
      case 'phone':
        if (!/^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(value)) {
          error = 'Please use this phone format: +7 (123) 456-78-90';
        }
        break;
      case 'email':
        if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(value)) {
          error = 'Oops! That doesn\'t look like a valid email :(';
        }
        break;
      case 'message':
        if (!value.trim()) error = 'What would you like to tell us?';
        break;
      default:
        break;
    }

    return error;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'phone') {
      let digits = value.replace(/\D/g, '');

      if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
      }

      newValue = '+7';
      if (digits.length > 1) newValue += ` (${digits.slice(1, 4)}`;
      if (digits.length >= 4) newValue += `) ${digits.slice(4, 7)}`;
      if (digits.length >= 7) newValue += `-${digits.slice(7, 9)}`;
      if (digits.length >= 9) newValue += `-${digits.slice(9, 11)}`;
    }

    setValues(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, newValue) }));
  }, [validateField]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    Object.keys(values).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setValues({ name: '', phone: '', email: '', message: '' });
    setErrors({});
  };

  return (
    <section className="contact-container">
      <h2>Contact Us</h2>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <div className="field">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={values.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="field">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={values.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
        </div>

        <div className="field">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={values.email}
            onChange={handleChange}
            autoComplete="off"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="field">
          <textarea
            name="message"
            placeholder="Message"
            value={values.message}
            onChange={handleChange}
          />
          {errors.message && <span className="error">{errors.message}</span>}
        </div>

        <button type="submit">CONTACT US</button>
      </form>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Thank you for your message!</h2>
            <p>We will get in touch with you soon.</p>
            <button className="restart-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactForm;