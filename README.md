# uTask - Task Management Dashboard

Modern task management dashboard with State Management, CRUD operations, and multi-language support.

## Features

- ✅ **State Management** - Centralized state management with reactive updates
- ✅ **CRUD Operations** - Create, Read, Update, Delete tasks
- ✅ **ID-based Data** - All tasks are identified by unique IDs
- ✅ **AJAX/Fetch** - API service layer for data operations
- ✅ **Multi-language** - English and Mongolian support
- ✅ **Dark Mode** - Light and dark theme support
- ✅ **Responsive Design** - Works on all devices
- ✅ **Vercel Ready** - Easy deployment to Vercel

## Architecture

### State Management (`state.js`)
- Centralized state management
- Reactive updates through subscriptions
- Immutable state updates

### API Service (`api.js`)
- Handles all data operations
- Currently uses localStorage (can be easily switched to external API)
- CRUD operations: Create, Read, Update, Delete

### Task Service (`taskService.js`)
- Business logic layer
- Connects API and State
- Handles loading states and errors

### UI Logic (`1.js`)
- Pure rendering functions
- Event handlers
- State subscriptions

## Project Structure

```
├── index.html          # Main HTML file
├── style.css           # Styles
├── 1.js               # Main application logic
├── api.js             # API service layer
├── state.js           # State management
├── taskService.js     # Business logic layer
├── vercel.json        # Vercel configuration
├── package.json       # Package configuration
└── README.md          # This file
```

## Local Development

1. Clone the repository
2. Open `index.html` in a browser or use a local server:
   ```bash
   npx serve .
   ```

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Option 2: Using GitHub

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Vercel will automatically detect and deploy

### Option 3: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Deploy

## API Integration

Currently, the app uses localStorage. To switch to an external API:

1. Update `api.js`:
   ```javascript
   constructor(baseURL = 'https://your-api.com') {
       this.baseURL = baseURL;
       this.endpoint = '/api/tasks';
   }
   ```

2. Update methods to use fetch:
   ```javascript
   async getAllTasks() {
       const response = await fetch(`${this.baseURL}${this.endpoint}`);
       return await response.json();
   }
   ```

## State Management

The app uses a centralized state management system:

```javascript
// Get state
const state = appState.getState();

// Subscribe to changes
appState.subscribe((newState) => {
    console.log('State updated:', newState);
});

// Update state
appState.setTasks([...tasks]);
```

## CRUD Operations

### Create Task
```javascript
await taskService.createTask({
    title: 'New Task',
    description: 'Task description',
    dueDate: '2024-01-01',
    priority: 'high',
    category: 'work'
});
```

### Read Tasks
```javascript
await taskService.loadTasks();
const tasks = appState.getStateProperty('tasks');
```

### Update Task
```javascript
await taskService.updateTask(taskId, {
    title: 'Updated Title',
    completed: true
});
```

### Delete Task
```javascript
await taskService.deleteTask(taskId);
```

### Toggle Completion
```javascript
await taskService.toggleTaskComplete(taskId);
```

## Technologies Used

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- LocalStorage API
- Fetch API (ready for external API)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

