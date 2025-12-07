import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (username, password) => API.post('/auth/login', { username, password }),
  signup: (userData) => API.post('/auth/signup', userData),
  logout: () => API.post('/auth/logout'),
  getCurrentUser: () => API.get('/auth/me')
};

export const projectAPI = {
  getAllProjects: () => API.get('/projects'),
  getAllProjectsAdmin: () => API.get('/projects/all'),
  createProject: (data) => API.post('/projects/create', data),
  getProject: (id) => API.get(`/projects/${id}`),
  requestAccess: (projectId) => API.post('/projects/request-access', { projectId }),
  getProjectUsers: (projectId) => API.get(`/projects/${projectId}/users`),
  assignProject: (projectId, data) => API.post(`/projects/${projectId}/assign`, data),
  unassignProject: (projectId, userId) => API.delete(`/projects/${projectId}/unassign/${userId}`)
};

export const userAPI = {
  getAllUsers: () => API.get('/users'),
  createUser: (data) => API.post('/users/create', data),
  getUser: (id) => API.get(`/users/${id}`),
  updateUser: (id, data) => API.put(`/users/${id}`, data)
};

export const requestAPI = {
  getPendingRequests: () => API.get('/requests/pending'),
  updateRequest: (id, data) => API.put(`/requests/${id}`, data)
};

export const reportAPI = {
  getReports: () => API.get('/reports'),
  getUsersCSV: () => API.get('/reports/users-csv', { responseType: 'blob' })
};

export default API;