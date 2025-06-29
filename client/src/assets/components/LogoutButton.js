import React from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (token) {
        await api.post('/auth/token/logout/', null, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      }

      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (error) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
