// State Management - Centralized state management
class AppState {
    constructor() {
        this.state = {
            tasks: [],
            projects: [],
            deletedProjects: [],
            currentLanguage: 'en',
            currentTheme: 'light',
            currentPage: 'dashboard',
            searchQuery: '',
            isLoading: false,
            error: null,
            selectedTask: null
        };
        
        this.listeners = [];
    }

    // Get current state
    getState() {
        return { ...this.state };
    }

    // Get specific state property
    getStateProperty(key) {
        return this.state[key];
    }

    // Set state (immutable update)
    setState(newState) {
        this.state = {
            ...this.state,
            ...newState
        };
        // Always notify listeners when state changes
        this.notifyListeners();
    }

    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(listener => {
            listener(this.getState());
        });
    }

    // Actions
    setTasks(tasks) {
        this.setState({ tasks });
    }

    addTask(task) {
        if (!task || !task.id) {
            console.error('Invalid task object:', task);
            return;
        }
        const currentTasks = Array.isArray(this.state.tasks) ? this.state.tasks : [];
        const newTasks = [...currentTasks, task];
        this.setState({
            tasks: newTasks
        });
    }

    updateTask(updatedTask) {
        this.setState({
            tasks: this.state.tasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        });
    }

    removeTask(taskId) {
        this.setState({
            tasks: this.state.tasks.filter(task => task.id !== taskId)
        });
    }

    setLanguage(language) {
        this.setState({ currentLanguage: language });
        localStorage.setItem('language', language);
    }

    setTheme(theme) {
        this.setState({ currentTheme: theme });
        localStorage.setItem('theme', theme);
    }

    setLoading(loading) {
        this.setState({ isLoading: loading });
    }

    setError(error) {
        this.setState({ error });
    }

    setSelectedTask(task) {
        this.setState({ selectedTask: task });
    }

    // Projects management
    setProjects(projects) {
        this.setState({ projects: Array.isArray(projects) ? projects : [] });
    }

    addProject(project) {
        if (!project || !project.id) {
            console.error('Invalid project object:', project);
            return;
        }
        const currentProjects = Array.isArray(this.state.projects) ? this.state.projects : [];
        const newProjects = [...currentProjects, project];
        this.setState({ projects: newProjects });
    }

    updateProject(updatedProject) {
        this.setState({
            projects: this.state.projects.map(project =>
                project.id === updatedProject.id ? updatedProject : project
            )
        });
    }

    removeProject(projectId) {
        const projectToDelete = this.state.projects.find(p => p.id === projectId);
        if (projectToDelete) {
            const filteredProjects = this.state.projects.filter(p => p.id !== projectId);
            const deletedProjects = [...(this.state.deletedProjects || []), {
                ...projectToDelete,
                deletedAt: new Date().toISOString()
            }];
            this.setState({
                projects: filteredProjects,
                deletedProjects: deletedProjects
            });
        }
    }

    getProjectById(id) {
        return this.state.projects.find(p => p.id === id);
    }

    getDeletedProjects() {
        return [...(this.state.deletedProjects || [])];
    }

    // Search and navigation
    setSearchQuery(query) {
        this.setState({ searchQuery: query || '' });
    }

    setCurrentPage(page) {
        this.setState({ currentPage: page || 'dashboard' });
    }
}

// Create global state instance
const appState = new AppState();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
}

