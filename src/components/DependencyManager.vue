<template>
  <div class="dependency-manager">
    <h3>依存関係管理</h3>
    
    <div class="dependency-controls">
      <div class="form-group">
        <label>タスク選択</label>
        <select v-model="selectedTaskId" class="form-select">
          <option value="">タスクを選択...</option>
          <option 
            v-for="task in availableTasks" 
            :key="task.id" 
            :value="task.id"
          >
            {{ task.title }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>依存するタスク</label>
        <select v-model="dependencyTaskId" class="form-select">
          <option value="">依存タスクを選択...</option>
          <option 
            v-for="task in getDependencyOptions(selectedTaskId)" 
            :key="task.id" 
            :value="task.id"
          >
            {{ task.title }}
          </option>
        </select>
      </div>
      
      <button 
        @click="addDependency"
        :disabled="!selectedTaskId || !dependencyTaskId"
        class="btn btn-primary"
      >
        依存関係を追加
      </button>
    </div>
    
    <div v-if="selectedTaskId" class="dependency-info">
      <h4>{{ getTaskTitle(selectedTaskId) }} の依存関係</h4>
      
      <div class="current-dependencies">
        <h5>前提条件 (このタスクが依存しているタスク)</h5>
        <div v-if="getCurrentDependencies(selectedTaskId).length === 0" class="empty-deps">
          前提条件なし
        </div>
        <div v-else class="dep-list">
          <div 
            v-for="dep in getCurrentDependencies(selectedTaskId)"
            :key="dep.id"
            class="dep-item"
          >
            <span class="dep-title">{{ dep.title }}</span>
            <span class="dep-status" :class="'status-' + dep.status">
              {{ statusLabels[dep.status] }}
            </span>
            <button 
              @click="removeDependency(selectedTaskId, dep.id)"
              class="btn btn-remove"
            >
              削除
            </button>
          </div>
        </div>
      </div>
      
      <div class="dependent-tasks">
        <h5>依存タスク (このタスクに依存しているタスク)</h5>
        <div v-if="getDependentTasks(selectedTaskId).length === 0" class="empty-deps">
          依存タスクなし
        </div>
        <div v-else class="dep-list">
          <div 
            v-for="dep in getDependentTasks(selectedTaskId)"
            :key="dep.id"
            class="dep-item"
          >
            <span class="dep-title">{{ dep.title }}</span>
            <span class="dep-status" :class="'status-' + dep.status">
              {{ statusLabels[dep.status] }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="dependency-graph">
      <h4>依存関係グラフ</h4>
      <div class="graph-container">
        <DependencyGraph :tasks="tasks" />
      </div>
    </div>
  </div>
</template>

<script>
import { taskManager } from '../services/taskManager.js'
import DependencyGraph from './DependencyGraph.vue'

export default {
  name: 'DependencyManager',
  components: {
    DependencyGraph
  },
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedTaskId: '',
      dependencyTaskId: '',
      statusLabels: {
        pending: '未完了',
        in_progress: '進行中',
        completed: '完了'
      }
    }
  },
  computed: {
    availableTasks() {
      return this.tasks.filter(task => task.level === 0) // 親タスクのみ
    }
  },
  methods: {
    getDependencyOptions(taskId) {
      if (!taskId) return []
      
      return this.tasks.filter(task => {
        if (task.id === taskId) return false
        if (task.dependencies.includes(taskId)) return false
        return !this.wouldCreateCircularDependency(taskId, task.id)
      })
    },
    wouldCreateCircularDependency(fromId, toId) {
      const visited = new Set()
      const stack = [toId]
      
      while (stack.length > 0) {
        const currentId = stack.pop()
        if (currentId === fromId) return true
        
        if (visited.has(currentId)) continue
        visited.add(currentId)
        
        const currentTask = this.tasks.find(t => t.id === currentId)
        if (currentTask) {
          stack.push(...currentTask.dependencies)
        }
      }
      
      return false
    },
    addDependency() {
      if (!this.selectedTaskId || !this.dependencyTaskId) return
      
      const success = taskManager.addDependency(this.selectedTaskId, this.dependencyTaskId)
      if (success) {
        this.$emit('dependency-updated')
        this.dependencyTaskId = ''
      } else {
        alert('依存関係の追加に失敗しました（循環依存の可能性があります）')
      }
    },
    removeDependency(taskId, dependencyId) {
      const task = taskManager.getTaskById(taskId)
      if (task) {
        task.removeDependency(dependencyId)
        
        const dependentTask = taskManager.getTaskById(dependencyId)
        if (dependentTask) {
          dependentTask.dependents = dependentTask.dependents.filter(id => id !== taskId)
        }
        
        taskManager.saveTasks()
        this.$emit('dependency-updated')
      }
    },
    getCurrentDependencies(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return []
      
      return task.dependencies.map(depId => 
        this.tasks.find(t => t.id === depId)
      ).filter(Boolean)
    },
    getDependentTasks(taskId) {
      return this.tasks.filter(task => 
        task.dependencies.includes(taskId)
      )
    },
    getTaskTitle(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      return task ? task.title : ''
    }
  }
}
</script>

<style scoped>
.dependency-manager {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dependency-manager h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.dependency-controls {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-select:focus {
  outline: none;
  border-color: #3498db;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.dependency-info {
  margin-bottom: 2rem;
}

.dependency-info h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.current-dependencies,
.dependent-tasks {
  margin-bottom: 1.5rem;
}

.current-dependencies h5,
.dependent-tasks h5 {
  margin-bottom: 0.5rem;
  color: #34495e;
  font-size: 0.9rem;
}

.empty-deps {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
}

.dep-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dep-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #3498db;
}

.dep-title {
  flex: 1;
  font-weight: 500;
}

.dep-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-pending {
  background: #f39c12;
  color: white;
}

.status-in_progress {
  background: #3498db;
  color: white;
}

.status-completed {
  background: #27ae60;
  color: white;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}

.btn-remove:hover {
  background: #c0392b;
}

.dependency-graph h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.graph-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  min-height: 200px;
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .dependency-controls {
    grid-template-columns: 1fr;
  }
  
  .dep-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>