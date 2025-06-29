import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        logout();
        return Promise.reject(new Error('No refresh token'));
      }
      try {
        const resp = await API.post('/auth/jwt/refresh/', { refresh: refreshToken });
        const newAccessToken = resp.data.access;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch {
        logout();
        return Promise.reject(error);
      }
    }
    if (error.response?.status === 403) {
      alert('You do not have permission for this action');
    }
    return Promise.reject(error);
  }
);

export const getProfile = userId =>
  userId
    ? API.get(`/api/users/profile/${userId}/`)
    : API.get('/api/users/profile/');

export const login = data => API.post('/auth/jwt/create/', data);
export const register = data => API.post('/auth/users/', data);
export const updateProfile = (data, userId) =>
  userId
    ? API.patch(`/api/users/profile/${userId}/`, data)
    : API.patch('/api/users/profile/', data);
export const deleteAccount = current_password =>
  API.delete('/api/users/delete-account/', { data: { current_password } });

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  delete API.defaults.headers.common.Authorization;
  window.location.href = '/login';
};

export default API;