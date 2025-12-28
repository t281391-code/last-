// Task Service - Business logic layer
class TaskService {
    constructor(api, state) {
        this.api = api;
        this.state = state;
    }

    // Load all tasks
    async loadTasks() {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.getAllTasks();

            if (response.success) {
                this.state.setTasks(response.data);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: [],
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    // Create new task
    async createTask(taskData) {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.createTask(taskData);

            if (response.success) {
                this.state.addTask(response.data);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: null,
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    // Update task
    async updateTask(id, updates) {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.updateTask(id, updates);

            if (response.success) {
                this.state.updateTask(response.data);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: null,
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    // Delete task
    async deleteTask(id) {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.deleteTask(id);

            if (response.success) {
                this.state.removeTask(id);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: null,
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    // Toggle task completion
    async toggleTaskComplete(id) {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.toggleTaskComplete(id);

            if (response.success) {
                this.state.updateTask(response.data);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: null,
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    // Get task by ID
    async getTaskById(id) {
        try {
            const response = await this.api.getTaskById(id);
            return response;
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    // Projects management
    async loadProjects() {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.getAllProjects();

            if (response.success) {
                this.state.setProjects(response.data);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: [],
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    async createProject(projectData) {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.createProject(projectData);

            if (response.success) {
                this.state.addProject(response.data);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: null,
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    async updateProject(id, updates) {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.updateProject(id, updates);

            if (response.success) {
                this.state.updateProject(response.data);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: null,
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    async deleteProject(id) {
        try {
            this.state.setLoading(true);
            this.state.setError(null);

            const response = await this.api.deleteProject(id);

            if (response.success) {
                this.state.removeProject(id);
                return response;
            } else {
                this.state.setError(response.message);
                return response;
            }
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                message: error.message
            };
        } finally {
            this.state.setLoading(false);
        }
    }

    async getProjectById(id) {
        try {
            const response = await this.api.getProjectById(id);
            return response;
        } catch (error) {
            this.state.setError(error.message);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskService;
}

