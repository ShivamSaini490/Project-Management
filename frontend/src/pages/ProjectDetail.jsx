import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsAPI } from '../api/projects'
import { tasksAPI } from '../api/tasks'
import { PlusIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const ProjectDetail = () => {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false)
  const [newBoard, setNewBoard] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      setLoading(true)
      const [projectRes, boardsRes] = await Promise.all([
        projectsAPI.getProject(projectId),
        tasksAPI.getBoards(projectId)
      ])
      setProject(projectRes.data.data.project)
      setBoards(boardsRes.data.data.boards)
    } catch (error) {
      setError('Failed to fetch project data')
      console.error('Error fetching project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    try {
      await tasksAPI.createBoard({
        ...newBoard,
        project: projectId
      })
      setShowCreateBoardModal(false)
      setNewBoard({ name: '', description: '' })
      fetchProjectData()
    } catch (error) {
      setError('Failed to create board')
      console.error('Error creating board:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
        <p className="mt-2 text-gray-600">The project you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateBoardModal(true)}
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Board
          </button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{project.members.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-semibold">B</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Boards</p>
                <p className="text-2xl font-bold text-gray-900">{boards.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members.map((member) => (
              <div key={member.user._id} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {member.user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.user.username}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    member.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boards */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Boards</h3>
          {boards.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No boards yet</h3>
              <p className="text-gray-600 mb-4">Create your first board to start organizing tasks</p>
              <button
                onClick={() => setShowCreateBoardModal(true)}
                className="btn btn-primary"
              >
                Create Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <Link
                  key={board._id}
                  to={`/boards/${board._id}`}
                  className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{board.name}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{board.description}</p>
                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <span>Created by {board.created_by.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoardModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Board</h3>

            <form onSubmit={handleCreateBoard}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Board Name
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                  placeholder="Enter board name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  className="input"
                  rows="3"
                  value={newBoard.description}
                  onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                  placeholder="Enter board description"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateBoardModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
