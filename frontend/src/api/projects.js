import api from './axios'

export const projectsAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  inviteMember: (id, data) => api.post(`/projects/${id}/invite`, data),
  removeMember: (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`)
}
