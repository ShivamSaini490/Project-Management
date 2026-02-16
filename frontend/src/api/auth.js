import api from './axios'

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (data) => api.post('/auth/refresh', data),
  getMe: () => api.get('/auth/me')
}
