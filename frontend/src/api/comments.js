import api from './axios'

export const commentsAPI = {
  createComment: (data) => api.post('/comments', data),
  getComments: (taskId, params) => api.get(`/tasks/${taskId}/comments`, { params }),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`)
}
