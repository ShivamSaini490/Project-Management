# Project Management Tool - Backend

A robust Node.js backend API for a project management and collaboration tool with authentication, role-based access control, and real-time task management.

## 🚀 Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **Role-Based Access Control**: Admin and Member roles with granular permissions
- **Project Management**: Create, update, delete projects with member invitations
- **Board & Task Management**: Kanban-style boards with drag-and-drop task management
- **Comments**: Threaded comments on tasks with activity tracking
- **Search & Filtering**: Advanced filtering and search capabilities
- **Security**: Input validation, rate limiting, and secure password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/project_management

   # JWT Configuration
   JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📊 Database Schema

### User Model
```javascript
{
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, valid email),
  password: String (required, hashed),
  role: String (enum: ['admin', 'member'], default: 'member'),
  avatar: String,
  isActive: Boolean (default: true),
  refreshToken: String,
  timestamps: true
}
```

### Project Model
```javascript
{
  name: String (required, max 100 chars),
  description: String (max 500 chars),
  owner: ObjectId (ref: 'User', required),
  members: [{
    user: ObjectId (ref: 'User'),
    role: String (enum: ['admin', 'member'], default: 'member'),
    joinedAt: Date (default: Date.now)
  }],
  isActive: Boolean (default: true),
  color: String (default: '#007bff'),
  timestamps: true
}
```

### Board Model
```javascript
{
  name: String (required, max 100 chars),
  description: String (max 500 chars),
  project: ObjectId (ref: 'Project', required),
  created_by: ObjectId (ref: 'User', required),
  isActive: Boolean (default: true),
  columns: [{
    name: String (enum: ['Todo', 'In Progress', 'Done']),
    order: Number (default: 0)
  }],
  timestamps: true
}
```

### Task Model
```javascript
{
  title: String (required, max 200 chars),
  description: String (max 1000 chars),
  status: String (enum: ['Todo', 'In Progress', 'Done'], default: 'Todo'),
  priority: String (enum: ['Low', 'Medium', 'High'], default: 'Medium'),
  due_date: Date,
  assigned_to: ObjectId (ref: 'User'),
  board: ObjectId (ref: 'Board', required),
  project: ObjectId (ref: 'Project', required),
  created_by: ObjectId (ref: 'User', required),
  position: Number (default: 0),
  labels: [{
    name: String,
    color: String (default: '#007bff')
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploaded_at: Date
  }],
  activity: [{
    action: String,
    performed_by: ObjectId (ref: 'User'),
    timestamp: Date,
    details: Mixed
  }],
  timestamps: true
}
```

### Comment Model
```javascript
{
  content: String (required, max 1000 chars),
  task: ObjectId (ref: 'Task', required),
  author: ObjectId (ref: 'User', required),
  parent_comment: ObjectId (ref: 'Comment'),
  isEdited: Boolean (default: false),
  editedAt: Date,
  timestamps: true
}
```

## 🔐 Security Features

- **Password Hashing**: Using bcryptjs with salt rounds
- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7days)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configured for specific frontend origin
- **Helmet**: Security headers for Express.js

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── projectController.js # Project management
│   │   ├── taskController.js    # Task & board management
│   │   └── commentController.js # Comment management
│   ├── middlewares/
│   │   ├── auth.js              # Authentication & authorization
│   │   └── errorHandler.js      # Centralized error handling
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Project.js           # Project schema
│   │   ├── Board.js             # Board schema
│   │   ├── Task.js              # Task schema
│   │   └── Comment.js           # Comment schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── projects.js          # Project routes
│   │   ├── tasks.js             # Task & board routes
│   │   └── comments.js          # Comment routes
│   ├── utils/
│   │   ├── generateTokens.js    # JWT token generation
│   │   └── pagination.js        # Pagination helpers
│   ├── validations/
│   │   ├── auth.js              # Auth validation schemas
│   │   ├── project.js           # Project validation schemas
│   │   └── task.js              # Task validation schemas
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server startup
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - Get user projects (paginated)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/invite` - Invite member to project
- `DELETE /api/projects/:id/members/:memberId` - Remove member from project

### Boards & Tasks
- `POST /api/boards` - Create new board
- `GET /api/projects/:projectId/boards` - Get project boards
- `POST /api/tasks` - Create new task
- `GET /api/boards/:boardId/tasks` - Get board tasks (with filtering)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/update-positions` - Update task positions (drag & drop)
- `GET /api/tasks/:id/activity` - Get task activity history

### Comments
- `POST /api/comments` - Create new comment
- `GET /api/tasks/:taskId/comments` - Get task comments (threaded)
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/project_management` |
| `JWT_ACCESS_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `JWT_ACCESS_EXPIRE` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Architecture Decisions

### Authentication Strategy
- **JWT with Refresh Tokens**: Chosen for stateless authentication with better security than long-lived tokens
- **Role-Based Access Control**: Implemented at both route and resource level for granular permissions
- **Token Rotation**: Refresh tokens are rotated on each use for enhanced security

### Database Design
- **MongoDB**: Chosen for flexibility with evolving project requirements
- **Embedded Documents**: Activity history embedded in tasks for better performance
- **Referential Integrity**: Maintained through application-level validation

### API Design
- **RESTful Principles**: Consistent HTTP methods and status codes
- **Pagination**: Implemented for large datasets using cursor-based pagination
- **Error Handling**: Centralized error handler with consistent response format

## 🚀 Performance Considerations

### Caching Strategy (Theoretical)
- **Redis Integration**: Cache frequently accessed project data and user sessions
- **Query Optimization**: Database indexes on frequently queried fields
- **CDN**: Static assets served through CDN for better performance

### Background Jobs (Theoretical)
- **Email Notifications**: Queue-based email sending for project invitations
- **Activity Digests**: Scheduled jobs for daily/weekly activity summaries
- **Data Cleanup**: Background jobs for cleaning up expired tokens and soft-deleted data

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **JWT Token Issues**
   - Check token secrets in `.env`
   - Verify token expiration settings
   - Clear browser localStorage if needed

3. **CORS Errors**
   - Verify `FRONTEND_URL` in `.env`
   - Check if frontend is running on correct port

### Logging
- Application logs are printed to console
- In production, consider using Winston or similar logging library

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
