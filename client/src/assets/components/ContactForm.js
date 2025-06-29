import React, { useState, useCallback, useEffect } from 'react';
import '../css/contact_form.css';
import API from '../../api';  

const ContactForm = () => {
  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const validateField = useCallback((name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = "We'd like to know your name!";
        } else if (value.trim().length < 2) {
          error = 'Name should be longer';
        } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-']+$/.test(value.trim())) {
          error = 'Name should contain only letters, spaces, hyphens or apostrophes';
        }
        break;
      case 'phone':
        if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(value)) {
          error = 'Please use correct phone format';
        }
        break;
      case 'email':
        if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(value)) {
          error = "Oops! That doesn't look like a valid email :(";
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

  useEffect(() => {
    const newErrors = {};
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        newErrors[field] = validateField(field, values[field]);
      }
    });
    setErrors(newErrors);
  }, [values, touched, validateField]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      let newValue = value;

      if (name === 'phone') {
        let digits = value.replace(/\D/g, '').slice(0, 10);
        newValue = '';
        if (digits.length > 0) newValue += `(${digits.slice(0, 3)}`;
        if (digits.length >= 3) newValue += `) ${digits.slice(3, 6)}`;
        if (digits.length >= 6) newValue += `-${digits.slice(6, 10)}`;
      } else if (name === 'name') {
        newValue = value.replace(/(^|\s)\w/g, (match) => match.toUpperCase());
      }

      setValues(prev => ({ ...prev, [name]: newValue }));
      setTouched(prev => ({ ...prev, [name]: true }));
    },
    []
  );

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newTouched = {};
    Object.keys(values).forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    const newErrors = {};
    Object.keys(values).forEach(field => {
      newErrors[field] = validateField(field, values[field]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).every(error => !error)) {
      try {
        await API.post('/api/contact_messages/create/', values);
        setShowModal(true);
        setSubmissionError(null);
      } catch (error) {
        console.error('Error submitting form:', error);
        setSubmissionError('Не удалось отправить сообщение. Попробуйте позже.');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setValues({ name: '', phone: '', email: '', message: '' });
    setTouched({});
    setErrors({});
  };

  return (
    <section className="contact-container">
      <h2>Contact Us</h2>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="inline-fields">
          <div className="field">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.name && errors.name ? 'has-error' : ''}
            />
            {touched.name && errors.name && (
              <div className="error-tooltip visible">
                {errors.name}
              </div>
            )}
          </div>

          <div className="field">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.phone && errors.phone ? 'has-error' : ''}
            />
            {touched.phone && errors.phone && (
              <div className="error-tooltip visible">
                {errors.phone}
              </div>
            )}
          </div>
        </div>

        <div className="field">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            className={touched.email && errors.email ? 'has-error' : ''}
          />
          {touched.email && errors.email && (
            <div className="error-tooltip visible">
              {errors.email}
            </div>
          )}
        </div>

        <div className="field">
          <textarea
            name="message"
            placeholder="Message"
            value={values.message}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.message && errors.message ? 'has-error' : ''}
          />
          {touched.message && errors.message && (
            <div className="error-tooltip visible">
              {errors.message}
            </div>
          )}
        </div>

        <button type="submit">SEND</button>
      </form>

      {submissionError && <div className="error-message">{submissionError}</div>}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thank you for your message!</h2>
            <p>We will get in touch with you soon.</p>
            <button className="restart-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactForm;