# Project Management & Collaboration Tool

A full-stack project management and collaboration tool built with Node.js, Express, MongoDB, React.js, and featuring real-time Kanban boards with drag-and-drop functionality.

## 🚀 Overview

This is a comprehensive project management platform that enables teams to collaborate efficiently through organized projects, Kanban boards, task management, and real-time communication. The application follows modern development practices with a clean architecture, robust authentication, and an intuitive user interface.

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure login with access and refresh tokens
- **Role-Based Access Control**: Admin and Member roles with granular permissions
- **Password Security**: Bcrypt hashing with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive server-side validation

### 📊 Project Management
- **Project Creation**: Create and manage multiple projects
- **Team Collaboration**: Invite members with role-based permissions
- **Project Statistics**: Track team members, boards, and activity
- **Color Coding**: Visual organization with custom project colors

### 📋 Task & Board Management
- **Kanban Boards**: Three-column boards (Todo, In Progress, Done)
- **Drag & Drop**: Smooth task movement between columns
- **Task Details**: Rich task information with descriptions, priorities, due dates
- **Task Assignment**: Assign tasks to team members
- **Priority Levels**: High, Medium, Low priority indicators
- **Activity Tracking**: Complete task activity history

### 💬 Communication
- **Threaded Comments**: Nested comments on tasks
- **Real-time Updates**: Instant UI updates
- **Activity Feed**: Track all task changes and comments

### 🔍 Search & Filtering
- **Advanced Filtering**: Filter by status, assignee, priority, due date
- **Text Search**: Search task titles and descriptions
- **Pagination**: Efficient handling of large datasets

## 🛠️ Tech Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting

### Frontend
- **React.js**: Modern UI library with functional components
- **React Router**: Client-side routing
- **React Context API**: State management
- **Axios**: HTTP client with interceptors
- **react-beautiful-dnd**: Drag and drop functionality
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Icon library
- **Vite**: Build tool and development server

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## 📁 Project Structure

```
project-management-tool/
├── backend/                    # Node.js backend API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middlewares/       # Custom middlewares
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utility functions
│   │   ├── validations/      # Input validation schemas
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server startup
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Dependencies and scripts
│   └── README.md             # Backend documentation
├── frontend/                  # React.js frontend
│   ├── src/
│   │   ├── api/              # API service layer
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Application entry point
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies and scripts
│   ├── vite.config.js        # Vite configuration
│   └── README.md             # Frontend documentation
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-management-tool
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Configuration

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/project_management
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

The application uses MongoDB with the following main collections:

### Users
- Authentication credentials and roles
- Profile information
- Activity tracking

### Projects
- Project metadata and settings
- Member management with roles
- Project statistics

### Boards
- Kanban board configuration
- Column definitions
- Board-specific settings

### Tasks
- Task details and metadata
- Assignment and priority information
- Activity history and comments

### Comments
- Threaded comment structure
- Author information and timestamps
- Edit tracking

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Short-lived access tokens with refresh token rotation
- **Password Security**: Bcrypt hashing with 10 salt rounds
- **Session Management**: Secure token storage and validation

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configured for specific frontend origin
- **Security Headers**: Helmet.js for security headers

### Authorization
- **Role-Based Access**: Admin and Member roles with different permissions
- **Resource Protection**: Project and task level access control
- **Route Guards**: Protected routes with authentication middleware

## 🎨 User Interface

### Design Principles
- **Modern Design**: Clean, intuitive interface with Tailwind CSS
- **Responsive Layout**: Mobile-friendly design with adaptive layouts
- **Accessibility**: WCAG compliance considerations
- **Performance**: Optimized for fast loading and smooth interactions

### Key UI Components
- **Dashboard**: Project overview with statistics and quick actions
- **Kanban Board**: Drag-and-drop task management
- **Task Cards**: Rich task information with visual indicators
- **Modals**: Create/edit forms with validation
- **Navigation**: Sidebar navigation with user profile

## 🔄 Workflow

### Typical User Journey

1. **Registration/Login**: User creates account or logs in
2. **Dashboard**: View projects and create new ones
3. **Project Management**: Invite team members, create boards
4. **Task Management**: Create tasks, assign to team members
5. **Collaboration**: Comment on tasks, track progress
6. **Reporting**: Monitor project progress and team activity

### Team Collaboration
- **Project Creation**: Admin creates project and invites members
- **Board Setup**: Create Kanban boards for different workflows
- **Task Assignment**: Assign tasks to team members with priorities
- **Progress Tracking**: Visual progress through Kanban columns
- **Communication**: Comment on tasks for clarification and updates

## 🚀 Performance Considerations

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data retrieval with cursor-based pagination
- **Caching Strategy**: Ready for Redis integration
- **Background Jobs**: Prepared for email notifications and data cleanup

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components and routes
- **State Management**: Efficient state updates with React Context
- **Asset Optimization**: Optimized images and fonts
- **Bundle Size**: Regular monitoring and optimization

## 🔮 Future Enhancements

### Planned Features
- **Real-time Collaboration**: WebSocket integration for live updates
- **File Attachments**: Drag-and-drop file uploads for tasks
- **Advanced Analytics**: Project analytics and reporting dashboard
- **Mobile Application**: React Native mobile app
- **Integrations**: Third-party tool integrations (Slack, GitHub, etc.)

### Technical Improvements
- **Microservices**: Service-oriented architecture for scalability
- **Caching Layer**: Redis implementation for performance
- **Search Engine**: Elasticsearch for advanced search capabilities
- **Monitoring**: Application monitoring and alerting
- **Testing**: Comprehensive test suite with CI/CD

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Controller and utility function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and query testing

### Frontend Testing
- **Component Tests**: React component testing with Testing Library
- **Integration Tests**: User flow testing
- **E2E Tests**: End-to-end testing with Cypress

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Project Endpoints
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/invite` - Invite member
- `DELETE /api/projects/:id/members/:memberId` - Remove member

### Task Endpoints
- `POST /api/boards` - Create board
- `GET /api/projects/:projectId/boards` - Get project boards
- `POST /api/tasks` - Create task
- `GET /api/boards/:boardId/tasks` - Get board tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/update-positions` - Update task positions

### Comment Endpoints
- `POST /api/comments` - Create comment
- `GET /api/tasks/:taskId/comments` - Get task comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network connectivity

2. **Authentication Problems**
   - Clear browser localStorage
   - Check JWT token configuration
   - Verify API endpoints

3. **CORS Issues**
   - Check frontend URL in backend .env
   - Verify CORS configuration
   - Ensure both services are running

### Debugging Tools
- **Backend**: Console logs and error handling
- **Frontend**: React DevTools and browser console
- **Network**: Browser network tab for API debugging

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

## 📞 Support

For support and questions:
- Open an issue in the repository
- Check the documentation
- Review existing issues for solutions

---

**Built with ❤️ for modern team collaboration**
