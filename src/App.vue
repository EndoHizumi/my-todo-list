<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <h1>Vue.js Todo Application</h1>
        <button @click="toggleSidebar" class="sidebar-toggle">
          ☰
        </button>
      </div>
    </header>
    
    <!-- 統計情報バー -->
    <div class="stats-bar">
      <TaskStats :stats="stats" horizontal />
    </div>
    
    <main class="main">
      <!-- サイドメニュー -->
      <aside :class="['sidebar-menu', { 'sidebar-open': sidebarOpen }]">
        <div class="sidebar-header">
          <h3>機能メニュー</h3>
          <button @click="closeSidebar" class="close-btn">×</button>
        </div>
        
        <nav class="sidebar-nav">
          <button 
            @click="openModal('dependencies')"
            class="sidebar-item"
          >
            🔗 依存関係管理
          </button>
          <button 
            @click="openModal('search')"
            class="sidebar-item"
          >
            🔍 検索機能
          </button>
          <button 
            @click="openModal('import-export')"
            class="sidebar-item"
          >
            💾 データ管理
          </button>
        </nav>
        
        <div class="sidebar-filters">
          <h4>フィルター</h4>
          <TaskFilters 
            :filters="filters"
            @update-filters="updateFilters"
            compact
          />
        </div>
      </aside>
      
      <!-- メインコンテンツ -->
      <div class="main-content">
        <div class="todo-section">
          <TaskList 
            :tasks="filteredTasks"
            @toggle-complete="toggleComplete"
            @edit-task="editTask"
            @delete-task="deleteTask"
            @add-task="showAddTask = true"
            @add-child="addChildTask"
            show-hierarchy
          />
        </div>
        
        <div class="calendar-section">
          <TaskCalendar 
            :tasks="tasks"
            @task-click="editTask"
            @date-click="onDateClick"
            compact
          />
        </div>
      </div>
    </main>
    
    <!-- モーダル -->
    <TaskModal 
      v-if="showAddTask || editingTask"
      :task="editingTask"
      :parent-task="parentTaskForChild"
      @save="saveTask"
      @cancel="cancelEdit"
    />
    
    <!-- 機能モーダル -->
    <div v-if="activeModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <DependencyManager 
          v-if="activeModal === 'dependencies'"
          :tasks="tasks"
          @dependency-updated="loadTasks"
        />
        
        <SearchView 
          v-else-if="activeModal === 'search'"
          :tasks="tasks"
          @edit-task="editTask"
          @delete-task="deleteTask"
          @toggle-complete="toggleComplete"
        />
        
        <ImportExport 
          v-else-if="activeModal === 'import-export'"
          :tasks="tasks"
          @data-updated="loadTasks"
        />
        
        <button @click="closeModal" class="modal-close-btn">×</button>
      </div>
    </div>
    
    <!-- サイドバーオーバーレイ -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay" 
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script>
import { taskManager } from './services/taskManager.js'
import TaskStats from './components/TaskStats.vue'
import TaskFilters from './components/TaskFilters.vue'
import TaskList from './components/TaskList.vue'
import TaskHierarchy from './components/TaskHierarchy.vue'
import DependencyManager from './components/DependencyManager.vue'
import TaskCalendar from './components/TaskCalendar.vue'
import SearchView from './components/SearchView.vue'
import ImportExport from './components/ImportExport.vue'
import TaskModal from './components/TaskModal.vue'

export default {
  name: 'App',
  components: {
    TaskStats,
    TaskFilters,
    TaskList,
    TaskHierarchy,
    DependencyManager,
    TaskCalendar,
    SearchView,
    ImportExport,
    TaskModal
  },
  data() {
    return {
      tasks: [],
      showAddTask: false,
      editingTask: null,
      parentTaskForChild: null,
      sidebarOpen: false,
      activeModal: null,
      filters: {
        status: 'all',
        priority: 'all',
        search: ''
      }
    }
  },
  computed: {
    filteredTasks() {
      let filtered = this.tasks
      
      if (this.filters.status !== 'all') {
        filtered = filtered.filter(task => task.status === this.filters.status)
      }
      
      if (this.filters.priority !== 'all') {
        filtered = filtered.filter(task => task.priority === this.filters.priority)
      }
      
      if (this.filters.search) {
        filtered = taskManager.searchTasks(this.filters.search)
      }
      
      return filtered
    },
    stats() {
      return taskManager.getStatistics()
    },
    hierarchyTasks() {
      return taskManager.getTasksHierarchy()
    }
  },
  mounted() {
    this.loadTasks()
  },
  methods: {
    loadTasks() {
      this.tasks = taskManager.getAllTasks()
    },
    toggleComplete(taskId) {
      taskManager.toggleTaskComplete(taskId)
      this.loadTasks()
    },
    editTask(task) {
      this.editingTask = task
    },
    deleteTask(taskId) {
      if (confirm('このタスクを削除しますか？')) {
        taskManager.deleteTask(taskId)
        this.loadTasks()
      }
    },
    saveTask(taskData) {
      if (this.editingTask) {
        taskManager.updateTask(this.editingTask.id, taskData)
      } else {
        // 子タスクとして追加する場合
        if (this.parentTaskForChild) {
          taskData.parentId = this.parentTaskForChild.id
          taskData.level = this.parentTaskForChild.level + 1
        }
        taskManager.createTask(taskData)
      }
      this.loadTasks()
      this.cancelEdit()
    },
    cancelEdit() {
      this.showAddTask = false
      this.editingTask = null
      this.parentTaskForChild = null
    },
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },
    addChildTask(parentTask) {
      this.parentTaskForChild = parentTask
      this.showAddTask = true
    },
    onDateClick(date) {
      // カレンダーで日付がクリックされた時の処理
      // その日にタスクを追加するためのモーダルを開く
      this.showAddTask = true
      // TODO: 選択された日付を初期値として設定
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    openModal(modalType) {
      this.activeModal = modalType
      this.closeSidebar()
    },
    closeModal() {
      this.activeModal = null
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ヘッダー */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header h1 {
  font-size: 2rem;
  font-weight: 300;
}

.sidebar-toggle {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background: rgba(255,255,255,0.2);
}

/* 統計情報バー */
.stats-bar {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

/* メインコンテンツ */
.main {
  flex: 1;
  display: flex;
  position: relative;
}

.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 3fr 7fr;
  gap: 1rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.todo-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.calendar-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

/* サイドメニュー */
.sidebar-menu {
  position: fixed;
  top: 0;
  right: -350px;
  width: 350px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar-menu.sidebar-open {
  right: 0;
}

.sidebar-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  font-size: 1.2rem;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}

.sidebar-nav {
  padding: 1.5rem;
}

.sidebar-item {
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 1rem;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.sidebar-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.sidebar-filters {
  padding: 1.5rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.sidebar-filters h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

/* サイドバーオーバーレイ */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* レスポンシブ */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .calendar-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0;
  }
  
  .header h1 {
    font-size: 1.5rem;
  }
  
  .main-content {
    padding: 0.5rem;
  }
  
  .todo-section,
  .calendar-section {
    padding: 1rem;
    max-height: calc(100vh - 150px);
  }
  
  .sidebar-menu {
    width: 300px;
    right: -300px;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.2rem;
  }
  
  .sidebar-menu {
    width: 280px;
    right: -280px;
  }
  
  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
  }
}
</style>
