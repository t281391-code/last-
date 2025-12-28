// Language functionality moved to language.js

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    
    // Initialize API and Services
    const taskAPI = new TaskAPI();
    const taskService = new TaskService(taskAPI, appState);
    
    // Language Toggle Functionality
    const langEn = document.getElementById('langEn');
    const langMn = document.getElementById('langMn');
    
    // Initialize language manager
    languageManager.init();
    appState.setLanguage(languageManager.getCurrentLanguage());
    
    // Update active button based on current language
    function updateLanguageButtons() {
        const currentLang = languageManager.getCurrentLanguage();
        if (langEn && langMn) {
            if (currentLang === 'en') {
                langEn.classList.add('active');
                langMn.classList.remove('active');
            } else {
                langMn.classList.add('active');
                langEn.classList.remove('active');
            }
        }
    }
    
    // Initialize language buttons
    updateLanguageButtons();
    
    // Language toggle event listeners
    if (langEn) {
        langEn.addEventListener('click', () => {
            languageManager.setLanguage('en');
            appState.setLanguage('en');
            updateLanguageButtons();
            // Re-render tasks if renderTasks function exists
            if (typeof renderTasks === 'function') {
                renderTasks();
            }
        });
    }
    
    if (langMn) {
        langMn.addEventListener('click', () => {
            languageManager.setLanguage('mn');
            appState.setLanguage('mn');
            updateLanguageButtons();
            // Re-render tasks if renderTasks function exists
            if (typeof renderTasks === 'function') {
                renderTasks();
            }
        });
    }
    
    // Theme Toggle Functionality - moved to theme.js
    // Initialize theme manager and sync with app state
    if (typeof themeManager !== 'undefined') {
        // themeManager.init() is already called in theme.js, don't call again
        appState.setTheme(themeManager.getCurrentTheme());
        themeManager.subscribeToState(appState);
        
        // Update app state when theme changes
        const originalToggleTheme = themeManager.toggleTheme.bind(themeManager);
        themeManager.toggleTheme = function() {
            const newTheme = originalToggleTheme();
            appState.setTheme(newTheme);
            return newTheme;
        };
    }
    
    // Add SVG gradient definition for progress circle
    const progressCircle = document.querySelector('.progress-circle');
    if (progressCircle) {
        const svg = progressCircle.closest('svg');
        if (svg && !svg.querySelector('defs')) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', 'gradient');
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#ff6b9d');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', '#c44569');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.insertBefore(defs, svg.firstChild);
        }
    }
    
    // Task Modal Functionality
    const createTaskBtn = document.getElementById('createTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const taskForm = document.getElementById('taskForm');
    
    // Open modal
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', () => {
            if (taskModal) {
                taskModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Close modal function
    function closeTaskModal() {
        if (taskModal) {
            taskModal.classList.remove('active');
            document.body.style.overflow = '';
            taskForm.reset();
        }
    }
    
    // Close modal events
    if (closeModal) {
        closeModal.addEventListener('click', closeTaskModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeTaskModal);
    }
    
    // Close modal when clicking outside
    if (taskModal) {
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                closeTaskModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && taskModal && taskModal.classList.contains('active')) {
            closeTaskModal();
        }
    });
    
    // UI Renderer - Pure function for rendering tasks (define early)
    function renderTasks(tasks = null) {
        const tasksList = document.getElementById('tasksList');
        const emptyTasks = document.getElementById('emptyTasks');
        const tasksCount = document.getElementById('tasksCount');
        
        if (!tasksList) {
            console.error('Tasks list element not found!');
            return;
        }
        
        // Get tasks from state if not provided
        let tasksToRender = tasks;
        if (!tasksToRender || !Array.isArray(tasksToRender)) {
            tasksToRender = appState.getStateProperty('tasks') || [];
        }
        
        // Ensure it's an array
        if (!Array.isArray(tasksToRender)) {
            tasksToRender = [];
        }
        
        // Filter out completed tasks - only show active tasks in "My Tasks" section
        const currentPage = appState.getStateProperty('currentPage');
        if (currentPage !== 'taskList') {
            // On dashboard, only show active (not completed) tasks
            tasksToRender = tasksToRender.filter(task => !task.completed);
        }
        
        const currentLang = languageManager.getCurrentLanguage();
        
        // Update count (only active tasks)
        if (tasksCount) {
            tasksCount.textContent = tasksToRender.length;
        }
        
        // Clear existing tasks
        tasksList.innerHTML = '';
        
        if (tasksToRender.length === 0) {
            // Show empty state
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-tasks';
            emptyDiv.id = 'emptyTasks';
            emptyDiv.innerHTML = `
                <i class="fas fa-clipboard-list"></i>
                <p data-i18n="noTasks">${languageManager.translate('noTasks')}</p>
            `;
            tasksList.appendChild(emptyDiv);
        } else {
            // Render tasks as project cards
            tasksToRender.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
                taskItem.dataset.taskId = task.id;
                
                // Calculate progress based on checkCount or progress field (6 checks = 100%)
                let progress = 0;
                if (task.completed) {
                    progress = 100;
                } else if (task.progress !== undefined) {
                    // Use progress field if available
                    progress = Math.min(Math.round(task.progress), 100);
                } else if (task.checkCount && task.checkCount > 0) {
                    // Fallback to checkCount calculation
                    progress = Math.min(Math.round((task.checkCount / 6) * 100), 100);
                }
                
                // Format dates
                const startDate = task.createdAt ? new Date(task.createdAt) : new Date();
                const endDate = new Date(task.dueDate);
                
                const formattedStartDate = startDate.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'mn-MN', {
                    day: 'numeric',
                    month: 'long'
                });
                
                const formattedEndDate = endDate.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'mn-MN', {
                    day: 'numeric',
                    month: 'long'
                });
                
                taskItem.innerHTML = `
                    <div class="task-card-content">
                        <div class="task-card-header">
                            <h4 class="task-card-title">${task.title || 'Untitled Task'}</h4>
                            ${task.description ? `<p class="task-card-description">${task.description}</p>` : ''}
                        </div>
                        <div class="task-progress-section">
                            <div class="task-progress-info">
                                <span class="task-progress-text">${progress}% ${languageManager.translate('completed')}</span>
                            </div>
                            <div class="task-progress-bar">
                                <div class="task-progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="task-dates">
                            <div class="task-date-item">
                                <span class="task-date-label">${languageManager.translate('startDate')}:</span>
                                <span class="task-date-value">${formattedStartDate}</span>
                            </div>
                            <div class="task-date-item">
                                <span class="task-date-label">${languageManager.translate('endDate')}:</span>
                                <span class="task-date-value">${formattedEndDate}</span>
                            </div>
                        </div>
                        <div class="task-card-actions">
                            <button class="task-btn task-btn-check" data-task-id="${task.id}" title="${languageManager.translate('check')}">
                                <i class="fas fa-check"></i>
                                ${languageManager.translate('check')}
                            </button>
                            <button class="task-btn task-btn-edit" data-task-id="${task.id}" title="${languageManager.translate('edit')}">
                                <i class="fas fa-edit"></i>
                                ${languageManager.translate('edit')}
                            </button>
                            <button class="task-btn task-btn-delete" data-task-id="${task.id}" title="${languageManager.translate('delete')}">
                                <i class="fas fa-trash"></i>
                                ${languageManager.translate('delete')}
                            </button>
                        </div>
                    </div>
                `;
                
                tasksList.appendChild(taskItem);
            });
            
            // Add event listeners for check buttons
            tasksList.querySelectorAll('.task-btn-check').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const taskId = parseInt(e.target.closest('.task-btn-check').dataset.taskId);
                    await taskService.toggleTaskComplete(taskId);
                    // After checking, refresh the view
                    const currentPage = appState.getStateProperty('currentPage');
                    if (currentPage === 'taskList') {
                        showTaskListPage();
                    } else {
                        // On dashboard, re-render kanban board
                        await taskService.loadTasks();
                        const tasks = appState.getStateProperty('tasks') || [];
                        renderKanbanBoard(tasks);
                        setupKanbanDragAndDrop();
                    }
                });
            });
            
            // Add event listeners for edit buttons
            tasksList.querySelectorAll('.task-btn-edit').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const taskId = parseInt(e.target.closest('.task-btn-edit').dataset.taskId);
                    // TODO: Implement edit functionality
                    const currentLang = appState.getStateProperty('currentLanguage');
                    alert(currentLang === 'en' ? 'Edit functionality coming soon!' : 'Засах функц удахгүй нэмэгдэнэ!');
                });
            });
            
            // Add event listeners for delete buttons
            tasksList.querySelectorAll('.task-btn-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const taskId = parseInt(e.target.closest('.task-btn-delete').dataset.taskId);
                    const currentLang = appState.getStateProperty('currentLanguage');
                    
                    if (confirm(currentLang === 'en' ? 'Are you sure you want to delete this task?' : 'Энэ даалгаврыг устгахдаа итгэлтэй байна уу?')) {
                        await taskService.deleteTask(taskId);
                    }
                });
            });
        }
    }
    
    // Subscribe to state changes (after renderTasks is defined)
    let lastPage = appState.getStateProperty('currentPage') || 'dashboard';
    let lastSearchQuery = '';
    let isPerformingSearch = false; // Flag to prevent recursive calls
    appState.subscribe((state) => {
        // Re-render tasks when state changes
        if (state && state.tasks !== undefined) {
            // Update progress circle whenever tasks change
            updateTaskProgress(state.tasks);
            
            const searchQuery = state.searchQuery || '';
            const currentPage = state.currentPage || 'dashboard';
            
            // Only update if page or search query actually changed
            const pageChanged = currentPage !== lastPage;
            const searchChanged = searchQuery !== lastSearchQuery;
            
            // Handle search - only on dashboard page
            // Note: performSearch is now called directly from setupSearch, so we don't need to call it here
            // This prevents double calls
            if (searchQuery && currentPage === 'dashboard' && searchChanged) {
                lastSearchQuery = searchQuery;
            } else if (!searchQuery && currentPage === 'dashboard' && searchChanged) {
                // Clear search results and show normal kanban board
                renderKanbanBoard(state.tasks);
                setupKanbanDragAndDrop();
                lastSearchQuery = '';
            } else if (currentPage === 'taskList' && pageChanged) {
                // If on task list page, show the task list view (only if page changed)
                showTaskListPage();
                lastPage = currentPage;
            } else if (currentPage === 'dashboard' && (pageChanged || searchChanged)) {
                // Show dashboard page and render kanban board
                showDashboardPage();
                lastPage = currentPage;
            } else if (currentPage === 'dashboard' && !pageChanged && !searchChanged) {
                // If on dashboard and tasks changed, re-render kanban board
                renderKanbanBoard(state.tasks);
                setupKanbanDragAndDrop();
            } else if (currentPage === 'analytics' && pageChanged) {
                // Show analytics page
                showAnalyticsPage();
                lastPage = currentPage;
            } else if (currentPage === 'settings' && pageChanged) {
                // Show settings page
                showSettingsPage();
                lastPage = currentPage;
            } else if (currentPage === 'calendar' && pageChanged) {
                // Show calendar page
                showCalendarPage();
                lastPage = currentPage;
            } else if (currentPage !== 'taskList' && currentPage !== 'dashboard' && currentPage !== 'analytics' && currentPage !== 'settings' && currentPage !== 'calendar') {
                // On dashboard by default, only show active tasks (filter out completed)
                if (pageChanged || searchChanged) {
                    renderTasks(state.tasks);
                    lastPage = currentPage;
                }
            }
        }
    });
    
    // Function to update task progress circle
    function updateTaskProgress(tasks) {
        const tasksArray = tasks || [];
        
        // Filter only active tasks (not completed) - "Миний даалгаврууд" хэсэг дээрх даалгаврууд
        const activeTasks = tasksArray.filter(t => !t.completed);
        const totalActiveTasks = activeTasks.length;
        
        // Calculate completed tasks (for stats)
        const completedTasks = tasksArray.filter(t => t.completed);
        const completedCount = completedTasks.length;
        
        // Calculate active tasks count (for stats)
        const activeCount = activeTasks.length;
        
        // Calculate average progress percentage based on active tasks' individual progress
        // 0% if no active tasks, otherwise average of active task progress values
        // Always start from 0 and show whole numbers only
        let progressPercent = 0;
        if (totalActiveTasks > 0) {
            let totalProgress = 0;
            activeTasks.forEach(task => {
                let taskProgress = 0;
                if (task.progress !== undefined) {
                    taskProgress = Math.min(Math.round(task.progress), 100);
                } else if (task.checkCount && task.checkCount > 0) {
                    taskProgress = Math.min(Math.round((task.checkCount / 6) * 100), 100);
                }
                totalProgress += taskProgress;
            });
            // Round to whole number, ensure it starts from 0
            progressPercent = Math.max(0, Math.round(totalProgress / totalActiveTasks));
        }
        
        // Update progress circle
        const progressBar = document.getElementById('progressBar');
        const progressPercentElement = document.getElementById('progressPercent');
        const taskPassedCount = document.getElementById('taskPassedCount');
        const taskNotPassedCount = document.getElementById('taskNotPassedCount');
        
        if (progressBar) {
            // Calculate stroke-dashoffset (283 is the circumference, 283 = 100%)
            const circumference = 283;
            const offset = circumference - (progressPercent / 100) * circumference;
            progressBar.setAttribute('stroke-dashoffset', offset);
        }
        
        if (progressPercentElement) {
            progressPercentElement.textContent = `${progressPercent}%`;
        }
        
        if (taskPassedCount) {
            taskPassedCount.textContent = completedCount;
        }
        
        if (taskNotPassedCount) {
            taskNotPassedCount.textContent = activeCount;
        }
    }

    // Search functionality
    function setupSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (!searchInput) {
            console.error('Search input not found!');
            return;
        }

        console.log('Search setup completed');

        // Real-time search - no debounce delay
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            console.log('Search input changed:', query);
            appState.setSearchQuery(query);
            // Call performSearch directly to ensure it works
            if (!isPerformingSearch) {
                console.log('Calling performSearch with query:', query);
                performSearch(query);
            } else {
                console.log('Search already in progress, skipping...');
            }
        });

        // Clear search on Escape key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                appState.setSearchQuery('');
                performSearch('');
            }
        });
    }

    function performSearch(query) {
        console.log('performSearch called with query:', query);
        
        // Prevent recursive calls
        if (isPerformingSearch) {
            console.log('Search already in progress, returning...');
            return;
        }
        
        isPerformingSearch = true;
        console.log('isPerformingSearch set to true');
        
        try {
        if (!query || query.trim() === '') {
            console.log('Query is empty, showing normal tasks');
            // If query is empty, show normal tasks
            const currentPage = appState.getStateProperty('currentPage') || 'dashboard';
            if (currentPage === 'dashboard') {
                renderTasks();
            }
            isPerformingSearch = false;
            return;
        }

        const searchQuery = query.trim().toLowerCase();
        const tasks = appState.getStateProperty('tasks') || [];
        const projects = appState.getStateProperty('projects') || [];
        
        console.log('Total tasks:', tasks.length, 'Total projects:', projects.length);
        
        // Filter tasks - search in both active and completed tasks
        const filteredTasks = tasks.filter(task => {
            const title = (task.title || '').toLowerCase();
            const description = (task.description || '').toLowerCase();
            return title.includes(searchQuery) || description.includes(searchQuery);
        });

        // Filter projects
        const filteredProjects = projects.filter(project => {
            const title = (project.title || '').toLowerCase();
            const description = (project.description || '').toLowerCase();
            return title.includes(searchQuery) || description.includes(searchQuery);
        });

        // Always show search results on dashboard page, regardless of current page
        const dashboardPage = document.getElementById('dashboardPage');
        if (!dashboardPage) {
            isPerformingSearch = false;
            return;
        }
        
        // Switch to dashboard page when searching (only update state if needed to prevent recursion)
        const currentPage = appState.getStateProperty('currentPage') || 'dashboard';
        if (currentPage !== 'dashboard') {
            // Use direct state update to avoid triggering subscribers
            appState.state.currentPage = 'dashboard';
        }
        
        // Make sure dashboard page is visible
        dashboardPage.style.display = 'block';
        
        // Hide other pages
        const taskListPage = document.getElementById('taskListPage');
        const analyticsPage = document.getElementById('analyticsPage');
        const settingsPage = document.getElementById('settingsPage');
        const calendarPage = document.getElementById('calendarPage');
        
        if (taskListPage) taskListPage.style.display = 'none';
        if (analyticsPage) analyticsPage.style.display = 'none';
        if (settingsPage) settingsPage.style.display = 'none';
        if (calendarPage) calendarPage.style.display = 'none';
        
        // Update active nav item (only if page changed)
        if (currentPage !== 'dashboard') {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                const span = item.querySelector('span');
                if (span && span.getAttribute('data-i18n') === 'dashboard') {
                    item.classList.add('active');
                }
            });
        }
        
        // Show search results
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) {
            isPerformingSearch = false;
            return;
        }
        
        if (filteredTasks.length > 0 || filteredProjects.length > 0) {
            renderSearchResults(filteredTasks, filteredProjects, query);
        } else {
            const currentLang = languageManager.getCurrentLanguage();
            tasksList.innerHTML = `
                <div class="empty-tasks">
                    <i class="fas fa-search"></i>
                    <p>${currentLang === 'en' ? 'No results found' : 'Үр дүн олдсонгүй'}</p>
                </div>
            `;
        }
        } finally {
            isPerformingSearch = false;
        }
    }

    function renderSearchResults(tasks, projects, query) {
        console.log('renderSearchResults called with', tasks.length, 'tasks and', projects.length, 'projects');
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) {
            console.error('tasksList not found in renderSearchResults!');
            return;
        }

        const currentLang = languageManager.getCurrentLanguage();
        tasksList.innerHTML = '';
        console.log('Cleared tasksList innerHTML');

        // Render tasks
        tasks.forEach(task => {
            const taskItem = createTaskCardElement(task, currentLang);
            tasksList.appendChild(taskItem);
        });

        // Render projects
        projects.forEach(project => {
            const projectItem = createProjectCardElement(project, currentLang);
            tasksList.appendChild(projectItem);
        });

        // Add event listeners
        attachTaskEventListeners(tasksList);
    }

    function createTaskCardElement(task, currentLang) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.taskId = task.id;
        
        // Calculate progress based on checkCount or progress field (6 checks = 100%)
        let progress = 0;
        if (task.completed) {
            progress = 100;
        } else if (task.progress !== undefined) {
            // Use progress field if available
            progress = Math.min(Math.round(task.progress), 100);
        } else if (task.checkCount && task.checkCount > 0) {
            // Fallback to checkCount calculation
            progress = Math.min(Math.round((task.checkCount / 6) * 100), 100);
        }
        const startDate = task.createdAt ? new Date(task.createdAt) : new Date();
        const endDate = new Date(task.dueDate);
        
        const formattedStartDate = startDate.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'mn-MN', {
            day: 'numeric',
            month: 'long'
        });
        
        const formattedEndDate = endDate.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'mn-MN', {
            day: 'numeric',
            month: 'long'
        });
        
        taskItem.innerHTML = `
            <div class="task-card-content">
                <div class="task-card-header">
                    <h4 class="task-card-title">${task.title || 'Untitled Task'}</h4>
                    ${task.description ? `<p class="task-card-description">${task.description}</p>` : ''}
                </div>
                <div class="task-progress-section">
                    <div class="task-progress-info">
                        <span class="task-progress-text">${progress}% ${languageManager.translate('completed')}</span>
                    </div>
                    <div class="task-progress-bar">
                        <div class="task-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="task-dates">
                    <div class="task-date-item">
                        <span class="task-date-label">${languageManager.translate('startDate')}:</span>
                        <span class="task-date-value">${formattedStartDate}</span>
                    </div>
                    <div class="task-date-item">
                        <span class="task-date-label">${languageManager.translate('endDate')}:</span>
                        <span class="task-date-value">${formattedEndDate}</span>
                    </div>
                </div>
                <div class="task-card-actions">
                    <button class="task-btn task-btn-check" data-task-id="${task.id}" title="${languageManager.translate('check')}">
                        <i class="fas fa-check"></i>
                        ${languageManager.translate('check')}
                    </button>
                    <button class="task-btn task-btn-edit" data-task-id="${task.id}" title="${languageManager.translate('edit')}">
                        <i class="fas fa-edit"></i>
                        ${languageManager.translate('edit')}
                    </button>
                    <button class="task-btn task-btn-delete" data-task-id="${task.id}" title="${languageManager.translate('delete')}">
                        <i class="fas fa-trash"></i>
                        ${languageManager.translate('delete')}
                    </button>
                </div>
            </div>
        `;
        
        return taskItem;
    }

    function createProjectCardElement(project, currentLang) {
        const projectItem = document.createElement('div');
        projectItem.className = `task-item priority-medium ${project.completed ? 'completed' : ''}`;
        projectItem.dataset.projectId = project.id;
        
        const progress = project.progress || 0;
        const startDate = project.startDate || '';
        const endDate = project.endDate || '';
        
        projectItem.innerHTML = `
            <div class="task-card-content">
                <div class="task-card-header">
                    <h4 class="task-card-title">${project.title || 'Untitled Project'}</h4>
                    ${project.description ? `<p class="task-card-description">${project.description}</p>` : ''}
                    <span class="project-badge" style="display: inline-block; padding: 4px 8px; background: #4a90e2; color: white; border-radius: 4px; font-size: 11px; margin-top: 8px;">${languageManager.translate('project')}</span>
                </div>
                <div class="task-progress-section">
                    <div class="task-progress-info">
                        <span class="task-progress-text">${progress}% ${languageManager.translate('completed')}</span>
                    </div>
                    <div class="task-progress-bar">
                        <div class="task-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="task-dates">
                    <div class="task-date-item">
                        <span class="task-date-label">${languageManager.translate('startDate')}:</span>
                        <span class="task-date-value">${startDate}</span>
                    </div>
                    <div class="task-date-item">
                        <span class="task-date-label">${languageManager.translate('endDate')}:</span>
                        <span class="task-date-value">${endDate}</span>
                    </div>
                </div>
                <div class="task-card-actions">
                    <button class="task-btn task-btn-check" data-project-id="${project.id}" title="${languageManager.translate('check')}">
                        <i class="fas fa-check"></i>
                        ${languageManager.translate('check')}
                    </button>
                    <button class="task-btn task-btn-edit" data-project-id="${project.id}" title="${languageManager.translate('edit')}">
                        <i class="fas fa-edit"></i>
                        ${languageManager.translate('edit')}
                    </button>
                    <button class="task-btn task-btn-delete" data-project-id="${project.id}" title="${languageManager.translate('delete')}">
                        <i class="fas fa-trash"></i>
                        ${languageManager.translate('delete')}
                    </button>
                </div>
            </div>
        `;
        
        return projectItem;
    }

    function attachTaskEventListeners(container) {
        // Task check buttons
        container.querySelectorAll('.task-btn-check[data-task-id]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const taskId = parseInt(e.target.closest('.task-btn-check').dataset.taskId);
                const task = appState.getStateProperty('tasks').find(t => t.id === taskId);
                
                // Don't allow checking if already completed
                if (task && task.completed) {
                    return;
                }
                
                await taskService.toggleTaskComplete(taskId);
                
                // Refresh current page
                const currentPage = appState.getStateProperty('currentPage');
                if (currentPage === 'taskList') {
                    setTimeout(() => {
                        showTaskListPage();
                    }, 100);
                } else {
                    // On dashboard, re-render kanban board
                    await taskService.loadTasks();
                    const tasks = appState.getStateProperty('tasks') || [];
                    renderKanbanBoard(tasks);
                    setupKanbanDragAndDrop();
                }
            });
        });

        // Project check buttons
        container.querySelectorAll('.task-btn-check[data-project-id]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const projectId = parseInt(e.target.closest('.task-btn-check').dataset.projectId);
                const project = appState.getProjectById(projectId);
                if (project && !project.completed) {
                    const newProgress = Math.min((project.progress || 0) + 20, 100);
                    await taskService.updateProject(projectId, { progress: newProgress });
                }
            });
        });

        // Edit buttons
        container.querySelectorAll('.task-btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const taskId = btn.dataset.taskId;
                const projectId = btn.dataset.projectId;
                const currentLang = appState.getStateProperty('currentLanguage');
                if (taskId) {
                    alert(currentLang === 'en' ? 'Edit functionality coming soon!' : 'Засах функц удахгүй нэмэгдэнэ!');
                } else if (projectId) {
                    alert(currentLang === 'en' ? 'Edit functionality coming soon!' : 'Засах функц удахгүй нэмэгдэнэ!');
                }
            });
        });

        // Delete buttons
        container.querySelectorAll('.task-btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const taskId = btn.dataset.taskId;
                const projectId = btn.dataset.projectId;
                const currentLang = appState.getStateProperty('currentLanguage');
                
                if (taskId) {
                    if (confirm(currentLang === 'en' ? 'Are you sure you want to delete this task?' : 'Энэ даалгаврыг устгахдаа итгэлтэй байна уу?')) {
                        await taskService.deleteTask(parseInt(taskId));
                        // Refresh task list page if we're on it
                        const currentPage = appState.getStateProperty('currentPage');
                        if (currentPage === 'taskList') {
                            showTaskListPage();
                        }
                    }
                } else if (projectId) {
                    if (confirm(currentLang === 'en' ? 'Are you sure you want to delete this project?' : 'Энэ төслийг устгахдаа итгэлтэй байна уу?')) {
                        await taskService.deleteProject(parseInt(projectId));
                    }
                }
            });
        });
    }

    // Navigation setup
    function setupTaskListNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const span = item.querySelector('span');
                const i18nKey = span ? span.getAttribute('data-i18n') : null;
                
                if (i18nKey === 'taskList') {
                    appState.setCurrentPage('taskList');
                    // showTaskListPage will be called by subscribe handler
                } else if (i18nKey === 'dashboard') {
                    appState.setCurrentPage('dashboard');
                    // Dashboard will be shown by subscribe handler
                } else if (i18nKey === 'analytics') {
                    appState.setCurrentPage('analytics');
                    // showAnalyticsPage will be called by subscribe handler
                } else if (i18nKey === 'setting') {
                    appState.setCurrentPage('settings');
                    // showSettingsPage will be called by subscribe handler
                } else if (i18nKey === 'calendar') {
                    appState.setCurrentPage('calendar');
                    // showCalendarPage will be called by subscribe handler
                }
            });
        });
    }
    
    // Calendar functionality
    let currentCalendarDate = new Date();
    let selectedCalendarDate = null;
    let calendarNotes = JSON.parse(localStorage.getItem('calendarNotes') || '{}');
    
    // Function to show calendar page
    function showCalendarPage() {
        const dashboardPage = document.getElementById('dashboardPage');
        const taskListPage = document.getElementById('taskListPage');
        const analyticsPage = document.getElementById('analyticsPage');
        const settingsPage = document.getElementById('settingsPage');
        const calendarPage = document.getElementById('calendarPage');
        
        if (dashboardPage) dashboardPage.style.display = 'none';
        if (taskListPage) taskListPage.style.display = 'none';
        if (analyticsPage) analyticsPage.style.display = 'none';
        if (settingsPage) settingsPage.style.display = 'none';
        if (calendarPage) calendarPage.style.display = 'block';
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const span = item.querySelector('span');
            if (span && span.getAttribute('data-i18n') === 'calendar') {
                item.classList.add('active');
            }
        });
        
        // Render calendar
        renderCalendar();
    }
    
    // Function to render calendar
    function renderCalendar() {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        // Update month/year display
        const monthYearElement = document.getElementById('calendarMonthYear');
        if (monthYearElement) {
            const monthNames = languageManager.getCurrentLanguage() === 'en' 
                ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                : ['Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар', 'Тавдугаар сар', 'Зургаадугаар сар', 'Долоодугаар сар', 'Наймдугаар сар', 'Есдүгээр сар', 'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'];
            monthYearElement.textContent = `${monthNames[month]} ${year}`;
        }
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Render calendar dates
        const calendarDatesElement = document.getElementById('calendarFullDates');
        if (!calendarDatesElement) return;
        
        calendarDatesElement.innerHTML = '';
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const date = daysInPrevMonth - i;
            const dateElement = document.createElement('div');
            dateElement.className = 'calendar-date-full prev-month';
            dateElement.textContent = date;
            dateElement.dataset.date = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            calendarDatesElement.appendChild(dateElement);
        }
        
        // Get today's date for comparison
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateElement = document.createElement('div');
            dateElement.className = 'calendar-date-full';
            dateElement.textContent = i;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dateElement.dataset.date = dateKey;
            
            // Check if this is today's date
            if (year === todayYear && month === todayMonth && i === todayDate) {
                dateElement.classList.add('today');
            }
            
            // Check if date has notes
            if (calendarNotes[dateKey] && calendarNotes[dateKey].length > 0) {
                dateElement.classList.add('has-notes');
            }
            
            // Add + icon for adding notes
            const plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus calendar-add-icon';
            plusIcon.style.display = 'none';
            dateElement.appendChild(plusIcon);
            
            // Show + icon on hover
            dateElement.addEventListener('mouseenter', () => {
                plusIcon.style.display = 'block';
            });
            
            dateElement.addEventListener('mouseleave', () => {
                if (!dateElement.classList.contains('active')) {
                    plusIcon.style.display = 'none';
                }
            });
            
            // Add click event for date selection
            dateElement.addEventListener('click', (e) => {
                // If clicking on + icon, select date and open note modal
                if (e.target.classList.contains('calendar-add-icon') || e.target.closest('.calendar-add-icon')) {
                    e.stopPropagation();
                    // Select date first
                    selectCalendarDate(dateKey, i, month, year);
                    // Open note modal
                    openCalendarNoteModal();
                } else {
                    // Regular click - select date, show notes, and open note modal
                    selectCalendarDate(dateKey, i, month, year);
                    // Open note modal to add note
                    openCalendarNoteModal();
                }
            });
            
            // Keep + icon visible when date is active
            if (selectedCalendarDate === dateKey) {
                plusIcon.style.display = 'block';
            }
            
            calendarDatesElement.appendChild(dateElement);
        }
        
        // Next month days (to fill the grid)
        const totalCells = calendarDatesElement.children.length;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            const dateElement = document.createElement('div');
            dateElement.className = 'calendar-date-full next-month';
            dateElement.textContent = i;
            calendarDatesElement.appendChild(dateElement);
        }
    }
    
    // Function to select a date
    function selectCalendarDate(dateKey, day, month, year) {
        selectedCalendarDate = dateKey;
        
        // Update active date
        document.querySelectorAll('.calendar-date-full').forEach(el => {
            el.classList.remove('active');
            const plusIcon = el.querySelector('.calendar-add-icon');
            if (plusIcon && el.dataset.date !== dateKey) {
                plusIcon.style.display = 'none';
            }
        });
        const selectedElement = document.querySelector(`[data-date="${dateKey}"]`);
        if (selectedElement) {
            selectedElement.classList.add('active');
            const plusIcon = selectedElement.querySelector('.calendar-add-icon');
            if (plusIcon) {
                plusIcon.style.display = 'block';
            }
        }
        
        // Show notes section
        const notesSection = document.getElementById('calendarNotesSection');
        const notesTitle = document.getElementById('selectedDateTitle');
        if (notesSection) {
            notesSection.style.display = 'block';
            if (notesTitle) {
                const monthNames = languageManager.getCurrentLanguage() === 'en' 
                    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                    : ['Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар', 'Тавдугаар сар', 'Зургаадугаар сар', 'Долоодугаар сар', 'Наймдугаар сар', 'Есдүгээр сар', 'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'];
                notesTitle.textContent = `${monthNames[month]} ${day}, ${year}`;
            }
        }
        
        // Render notes for selected date
        renderCalendarNotes(dateKey);
    }
    
    // Function to render notes for a date
    function renderCalendarNotes(dateKey) {
        const notesList = document.getElementById('calendarNotesList');
        if (!notesList) return;
        
        const notes = calendarNotes[dateKey] || [];
        notesList.innerHTML = '';
        
        if (notes.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'calendar-empty-notes';
            emptyDiv.innerHTML = `<i class="fas fa-sticky-note"></i><p>${languageManager.translate('noNotes')}</p>`;
            notesList.appendChild(emptyDiv);
        } else {
            notes.forEach((note, index) => {
                const noteElement = document.createElement('div');
                noteElement.className = 'calendar-note-item';
                noteElement.innerHTML = `
                    <div class="note-content">
                        ${note.time ? `<span class="note-time">${note.time}</span>` : ''}
                        <p class="note-text">${note.text}</p>
                    </div>
                    <button class="note-delete-btn" data-note-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                // Delete button
                const deleteBtn = noteElement.querySelector('.note-delete-btn');
                deleteBtn.addEventListener('click', () => {
                    deleteCalendarNote(dateKey, index);
                });
                
                notesList.appendChild(noteElement);
            });
        }
    }
    
    // Function to delete a note
    function deleteCalendarNote(dateKey, index) {
        if (calendarNotes[dateKey]) {
            calendarNotes[dateKey].splice(index, 1);
            if (calendarNotes[dateKey].length === 0) {
                delete calendarNotes[dateKey];
            }
            localStorage.setItem('calendarNotes', JSON.stringify(calendarNotes));
            renderCalendarNotes(dateKey);
            renderCalendar(); // Update calendar to remove has-notes class if needed
        }
    }
    
    // Function to open calendar note modal
    function openCalendarNoteModal() {
        const noteModal = document.getElementById('calendarNoteModal');
        if (!selectedCalendarDate) {
            const currentLang = languageManager.getCurrentLanguage();
            alert(currentLang === 'en' ? 'Please select a date first' : 'Эхлээд өдөр сонгоно уу');
            return;
        }
        if (noteModal) {
            noteModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Setup calendar navigation
    function setupCalendarNavigation() {
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
                renderCalendar();
                renderSidebarCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
                renderCalendar();
                renderSidebarCalendar();
            });
        }
    }
    
    // Setup calendar note modal
    function setupCalendarNoteModal() {
        const noteModal = document.getElementById('calendarNoteModal');
        const noteForm = document.getElementById('calendarNoteForm');
        const addNoteBtn = document.getElementById('addNoteBtn');
        const closeModalBtn = document.getElementById('closeCalendarNoteModal');
        const cancelBtn = document.getElementById('cancelCalendarNoteBtn');
        
        // Open modal
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => {
                openCalendarNoteModal();
            });
        }
        
        // Close modal
        function closeNoteModal() {
            if (noteModal) {
                noteModal.classList.remove('active');
                document.body.style.overflow = '';
                if (noteForm) {
                    noteForm.reset();
                }
            }
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeNoteModal);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeNoteModal);
        }
        
        // Form submission
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const noteText = document.getElementById('noteText');
                const noteTime = document.getElementById('noteTime');
                
                if (!noteText || !selectedCalendarDate) return;
                
                const note = {
                    text: noteText.value.trim(),
                    time: noteTime ? noteTime.value : null
                };
                
                if (!note.text) {
                    const currentLang = languageManager.getCurrentLanguage();
                    alert(currentLang === 'en' ? 'Please enter note text' : 'Тэмдэглэл оруулна уу');
                    return;
                }
                
                // Save note
                if (!calendarNotes[selectedCalendarDate]) {
                    calendarNotes[selectedCalendarDate] = [];
                }
                calendarNotes[selectedCalendarDate].push(note);
                localStorage.setItem('calendarNotes', JSON.stringify(calendarNotes));
                
                // Refresh display
                renderCalendarNotes(selectedCalendarDate);
                renderCalendar();
                renderSidebarCalendar();
                
                // Close modal
                closeNoteModal();
            });
        }
    }
    
    // Function to render sidebar calendar
    function renderSidebarCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        // Update header
        const headerElement = document.getElementById('sidebarCalendarHeader');
        if (headerElement) {
            const monthNames = languageManager.getCurrentLanguage() === 'en' 
                ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                : ['Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар', 'Тавдугаар сар', 'Зургаадугаар сар', 'Долоодугаар сар', 'Наймдугаар сар', 'Есдүгээр сар', 'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'];
            const dayNames = languageManager.getCurrentLanguage() === 'en'
                ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                : ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
            const dayName = dayNames[today.getDay()];
            headerElement.textContent = `${monthNames[month]}, ${dayName}`;
        }
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Render calendar dates
        const calendarDatesElement = document.getElementById('sidebarCalendarDates');
        if (!calendarDatesElement) return;
        
        calendarDatesElement.innerHTML = '';
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const date = daysInPrevMonth - i;
            const dateElement = document.createElement('div');
            dateElement.className = 'calendar-date prev-month';
            dateElement.textContent = date;
            calendarDatesElement.appendChild(dateElement);
        }
        
        // Current month days
        const todayDate = today.getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dateElement = document.createElement('div');
            dateElement.className = 'calendar-date';
            dateElement.textContent = i;
            
            // Check if this is today's date
            if (i === todayDate) {
                dateElement.classList.add('today');
            }
            
            // Check if date has notes
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (calendarNotes[dateKey] && calendarNotes[dateKey].length > 0) {
                dateElement.classList.add('has-notes');
            }
            
            // Add click event to navigate to calendar page
            dateElement.addEventListener('click', () => {
                appState.setCurrentPage('calendar');
                // Select the date in the main calendar
                setTimeout(() => {
                    selectCalendarDate(dateKey, i, month, year);
                }, 100);
            });
            
            calendarDatesElement.appendChild(dateElement);
        }
        
        // Next month days (to fill the grid)
        const totalCells = calendarDatesElement.children.length;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            const dateElement = document.createElement('div');
            dateElement.className = 'calendar-date next-month';
            dateElement.textContent = i;
            calendarDatesElement.appendChild(dateElement);
        }
    }
    
    // Initialize calendar
    setupCalendarNavigation();
    setupCalendarNoteModal();
    
    // Initialize sidebar calendar
    renderSidebarCalendar();
    
    // Setup profile image modal
    function setupProfileImageModal() {
        const viewAllBtn = document.querySelector('.view-all-btn');
        const profileImageModal = document.getElementById('profileImageModal');
        const closeProfileImageModal = document.getElementById('closeProfileImageModal');
        
        if (viewAllBtn && profileImageModal) {
            viewAllBtn.addEventListener('click', () => {
                profileImageModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (closeProfileImageModal) {
            closeProfileImageModal.addEventListener('click', () => {
                profileImageModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Close modal when clicking outside
        if (profileImageModal) {
            profileImageModal.addEventListener('click', (e) => {
                if (e.target === profileImageModal) {
                    profileImageModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }
    
    setupProfileImageModal();
    
    // Setup profile image modal
    setupProfileImageModal();
    
    // Function to show settings page
    function showSettingsPage() {
        const dashboardPage = document.getElementById('dashboardPage');
        const taskListPage = document.getElementById('taskListPage');
        const analyticsPage = document.getElementById('analyticsPage');
        const settingsPage = document.getElementById('settingsPage');
        const calendarPage = document.getElementById('calendarPage');
        
        if (dashboardPage) dashboardPage.style.display = 'none';
        if (taskListPage) taskListPage.style.display = 'none';
        if (analyticsPage) analyticsPage.style.display = 'none';
        if (calendarPage) calendarPage.style.display = 'none';
        if (settingsPage) settingsPage.style.display = 'block';
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const span = item.querySelector('span');
            if (span && span.getAttribute('data-i18n') === 'setting') {
                item.classList.add('active');
            }
        });
    }
    
    // Function to show analytics page
    function showAnalyticsPage() {
        const dashboardPage = document.getElementById('dashboardPage');
        const taskListPage = document.getElementById('taskListPage');
        const analyticsPage = document.getElementById('analyticsPage');
        
        if (dashboardPage) dashboardPage.style.display = 'none';
        if (taskListPage) taskListPage.style.display = 'none';
        if (analyticsPage) analyticsPage.style.display = 'block';
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const span = item.querySelector('span');
            if (span && span.getAttribute('data-i18n') === 'analytics') {
                item.classList.add('active');
            }
        });
    }

    function showTaskListPage() {
        // Hide other pages, show task list page
        const dashboardPage = document.getElementById('dashboardPage');
        const taskListPage = document.getElementById('taskListPage');
        const analyticsPage = document.getElementById('analyticsPage');
        const settingsPage = document.getElementById('settingsPage');
        const calendarPage = document.getElementById('calendarPage');
        
        if (dashboardPage) dashboardPage.style.display = 'none';
        if (analyticsPage) analyticsPage.style.display = 'none';
        if (settingsPage) settingsPage.style.display = 'none';
        if (calendarPage) calendarPage.style.display = 'none';
        if (taskListPage) taskListPage.style.display = 'block';
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const span = item.querySelector('span');
            if (span && span.getAttribute('data-i18n') === 'taskList') {
                item.classList.add('active');
            } else if (span && span.getAttribute('data-i18n') === 'dashboard') {
                item.classList.remove('active');
            }
        });
        
        const tasks = appState.getStateProperty('tasks') || [];
        // Show tasks that are completed OR have status 'complete' OR have status 'tasklist'
        const completedTasks = tasks.filter(t => t.completed || t.status === 'complete' || t.status === 'tasklist');
        const activeTasks = tasks.filter(t => !t.completed);
        
        const currentLang = languageManager.getCurrentLanguage();
        const tasksList = document.getElementById('taskListContainer');
        const tasksCount = document.getElementById('taskListCount');
        
        if (!tasksList) return;
        
        // Update count (completed tasks)
        if (tasksCount) {
            tasksCount.textContent = completedTasks.length;
        }
        
        tasksList.innerHTML = '';
        
        // Render completed tasks section only
        const completedSection = document.createElement('div');
        completedSection.className = 'tasks-section completed-section';
        completedSection.innerHTML = `
            <h4 class="tasks-section-title">${currentLang === 'en' ? 'Completed Tasks' : 'Дууссан Даалгаврууд'} (${completedTasks.length})</h4>
        `;
        const completedContainer = document.createElement('div');
        completedContainer.className = 'tasks-section-content';
        
        if (completedTasks.length > 0) {
            completedTasks.forEach(task => {
                const taskItem = createTaskCardElement(task, currentLang);
                completedContainer.appendChild(taskItem);
            });
        } else {
            // Empty state for completed tasks
            const emptyCompletedDiv = document.createElement('div');
            emptyCompletedDiv.className = 'empty-tasks';
            emptyCompletedDiv.style.minHeight = '150px';
            emptyCompletedDiv.innerHTML = `
                <i class="fas fa-clipboard-check"></i>
                <p>${currentLang === 'en' ? 'No completed tasks yet' : 'Дууссан даалгавар байхгүй'}</p>
            `;
            completedContainer.appendChild(emptyCompletedDiv);
        }
        
        completedSection.appendChild(completedContainer);
        tasksList.appendChild(completedSection);
        
        // Show empty state if no completed tasks
        if (completedTasks.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-tasks';
            emptyDiv.innerHTML = `
                <i class="fas fa-clipboard-check"></i>
                <p>${currentLang === 'en' ? 'No completed tasks yet' : 'Дууссан даалгавар байхгүй'}</p>
            `;
            tasksList.appendChild(emptyDiv);
        }
        
        // Attach event listeners
        attachTaskEventListeners(tasksList);
        
        // Setup drop zone again after rendering
        setupTaskListDropZone();
    }
    
    // Function to render kanban board
    function renderKanbanBoard(tasks = null) {
        const tasksToRender = tasks || appState.getStateProperty('tasks') || [];
        
        // Group tasks by status
        // Exclude tasks with status 'tasklist' from kanban board completely
        // First, filter out tasks with status 'tasklist' - they should only appear in Task List page
        const tasksForKanban = tasksToRender.filter(t => {
            const status = t.status || 'todo';
            return status !== 'tasklist';
        });
        
        const todoTasks = tasksForKanban.filter(t => {
            const status = t.status || 'todo';
            return status === 'todo';
        });
        const inprogressTasks = tasksForKanban.filter(t => {
            const status = t.status || 'todo';
            return status === 'inprogress';
        });
        // COMPLETE багананд зөвхөн status === 'complete' даалгаврууд харагдана
        // status === 'tasklist' даалгаврууд COMPLETE багананд харагдахгүй
        const completeTasks = tasksForKanban.filter(t => {
            const status = t.status || 'todo';
            return status === 'complete';
        });
        
        // Update counts
        const todoCount = document.getElementById('todoCount');
        const inprogressCount = document.getElementById('inprogressCount');
        const completeCount = document.getElementById('completeCount');
        
        if (todoCount) todoCount.textContent = todoTasks.length;
        if (inprogressCount) inprogressCount.textContent = inprogressTasks.length;
        if (completeCount) completeCount.textContent = completeTasks.length;
        
        // Render tasks in each column
        renderKanbanColumn('todoTasks', todoTasks);
        renderKanbanColumn('inprogressTasks', inprogressTasks);
        renderKanbanColumn('completeTasks', completeTasks);
    }
    
    // Function to render tasks in a kanban column
    function renderKanbanColumn(columnId, tasks) {
        const column = document.getElementById(columnId);
        if (!column) return;
        
        column.innerHTML = '';
        
        tasks.forEach(task => {
            const isCompleteColumn = columnId === 'completeTasks';
            const taskCard = createKanbanTaskCard(task, isCompleteColumn);
            column.appendChild(taskCard);
        });
    }
    
    // Function to create a kanban task card
    function createKanbanTaskCard(task, isCompleteColumn = false) {
        const card = document.createElement('div');
        card.className = 'kanban-task-card';
        card.draggable = true;
        card.dataset.taskId = task.id;
        card.dataset.status = task.status || 'todo';
        
        // Add "Дуусгах" button for COMPLETE column tasks
        const completeButton = isCompleteColumn ? `
            <div class="kanban-task-actions">
                <button class="kanban-complete-btn" data-task-id="${task.id}" title="${languageManager.translate('moveToTaskList')}">
                    <i class="fas fa-check-double"></i>
                    ${languageManager.translate('finishTask')}
                </button>
            </div>
        ` : '';
        
        card.innerHTML = `
            <div class="kanban-task-title">${task.title || 'Untitled Task'}</div>
            <div class="kanban-task-icons">
                <i class="fas fa-user"></i>
                <i class="fas fa-calendar"></i>
                <i class="fas fa-flag"></i>
            </div>
            ${completeButton}
        `;
        
        // Add drag event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        
        // Add click event listener for complete button (only for COMPLETE column)
        if (isCompleteColumn) {
            const completeBtn = card.querySelector('.kanban-complete-btn');
            if (completeBtn) {
                completeBtn.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Prevent card drag
                    const taskId = parseInt(completeBtn.dataset.taskId);
                    
                    // Update task status to 'tasklist'
                    await taskService.updateTask(taskId, { status: 'tasklist' });
                    
                    // Reload tasks and re-render kanban board
                    await taskService.loadTasks();
                    const tasks = appState.getStateProperty('tasks') || [];
                    renderKanbanBoard(tasks);
                    setupKanbanDragAndDrop();
                });
            }
        }
        
        return card;
    }
    
    // Drag and drop handlers
    let draggedElement = null;
    
    function handleDragStart(e) {
        draggedElement = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }
    
    function handleDragEnd(e) {
        this.style.opacity = '1';
        // Remove drag-over class from all columns
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }
    
    // Setup drag and drop for kanban columns
    function setupKanbanDragAndDrop() {
        const columns = document.querySelectorAll('.kanban-column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });
            
            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                if (draggedElement) {
                    const taskId = parseInt(draggedElement.dataset.taskId);
                    const newStatus = column.dataset.status;
                    const oldStatus = draggedElement.dataset.status;
                    
                    // Only update if status changed
                    if (newStatus !== oldStatus) {
                        // Update task status
                        await taskService.updateTask(taskId, { status: newStatus });
                        
                        // Reload and re-render kanban board
                        await taskService.loadTasks();
                        const tasks = appState.getStateProperty('tasks') || [];
                        renderKanbanBoard(tasks);
                        setupKanbanDragAndDrop();
                    }
                }
            });
        });
        
        // Setup "Add Task" buttons
        const addTaskButtons = document.querySelectorAll('.kanban-add-btn');
        addTaskButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Open the task creation modal
                const taskModal = document.getElementById('taskModal');
                if (taskModal) {
                    taskModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        
        // Setup drag and drop to Task List page
        setupTaskListDropZone();
    }
    
    // Setup drop zone for Task List page
    function setupTaskListDropZone() {
        const taskListPage = document.getElementById('taskListPage');
        const taskListContainer = document.getElementById('taskListContainer');
        
        if (!taskListPage || !taskListContainer) return;
        
        // Make task list container a drop zone
        taskListContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            taskListContainer.classList.add('drag-over');
        });
        
        taskListContainer.addEventListener('dragleave', () => {
            taskListContainer.classList.remove('drag-over');
        });
        
        taskListContainer.addEventListener('drop', async (e) => {
            e.preventDefault();
            taskListContainer.classList.remove('drag-over');
            
            if (draggedElement) {
                const taskId = parseInt(draggedElement.dataset.taskId);
                const taskStatus = draggedElement.dataset.status;
                
                // Only allow dropping completed tasks or tasks from COMPLETE column
                if (taskStatus === 'complete') {
                    // Update task status to 'tasklist' so it doesn't appear in COMPLETE column
                    await taskService.updateTask(taskId, { status: 'tasklist' });
                    
                    // Reload tasks first
                    await taskService.loadTasks();
                    
                    // Also update kanban board to remove task from COMPLETE column immediately
                    const tasks = appState.getStateProperty('tasks') || [];
                    renderKanbanBoard(tasks);
                    setupKanbanDragAndDrop();
                    
                    // Switch to Task List page
                    appState.setCurrentPage('taskList');
                    showTaskListPage();
                }
            }
        });
    }
    
    // Function to show dashboard page
    function showDashboardPage() {
        const dashboardPage = document.getElementById('dashboardPage');
        const taskListPage = document.getElementById('taskListPage');
        const analyticsPage = document.getElementById('analyticsPage');
        const settingsPage = document.getElementById('settingsPage');
        const calendarPage = document.getElementById('calendarPage');
        
        if (taskListPage) taskListPage.style.display = 'none';
        if (analyticsPage) analyticsPage.style.display = 'none';
        if (settingsPage) settingsPage.style.display = 'none';
        if (calendarPage) calendarPage.style.display = 'none';
        if (dashboardPage) dashboardPage.style.display = 'block';
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const span = item.querySelector('span');
            if (span && span.getAttribute('data-i18n') === 'dashboard') {
                item.classList.add('active');
            }
        });
        
        // Render kanban board instead of old task list
        const tasks = appState.getStateProperty('tasks') || [];
        renderKanbanBoard(tasks);
        setupKanbanDragAndDrop();
    }
    
    // Function to open task modal (for empty state button)
    function openTaskModal() {
        const taskModal = document.getElementById('taskModal');
        if (taskModal) {
            taskModal.classList.add('active');
        }
    }
    
    // Make it global
    window.openTaskModal = openTaskModal;

    // Initialize search
    setupSearch();
    
    // Initialize task list navigation
    setupTaskListNavigation();
    
    // Load initial tasks on page load
    async function initializeTasks() {
        try {
            await taskService.loadTasks();
            await taskService.loadProjects();
            const initialTasks = appState.getStateProperty('tasks');
            
            // Ensure all tasks have a status field (migrate old tasks)
            if (initialTasks && Array.isArray(initialTasks)) {
                let needsUpdate = false;
                initialTasks.forEach(task => {
                    if (!task.status) {
                        // Set default status based on completed state
                        if (task.completed) {
                            task.status = 'complete';
                        } else {
                            task.status = 'todo';
                        }
                        needsUpdate = true;
                    }
                });
                
                // Update tasks if needed
                if (needsUpdate) {
                    for (const task of initialTasks) {
                        await taskService.updateTask(task.id, { status: task.status });
                    }
                    await taskService.loadTasks();
                }
                
                const currentPage = appState.getStateProperty('currentPage') || 'dashboard';
                if (currentPage === 'dashboard') {
                    renderKanbanBoard(initialTasks);
                    setupKanbanDragAndDrop();
                } else {
                    renderTasks(initialTasks);
                }
                updateTaskProgress(initialTasks);
            } else {
                const currentPage = appState.getStateProperty('currentPage') || 'dashboard';
                if (currentPage === 'dashboard') {
                    renderKanbanBoard([]);
                    setupKanbanDragAndDrop();
                } else {
                    renderTasks([]);
                }
                updateTaskProgress([]);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            const currentPage = appState.getStateProperty('currentPage') || 'dashboard';
            if (currentPage === 'dashboard') {
                renderKanbanBoard([]);
                setupKanbanDragAndDrop();
            } else {
                renderTasks([]);
            }
            updateTaskProgress([]);
        }
    }
    
    // Initialize tasks immediately
    initializeTasks();
    
    // Setup kanban drag and drop after initial load
    setTimeout(() => {
        setupKanbanDragAndDrop();
    }, 500);
    
    // Activity Chart Interactive Functionality
    function setupActivityChart() {
        const chartBars = document.querySelectorAll('.chart-bar[data-day]');
        const modal = document.getElementById('activityValueModal');
        const modalTitle = document.getElementById('activityModalTitle');
        const valueButtons = document.querySelectorAll('.activity-value-btn');
        const closeBtn = document.getElementById('activityValueClose');
        let selectedBar = null;
        
        // Day names for display
        const dayNames = {
            'mon': 'Mon',
            'tue': 'Tue',
            'wed': 'Wed',
            'thu': 'Thu',
            'fri': 'Fri',
            'sat': 'Sat',
            'sun': 'Sun'
        };
        
        chartBars.forEach(bar => {
            bar.addEventListener('click', function(e) {
                e.stopPropagation();
                const day = this.getAttribute('data-day');
                selectedBar = this;
                
                // Show modal
                if (modal && modalTitle) {
                    const currentLang = languageManager.getCurrentLanguage();
                    const dayName = dayNames[day] || day.toUpperCase();
                    modalTitle.textContent = languageManager.translate('evaluateYourself');
                    
                    // Position modal near the clicked bar
                    const barRect = this.getBoundingClientRect();
                    const chartRect = this.closest('.activity-chart').getBoundingClientRect();
                    modal.style.left = `${barRect.left - chartRect.left + barRect.width / 2}px`;
                    modal.style.top = `${barRect.top - chartRect.top - 80}px`;
                    modal.style.display = 'block';
                }
            });
        });
        
        // Handle value selection
        valueButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                
                if (selectedBar && value >= 1 && value <= 5) {
                    // Calculate height percentage (1 = 20%, 2 = 40%, 3 = 60%, 4 = 80%, 5 = 100%)
                    const heightPercent = (value / 5) * 100;
                    
                    // Hide modal
                    if (modal) {
                        modal.style.display = 'none';
                    }
                    
                    // Animate bar going up
                    animateBarUp(selectedBar, heightPercent, () => {
                        // After 8 seconds, animate bar going down
                        setTimeout(() => {
                            animateBarDown(selectedBar, 0);
                        }, 8000);
                    });
                }
            });
        });
        
        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Close modal when clicking outside
        document.addEventListener('click', function(e) {
            if (modal && !modal.contains(e.target) && !e.target.closest('.chart-bar[data-day]')) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Animate bar going up
    function animateBarUp(barElement, targetHeight, callback) {
        const startHeight = parseFloat(barElement.style.height) || 0;
        const duration = 2000; // 2 seconds for 5 readings
        const startTime = performance.now();
        
        // Remove existing tooltip
        const existingTooltip = barElement.querySelector('.bar-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Add tooltip
        const tooltip = document.createElement('span');
        tooltip.className = 'bar-tooltip';
        const value = Math.round((targetHeight / 100) * 5);
        tooltip.textContent = `${value} ${value === 1 ? 'Task' : 'Tasks'}`;
        barElement.appendChild(tooltip);
        
        // Add active class
        barElement.classList.add('active');
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const currentHeight = startHeight + (targetHeight - startHeight) * easeOut;
            barElement.style.height = `${currentHeight}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final value
                barElement.style.height = `${targetHeight}%`;
                if (callback) callback();
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Animate bar going down
    function animateBarDown(barElement, targetHeight) {
        const startHeight = parseFloat(barElement.style.height) || 0;
        const duration = 1000; // 1 second to go down
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-in)
            const easeIn = Math.pow(progress, 2);
            
            const currentHeight = startHeight - (startHeight - targetHeight) * easeIn;
            barElement.style.height = `${currentHeight}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final value
                barElement.style.height = `${targetHeight}%`;
                // Remove active class and tooltip
                barElement.classList.remove('active');
                const tooltip = barElement.querySelector('.bar-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Initialize activity chart after DOM is ready
    setupActivityChart();
    
    // Handle form submission
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Get form values
            const titleInput = document.getElementById('taskTitle');
            const descriptionInput = document.getElementById('taskDescription');
            const dueDateInput = document.getElementById('dueDate');
            const priorityInput = document.getElementById('priority');
            const categoryInput = document.getElementById('category');
            
            if (!titleInput || !dueDateInput || !priorityInput || !categoryInput) {
                console.error('Form inputs not found');
                const currentLang = appState.getStateProperty('currentLanguage');
                alert(currentLang === 'en' ? 'Form error: Please refresh the page' : 'Форм алдаа: Хуудасыг дахин ачааллана уу');
                return;
            }
            
            const taskData = {
                title: titleInput.value.trim(),
                description: descriptionInput ? descriptionInput.value.trim() : '',
                dueDate: dueDateInput.value,
                priority: priorityInput.value,
                category: categoryInput.value,
                status: 'todo' // New tasks go to TO DO column
            };
            
            // Validate required fields
            if (!taskData.title || !taskData.dueDate) {
                const currentLang = appState.getStateProperty('currentLanguage');
                alert(currentLang === 'en' ? 'Please fill in all required fields' : 'Бүх шаардлагатай талбаруудыг бөглөнө үү');
                return;
            }
            
            try {
                // Create task using service
                const response = await taskService.createTask(taskData);
                
                if (response && response.success) {
                    // Show success message
                    const currentLang = appState.getStateProperty('currentLanguage');
                    alert(currentLang === 'en' ? 'Task created successfully!' : 'Даалгавар амжилттай үүслээ!');
                    
                    // Reset form
                    taskForm.reset();
                    
                    // Close modal
                    closeTaskModal();
                    
                    // Reload tasks to ensure UI is updated
                    await taskService.loadTasks();
                    
                    // Force re-render kanban board
                    const currentTasks = appState.getStateProperty('tasks');
                    if (currentTasks && Array.isArray(currentTasks)) {
                        renderKanbanBoard(currentTasks);
                        setupKanbanDragAndDrop();
                    }
                } else {
                    const currentLang = appState.getStateProperty('currentLanguage');
                    alert(response?.message || (currentLang === 'en' ? 'Failed to create task' : 'Даалгавар үүсгэхэд алдаа гарлаа'));
                }
            } catch (error) {
                console.error('Error creating task:', error);
                const currentLang = appState.getStateProperty('currentLanguage');
                alert(currentLang === 'en' ? 'Error creating task: ' + error.message : 'Даалгавар үүсгэхэд алдаа: ' + error.message);
            }
        });
    } else {
        console.error('Task form not found!');
    }
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear session storage
            sessionStorage.removeItem('loggedInUser');
            
            // Redirect to login page
            window.location.href = 'task4/index.html';
        });
    }
    
});


