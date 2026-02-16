import api from './axios'

export const tasksAPI = {
  // Boards
  createBoard: (data) => api.post('/boards', data),
  getBoards: (projectId) => api.get(`/projects/${projectId}/boards`),
  
  // Tasks
  getTasks: (boardId, params) => api.get(`/boards/${boardId}/tasks`, { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  updateTaskPositions: (data) => api.put('/tasks/update-positions', data),
  getTaskActivity: (id) => api.get(`/tasks/${id}/activity`)
}
