import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { tasksAPI } from '../api/tasks'
import { commentsAPI } from '../api/comments'
import { PlusIcon, ChatBubbleLeftRightIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const Board = () => {
  const { boardId } = useParams()
  const [board, setBoard] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    assigned_to: '',
    priority: '',
    search: ''
  })

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: '',
    due_date: '',
    assigned_to: ''
  })

  // Debounce hook for search
  const [searchTimeout, setSearchTimeout] = useState(null)

  const debouncedSearch = (searchTerm) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }))
    }, 1000)

    setSearchTimeout(timeoutId)
  }

  useEffect(() => {
    fetchBoardData()
  }, [boardId, filters])

  const fetchBoardData = async () => {
    try {
      setLoading(true)
      const response = await tasksAPI.getTasks(boardId, filters)
      setTasks(response.data.data.tasks)
      console.log('Board data response:', response.data.data)

      // Get board data from the response (should be included now)
      if (response.data.data.board) {
        console.log('Board object:', response.data.data.board)
        console.log('Board project field:', response.data.data.board.project)
        setBoard(response.data.data.board)
      } else if (response.data.data.tasks.length > 0) {
        // Fallback: get board from first task
        console.log('Board object from task:', response.data.data.tasks[0].board)
        console.log('Board project field:', response.data.data.tasks[0].board.project)
        setBoard(response.data.data.tasks[0].board)
      } else {
        console.log('No board data found in response')
        // Try to fetch board directly
        try {
          const boardResponse = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          })
          const boardData = await boardResponse.json()
          if (boardData.success) {
            console.log('Board object from direct fetch:', boardData.data.board)
            setBoard(boardData.data.board)
          }
        } catch (boardError) {
          console.error('Error fetching board directly:', boardError)
        }
      }
    } catch (error) {
      setError('Failed to fetch board data')
      console.error('Error fetching board data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    console.log('handleCreateTask called!')
    e.preventDefault()
    console.log('Form prevented default')
    console.log('New task data:', newTask)
    console.log('Board ID:', boardId)
    console.log('Form valid:', e.target.checkValidity())

    if (!newTask.title.trim()) {
      console.log('Title is empty, cannot submit')
      setError('Task title is required')
      return
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        board: boardId
      }
console.log('Task data being sent:', taskData)
console.log('Board object:', board)
      // Always add project if available, otherwise use boardId as fallback
      if (board?.project) {
        taskData.project = typeof board.project === 'string' ? board.project : board.project._id
      } else {
        // Fallback: we need project ID but don't have it - show error
        console.error('Cannot create task: No project data available for board')
        setError('Cannot create task: Project information not available')
        return
      }

      // Add assigned_to if provided
      if (newTask.assigned_to && newTask.assigned_to.trim()) {
        taskData.assigned_to = newTask.assigned_to
      }

      console.log('Sending task data:', taskData)
      const response = await tasksAPI.createTask(taskData)
      console.log('API response:', response)
      setShowCreateTaskModal(false)
      setNewTask({
        title: '',
        description: '',
        status: 'Todo',
        priority: '',
        due_date: '',
        assigned_to: ''
      })
      fetchBoardData()
    } catch (error) {
      console.error('Full error object:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      setError(`Failed to create task: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const updatedTasks = Array.from(tasks)
    const taskIndex = updatedTasks.findIndex(task => task._id === draggableId)
    const draggedTask = updatedTasks[taskIndex]

    // Update task status and position
    draggedTask.status = destination.droppableId
    draggedTask.position = destination.index

    // Reorder tasks
    updatedTasks.splice(taskIndex, 1)
    updatedTasks.splice(destination.index, 0, draggedTask)

    // Update positions for all tasks in the destination column
    const destinationTasks = updatedTasks.filter(task => task.status === destination.droppableId)
    destinationTasks.forEach((task, index) => {
      task.position = index
    })

    setTasks(updatedTasks)

    // Send update to backend
    try {
      const tasksToUpdate = destinationTasks.map(task => ({
        id: task._id,
        status: task.status,
        position: task.position
      }))
      await tasksAPI.updateTaskPositions({ tasks: tasksToUpdate })
    } catch (error) {
      setError('Failed to update task positions')
      fetchBoardData() // Revert to original state
    }
  }

  const handleTaskClick = async (task) => {
    setSelectedTask(task)
    setShowTaskDetailModal(true)

    try {
      const response = await commentsAPI.getComments(task._id)
      setComments(response.data.data.comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await commentsAPI.createComment({
        content: newComment,
        task: selectedTask._id
      })
      setNewComment('')

      // Refresh comments
      const response = await commentsAPI.getComments(selectedTask._id)
      setComments(response.data.data.comments)
    } catch (error) {
      setError('Failed to add comment')
      console.error('Error adding comment:', error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high'
      case 'Medium': return 'priority-medium'
      case 'Low': return 'priority-low'
      default: return ''
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Todo': return 'bg-gray-100 text-gray-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Done': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = ['Todo', 'In Progress', 'Done']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Board Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{board?.name}</h1>
            <p className="text-gray-600">{board?.description}</p>
          </div>
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            className="input flex-1 min-w-[200px]"
            value={filters.search}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          <select
            className="input"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column} className="kanban-column">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{column}</h3>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {tasks.filter(task => task.status === column).length}
                </span>
              </div>

              <Droppable droppableId={column}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[400px] p-2 rounded-lg ${
                      snapshot.isDraggingOver ? 'bg-gray-200' : ''
                    }`}
                  >
                    {tasks
                      .filter(task => task.status === column)
                      .sort((a, b) => a.position - b.position)
                      .map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task-card mb-3 ${getPriorityColor(task.priority)} ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                              onClick={() => handleTaskClick(task)}
                            >
                              <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                {task.assigned_to && (
                                  <div className="flex items-center">
                                    <UserIcon className="w-3 h-3 mr-1" />
                                    {task.assigned_to.username}
                                  </div>
                                )}
                                {task.due_date && (
                                  <div className="flex items-center">
                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
                                {task.activity?.length || 0} activities
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Task</h3>

            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  className="input"
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Priority
                  </label>
                  <select
                    className="input"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedTask.priority === 'High' ? 'bg-red-100 text-red-800' :
                    selectedTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedTask.priority}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTaskDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {selectedTask.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedTask.description}</p>
                  </div>
                )}

                {/* Comments Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Comments</h4>

                  <form onSubmit={handleAddComment} className="mb-4">
                    <textarea
                      className="input"
                      rows="3"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary mt-2"
                      disabled={!newComment.trim()}
                    >
                      Add Comment
                    </button>
                  </form>

                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="border-l-4 border-gray-200 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{comment.author.username}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{comment.content}</p>

                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-2 ml-4 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply._id} className="border-l-2 border-gray-100 pl-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900 text-sm">{reply.author.username}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Task Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Assigned to:</span>
                    <p className="text-gray-900">
                      {selectedTask.assigned_to ? selectedTask.assigned_to.username : 'Unassigned'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Due date:</span>
                    <p className="text-gray-900">
                      {selectedTask.due_date
                        ? new Date(selectedTask.due_date).toLocaleDateString()
                        : 'No due date'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Created by:</span>
                    <p className="text-gray-900">{selectedTask.created_by.username}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Created at:</span>
                    <p className="text-gray-900">
                      {new Date(selectedTask.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Board
