# Код Тайлбар - uTask Task Management

## 📁 Файлуудын бүтэц ба үүрэг

### 1. `index.html` - HTML бүтэц (UI-ийн хэлбэр)

**Юу хийж байгаа:**
- Вэбсайтын бүх харагдах хэсгийг тодорхойлдог
- Sidebar (зүүн тал), Main content (гол агуулга), Right sidebar (баруун тал)
- Modal цонхнууд (даалгавар үүсгэх, календарь тэмдэглэл)
- Бүх товч, хэсэг, форм-ууд

**Гол хэсгүүд:**
- **Sidebar**: Logo, "Create task" товч, цэс (Dashboard, Analytics, Task List, Settings, Calendar)
- **Main Content**: 
  - Dashboard (даалгавруудын жагсаалт)
  - Task List (дууссан даалгаврууд)
  - Analytics (статистик)
  - Settings (тохиргоо)
  - Calendar (календарь)
- **Right Sidebar**: Профайл, жижиг календарь

**Хэрхэн ажилладаг:**
- HTML элементүүд байрлана
- JavaScript (`1.js`) эдгээр элементүүдтэй харьцдаг
- `data-i18n` атрибут нь хэл солих системд ашиглагдана

---

### 2. `api.js` - API Layer (Өгөгдөл хадгалах/авах)

**Юу хийж байгаа:**
- Бүх өгөгдөлтэй харьцах функцүүд
- localStorage-д хадгалах/унших
- Даалгавруудыг үүсгэх, засах, устгах, авах

**Гол функцүүд:**

```javascript
getAllTasks()        // Бүх даалгавруудыг авах
getTaskById(id)     // Нэг даалгавар авах
createTask(data)     // Шинэ даалгавар үүсгэх
updateTask(id, data) // Даалгавар засах
deleteTask(id)       // Даалгавар устгах
toggleTaskComplete(id) // Даалгаврыг дуусгах (6 удаа check хийх)
```

**Хадгалах байршил:**
- `localStorage.setItem('tasks', ...)` - даалгаврууд
- IndexedDB эхлүүлсэн боловч одоогоор ашиглахгүй

**Хэрхэн ажилладаг:**
1. `getAllTasks()` → localStorage-аас уншина
2. `createTask()` → localStorage-д хадгална
3. Бүх өгөгдөл JSON форматтай

---

### 3. `taskService.js` - Business Logic Layer (Бизнес логик)

**Юу хийж байгаа:**
- API болон State-ийг холбодог
- Loading state, Error handling хийдэг
- Бизнес логик (жишээ: даалгавар үүсгэхэд state шинэчлэх)

**Гол функцүүд:**

```javascript
loadTasks()          // Даалгавруудыг ачааллах
createTask(data)     // Даалгавар үүсгэх (API + State шинэчлэх)
updateTask(id, data) // Даалгавар засах
deleteTask(id)       // Даалгавар устгах
toggleTaskComplete(id) // Даалгаврыг check хийх
```

**Хэрхэн ажилладаг:**
1. `taskService.createTask()` дуудагдана
2. Loading = true болгоно
3. `api.createTask()` дуудагдана (localStorage-д хадгална)
4. Амжилттай бол `state.addTask()` дуудагдана (state шинэчлэнэ)
5. Loading = false болгоно

**Жишээ:**
```javascript
// 1.js файл дотор:
const response = await taskService.createTask(taskData);
// taskService нь:
// - API-аас дата авах
// - State шинэчлэх
// - Error handling хийх
```

---

### 4. `state.js` - State Management (Өгөгдлийн төвлөрсөн удирдлага)

**Юу хийж байгаа:**
- Бүх аппын state (өгөгдөл) хадгална
- State өөрчлөгдөхөд бүх listener-ууд мэдэгдэл авна
- React-ийн state-тэй төстэй

**Хадгалж байгаа өгөгдлүүд:**
```javascript
{
  tasks: [],              // Бүх даалгаврууд
  projects: [],           // Төслүүд
  currentLanguage: 'en',  // Одоогийн хэл
  currentTheme: 'light',  // Одоогийн theme
  currentPage: 'dashboard', // Одоогийн хуудас
  searchQuery: '',        // Хайлтын query
  isLoading: false,       // Loading төлөв
  error: null             // Алдааны мэдээлэл
}
```

**Гол функцүүд:**
```javascript
setTasks(tasks)      // Даалгавруудыг тохируулах
addTask(task)        // Шинэ даалгавар нэмэх
updateTask(task)     // Даалгавар шинэчлэх
removeTask(id)       // Даалгавар устгах
setLanguage(lang)    // Хэл солих
setTheme(theme)      // Theme солих
subscribe(listener)  // State өөрчлөлт сонсох
```

**Хэрхэн ажилладаг:**
1. State өөрчлөгдөхөд `notifyListeners()` дуудагдана
2. Бүх listener функцүүд дуудагдана
3. UI автоматаар шинэчлэгдэнэ

**Жишээ:**
```javascript
// State-д даалгавар нэмэх
appState.addTask(newTask);
// → notifyListeners() дуудагдана
// → 1.js доторх subscribe функц ажиллана
// → renderTasks() дуудагдана
// → UI шинэчлэгдэнэ
```

---

### 5. `1.js` - Main UI Logic (Гол UI логик)

**Юу хийж байгаа:**
- Бүх UI event-уудыг удирдана
- Даалгавруудыг дэлгэцэнд харуулна
- Хайлт, календарь, theme, хэл солих функцүүд

**Гол функцүүд:**

#### Даалгавар үүсгэх/засах/устгах:
```javascript
// Form submit event
taskForm.addEventListener('submit', async (e) => {
  const taskData = { title, description, dueDate, priority, category };
  await taskService.createTask(taskData);
  renderTasks(); // UI шинэчлэх
});

// Delete button
btn.addEventListener('click', async () => {
  await taskService.deleteTask(taskId);
  renderTasks(); // UI шинэчлэх
});
```

#### Хайлт:
```javascript
function performSearch(query) {
  const tasks = appState.getStateProperty('tasks');
  const filteredTasks = tasks.filter(task => 
    task.title.includes(query) || task.description.includes(query)
  );
  renderSearchResults(filteredTasks);
}
```

#### Календарь:
```javascript
// Календарь render хийх
function renderCalendar() {
  // Өдрүүдийг үүсгэх
  // Тэмдэглэлтэй өдрүүдийг тэмдэглэх
  // Click event нэмэх
}

// Тэмдэглэл нэмэх
function addCalendarNote(date, note) {
  calendarNotes[date].push(note);
  localStorage.setItem('calendarNotes', JSON.stringify(calendarNotes));
}
```

#### Хэл/Theme солих:
```javascript
// Хэл солих
langEn.addEventListener('click', () => {
  languageManager.setLanguage('en');
  appState.setLanguage('en');
  renderTasks(); // Хэл солигдсоны дараа UI шинэчлэх
});

// Theme солих
themeToggle.addEventListener('click', () => {
  themeManager.toggleTheme();
  appState.setTheme(newTheme);
});
```

#### State subscribe (автомат шинэчлэлт):
```javascript
appState.subscribe((state) => {
  // State өөрчлөгдөх бүрт энэ функц дуудагдана
  if (state.tasks) {
    renderTasks(state.tasks); // Даалгавруудыг дахин render хийх
    updateTaskProgress(state.tasks); // Progress шинэчлэх
  }
});
```

**Хэрхэн ажилладаг:**
1. Page load хийгдэхэд `DOMContentLoaded` event ажиллана
2. API, Service, State эхлүүлнэ
3. Event listener-ууд нэмэгдэнэ
4. Даалгавруудыг ачааллана
5. State өөрчлөгдөх бүрт UI автоматаар шинэчлэгдэнэ

---

## 🔄 Даалгавар үүсгэх процесс (Жишээ)

1. **Хэрэглэгч**: "Create Task" товч дараана
2. **1.js**: Modal цонх нээгдэнэ
3. **Хэрэглэгч**: Форм бөглөж "Create" товч дарана
4. **1.js**: `taskService.createTask(taskData)` дуудагдана
5. **taskService.js**: 
   - Loading = true
   - `api.createTask(taskData)` дуудагдана
6. **api.js**: 
   - localStorage-аас одоогийн даалгавруудыг авах
   - Шинэ даалгавар нэмэх
   - localStorage-д хадгалах
7. **taskService.js**: 
   - Амжилттай бол `state.addTask(newTask)` дуудагдана
8. **state.js**: 
   - State-д даалгавар нэмэх
   - `notifyListeners()` дуудагдана
9. **1.js**: 
   - Subscribe функц ажиллана
   - `renderTasks()` дуудагдана
10. **UI**: Шинэ даалгавар харагдана

---

## 📊 Файлуудын хоорондын хамаарал

```
index.html (UI)
    ↓
1.js (Event handlers, UI logic)
    ↓
taskService.js (Business logic)
    ↓
api.js (Data operations)
    ↓
localStorage (Хадгалах)
    ↑
state.js (State management) ← 1.js subscribe хийж байна
```

---

## 🚀 Vercel дээр Deploy хийх

### Одоогийн тохиргоо:
- `vercel.json` файл байна
- Static site deploy хийхэд бэлэн
- API endpoint байхгүй (localStorage ашиглаж байна)

### Deploy хийх алхам:

1. **Vercel CLI ашиглах:**
```bash
npm i -g vercel
vercel
```

2. **GitHub-аас deploy:**
   - GitHub дээр код push хийх
   - Vercel дээр project нээх
   - GitHub repository холбох
   - Автоматаар deploy хийгдэнэ

3. **Vercel Dashboard:**
   - vercel.com дээр бүртгүүлэх
   - "New Project" дарах
   - Repository сонгох
   - Deploy хийх

### Анхаарах зүйлс:
- Бүх өгөгдөл localStorage-д хадгалагдана (хөтөч дээр)
- Хэрэв API endpoint хэрэгтэй бол serverless functions нэмэх хэрэгтэй
- CORS headers аль хэдийн тохируулсан байна

---

## 📝 Дүгнэлт

- **index.html**: UI-ийн бүтэц
- **api.js**: Өгөгдөл хадгалах/авах
- **taskService.js**: Бизнес логик
- **state.js**: Өгөгдлийн төвлөрсөн удирдлага
- **1.js**: UI логик, event handlers

Бүх өгөгдөл localStorage-д хадгалагдаж байна. Vercel дээр static site болгон deploy хийхэд бэлэн.

