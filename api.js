// API Service - Handles all data operations
class TaskAPI {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.endpoint = '/api/tasks';
        this.dbName = 'TaskManagerDB';
        this.dbVersion = 1;
        this.db = null;
        this.initIndexedDB();
    }

    // Initialize IndexedDB
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.warn('IndexedDB not available, using localStorage');
                resolve(null);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('tasks')) {
                    db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: false });
                }
                if (!db.objectStoreNames.contains('projects')) {
                    db.createObjectStore('projects', { keyPath: 'id', autoIncrement: false });
                }
            };
        });
    }

    // Helper function to safely parse tasks from localStorage
    getTasksFromStorage() {
        try {
            const tasksData = localStorage.getItem('tasks');
            if (!tasksData) {
                return [];
            }
            
            const parsed = JSON.parse(tasksData);
            
            // Check if it's an object with tasks property or direct array
            if (Array.isArray(parsed)) {
                return parsed;
            } else if (parsed && Array.isArray(parsed.tasks)) {
                return parsed.tasks;
            } else {
                // If it's not an array, return empty array
                console.warn('Tasks data is not in expected format, resetting to empty array');
                return [];
            }
        } catch (error) {
            console.error('Error parsing tasks from localStorage:', error);
            return [];
        }
    }

    // Helper function to save tasks to localStorage
    saveTasksToStorage(tasks) {
        try {
            if (!Array.isArray(tasks)) {
                console.error('Tasks must be an array');
                return false;
            }
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            return false;
        }
    }

    // GET - Fetch all tasks
    async getAllTasks() {
        try {
            const tasksData = localStorage.getItem('tasks');
            let tasks = [];
            
            if (tasksData) {
                const parsed = JSON.parse(tasksData);
                // Check if it's an object with tasks property or direct array
                if (Array.isArray(parsed)) {
                    tasks = parsed;
                } else if (parsed && Array.isArray(parsed.tasks)) {
                    tasks = parsed.tasks;
                } else {
                    tasks = [];
                }
            }
            
            return {
                success: true,
                data: tasks,
                message: 'Tasks fetched successfully'
            };
        } catch (error) {
            console.error('Error getting tasks:', error);
            return {
                success: false,
                data: [],
                message: error.message
            };
        }
    }

    // GET - Fetch task by ID
    async getTaskById(id) {
        try {
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const task = tasks.find(t => t.id === id);
            
            if (!task) {
                return {
                    success: false,
                    data: null,
                    message: 'Task not found'
                };
            }

            return {
                success: true,
                data: task,
                message: 'Task fetched successfully'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    // POST - Create new task
    async createTask(taskData) {
        try {
            // Get existing tasks
            const tasksData = localStorage.getItem('tasks');
            let tasks = [];
            
            if (tasksData) {
                const parsed = JSON.parse(tasksData);
                // Check if it's an object with tasks property or direct array
                if (Array.isArray(parsed)) {
                    tasks = parsed;
                } else if (parsed && Array.isArray(parsed.tasks)) {
                    tasks = parsed.tasks;
                } else {
                    tasks = [];
                }
            }
            
            // Ensure tasks is an array
            if (!Array.isArray(tasks)) {
                tasks = [];
            }
            
            // Create new task with unique ID (combine timestamp with random number to ensure uniqueness)
            let taskId;
            let isUnique = false;
            const existingIds = new Set(tasks.map(t => t.id));
            
            // Generate unique ID - retry if collision detected
            while (!isUnique) {
                taskId = Date.now() + Math.floor(Math.random() * 10000);
                if (!existingIds.has(taskId)) {
                    isUnique = true;
                }
            }
            
            const newTask = {
                id: taskId,
                title: taskData.title || '',
                description: taskData.description || '',
                dueDate: taskData.dueDate || '',
                priority: taskData.priority || 'low',
                category: taskData.category || 'work',
                status: taskData.status || 'todo', // Default to 'todo' for kanban board
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                completed: false,
                checkCount: 0,
                progress: 0
            };

            // Add to array
            tasks.push(newTask);

            // Save to localStorage as array (not object)
            this.saveTasksToStorage(tasks);

            return {
                success: true,
                data: newTask,
                message: 'Task created successfully'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message || 'Failed to create task'
            };
        }
    }

    // PUT - Update task
    async updateTask(id, updates) {
        try {
            const tasks = this.getTasksFromStorage();
            const taskIndex = tasks.findIndex(t => t.id === id);

            if (taskIndex === -1) {
                return {
                    success: false,
                    data: null,
                    message: 'Task not found'
                };
            }

            tasks[taskIndex] = {
                ...tasks[taskIndex],
                ...updates,
                id: id,
                updatedAt: new Date().toISOString()
            };

            this.saveTasksToStorage(tasks);

            return {
                success: true,
                data: tasks[taskIndex],
                message: 'Task updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    // DELETE - Delete task
    async deleteTask(id) {
        try {
            const tasks = this.getTasksFromStorage();
            const filteredTasks = tasks.filter(t => t.id !== id);

            if (tasks.length === filteredTasks.length) {
                return {
                    success: false,
                    data: null,
                    message: 'Task not found'
                };
            }

            this.saveTasksToStorage(filteredTasks);

            return {
                success: true,
                data: { id },
                message: 'Task deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    // PATCH - Toggle task completion
    async toggleTaskComplete(id) {
        try {
            const result = await this.getTaskById(id);
            
            if (!result.success) {
                return result;
            }

            const task = result.data;
            
            // Don't allow checking if already completed
            if (task.completed) {
                return {
                    success: false,
                    data: task,
                    message: 'Task is already completed'
                };
            }
            
            // Initialize checkCount if not exists
            const currentCheckCount = task.checkCount || 0;
            const newCheckCount = currentCheckCount + 1;
            
            // If checkCount reaches 6, mark as completed
            const isCompleted = newCheckCount >= 6;
            
            // Calculate progress (6 checks = 100%)
            const progress = Math.min(Math.round((newCheckCount / 6) * 100), 100);
            
            // Update status to 'complete' if task is completed
            const status = isCompleted ? 'complete' : (task.status || 'todo');

            return await this.updateTask(id, {
                checkCount: newCheckCount,
                completed: isCompleted,
                progress: progress,
                status: status
            });
        } catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }

    // Export tasks to JSON file
    exportToJSON() {
        try {
            const tasks = this.getTasksFromStorage();
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                tasks: tasks
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return {
                success: true,
                message: 'Tasks exported successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Import tasks from JSON file
    async importFromJSON(file) {
        try {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const importData = JSON.parse(e.target.result);
                        const tasks = importData.tasks || importData; // Support both formats
                        
                        if (!Array.isArray(tasks)) {
                            throw new Error('Invalid JSON format: tasks must be an array');
                        }

                        // Merge with existing tasks (avoid duplicates by ID)
                        const existingTasks = this.getTasksFromStorage();
                        const existingIds = new Set(existingTasks.map(t => t.id));
                        
                        const newTasks = tasks.filter(t => !existingIds.has(t.id));
                        const mergedTasks = [...existingTasks, ...newTasks];
                        
                        this.saveTasksToStorage(mergedTasks);

                        resolve({
                            success: true,
                            data: mergedTasks,
                            imported: newTasks.length,
                            message: `Successfully imported ${newTasks.length} tasks`
                        });
                    } catch (parseError) {
                        reject({
                            success: false,
                            message: `Failed to parse JSON: ${parseError.message}`
                        });
                    }
                };
                
                reader.onerror = () => {
                    reject({
                        success: false,
                        message: 'Failed to read file'
                    });
                };
                
                reader.readAsText(file);
            });
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskAPI;
}

