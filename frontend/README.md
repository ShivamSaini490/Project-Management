# Project Management Tool - Frontend

A modern React.js frontend for a project management and collaboration tool with real-time Kanban boards, drag-and-drop functionality, and responsive design.

## 🚀 Features

- **Authentication**: Secure login/register with JWT tokens
- **Dashboard**: Project overview with statistics and quick actions
- **Project Management**: Create, manage, and collaborate on projects
- **Kanban Boards**: Drag-and-drop task management with real-time updates
- **Task Management**: Create, edit, and organize tasks with priorities and due dates
- **Comments**: Threaded comments on tasks with activity tracking
- **Search & Filtering**: Advanced filtering and search capabilities
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Instant UI updates with React Context API

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js              # Axios configuration with interceptors
│   │   ├── auth.js               # Authentication API calls
│   │   ├── projects.js           # Project API calls
│   │   ├── tasks.js              # Task & board API calls
│   │   └── comments.js           # Comment API calls
│   ├── components/
│   │   ├── Layout.jsx            # Main layout component
│   │   └── LoadingSpinner.jsx    # Loading spinner component
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context and state management
│   ├── pages/
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── Dashboard.jsx         # Dashboard with project overview
│   │   ├── ProjectDetail.jsx     # Project details and management
│   │   ├── Board.jsx             # Kanban board with drag & drop
│   │   └── Profile.jsx           # User profile page
│   ├── hooks/
│   │   └── (Custom hooks)        # Custom React hooks
│   ├── utils/
│   │   └── (Utility functions)   # Helper functions
│   ├── App.jsx                   # Main App component with routing
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles and Tailwind imports
├── public/
│   └── index.html                # HTML template
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── README.md                    # This file
```

## 🎨 UI Components & Design

### Design System
- **Color Palette**: Primary blue (#3b82f6) with semantic colors for states
- **Typography**: Inter font family for modern, clean appearance
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: Reusable components with consistent styling

### Key Components

#### Layout Component
- **Sidebar Navigation**: Fixed sidebar with user profile and navigation
- **Main Content Area**: Responsive main content area
- **Header**: Project-specific headers with actions

#### Kanban Board
- **Drag & Drop**: Smooth drag-and-drop using react-beautiful-dnd
- **Task Cards**: Rich task cards with priority indicators and metadata
- **Column Management**: Three default columns (Todo, In Progress, Done)
- **Real-time Updates**: Instant updates when tasks are moved

#### Task Management
- **Create Task Modal**: Form for creating new tasks with all fields
- **Task Detail Modal**: Comprehensive task view with comments
- **Priority Indicators**: Visual priority indicators (High/Medium/Low)
- **Due Date Management**: Calendar integration for due dates

## 🔐 Authentication Flow

### Login Process
1. User enters credentials
2. API validates and returns JWT tokens
3. Tokens stored in localStorage
4. User redirected to dashboard
5. Auth context updated with user data

### Token Management
- **Access Token**: Short-lived (15 minutes) for API calls
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Automatic Refresh**: Axios interceptor handles token refresh
- **Logout**: Clears tokens and redirects to login

### Protected Routes
- Route guards check authentication status
- Redirect unauthenticated users to login
- Preserve intended destination for post-login redirect

## 🔄 State Management

### AuthContext
- **Global State**: User authentication state across the app
- **Actions**: Login, register, logout, token refresh
- **Persistence**: Tokens stored in localStorage
- **Error Handling**: Centralized error management

### Local State
- **Component State**: useState for form data and UI state
- **Derived State**: useMemo for computed values
- **Effects**: useEffect for API calls and side effects

## 🎯 Key Features Implementation

### Drag & Drop Kanban Board
```javascript
// Using react-beautiful-dnd
<DragDropContext onDragEnd={handleDragEnd}>
  {columns.map(column => (
    <Droppable droppableId={column} key={column}>
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          {tasks.map(task => (
            <Draggable key={task._id} draggableId={task._id} index={index}>
              {/* Task card */}
            </Draggable>
          ))}
        </div>
      )}
    </Droppable>
  ))}
</DragDropContext>
```

### API Integration
```javascript
// Axios with interceptors for token management
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor adds auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor handles token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error)
  }
)
```

### Form Validation
```javascript
// Client-side validation with error handling
const validateForm = () => {
  const newErrors = {}
  
  if (!formData.email) {
    newErrors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email is invalid'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

## 🎨 Styling Approach

### Tailwind CSS Configuration
- **Custom Colors**: Extended color palette for brand consistency
- **Responsive Design**: Mobile-first approach with breakpoints
- **Component Classes**: Utility classes for consistent styling
- **Dark Mode**: Prepared for dark mode implementation

### CSS Custom Properties
```css
/* Custom component classes */
.task-card {
  @apply bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow duration-200;
}

.priority-high {
  @apply border-l-4 border-red-500;
}

.kanban-column {
  @apply bg-gray-100 rounded-lg p-4 min-h-[400px];
}
```

## 🚀 Performance Optimizations

### Code Splitting
- **Route-based Splitting**: Lazy loading of page components
- **Component Splitting**: Dynamic imports for large components
- **Bundle Analysis**: Regular bundle size monitoring

### React Optimizations
- **useMemo**: Expensive computations memoized
- **useCallback**: Function references stabilized
- **React.memo**: Component re-render prevention
- **Virtual Scrolling**: For large lists (future enhancement)

### Asset Optimization
- **Image Optimization**: WebP format with fallbacks
- **Font Loading**: Optimized font loading strategy
- **CSS Purging**: Unused CSS removed in production

## 🔧 Development Tools

### Vite Configuration
- **Hot Module Replacement**: Fast development experience
- **Proxy Setup**: API proxy for development
- **Build Optimization**: Production build optimizations

### ESLint Configuration
- **React Rules**: React-specific linting rules
- **Import Rules**: Consistent import ordering
- **Accessibility**: A11y rules for better accessibility

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Adaptations
- **Touch-friendly**: Larger touch targets for mobile
- **Swipe Gestures**: Horizontal scrolling for boards on mobile
- **Collapsible Sidebar**: Sidebar collapses on mobile devices
- **Modal Handling**: Full-screen modals on mobile

## 🧪 Testing Strategy

### Unit Testing
- **Components**: React Testing Library for component testing
- **Hooks**: Custom hook testing with renderHook
- **Utilities**: Function testing with Jest

### Integration Testing
- **API Integration**: Mock API responses for testing
- **User Flows**: End-to-end user journey testing
- **Error Handling**: Error state testing

### Accessibility Testing
- **Screen Readers**: ARIA label testing
- **Keyboard Navigation**: Tab order testing
- **Color Contrast**: WCAG compliance testing

## 🔮 Future Enhancements

### Planned Features
- **Real-time Collaboration**: WebSocket integration for live updates
- **File Attachments**: Drag-and-drop file uploads
- **Advanced Filtering**: More sophisticated filtering options
- **Dashboard Analytics**: Project analytics and reporting
- **Mobile App**: React Native mobile application

### Technical Improvements
- **State Management**: Migration to Redux Toolkit for complex state
- **Performance**: Virtual scrolling for large task lists
- **Offline Support**: Service worker for offline functionality
- **PWA**: Progressive Web App features

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running and accessible
   - Check VITE_API_URL environment variable
   - Verify backend CORS configuration

2. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify backend authentication endpoints

3. **Drag & Drop Issues**
   - Check react-beautiful-dnd version compatibility
   - Ensure proper droppableId configuration
   - Verify task data structure

### Debugging Tools
- **React DevTools**: Component state inspection
- **Network Tab**: API request debugging
- **Console Logging**: Strategic logging for debugging

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
