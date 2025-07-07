<template>
  <div class="task-node" :class="{ 'completed': task.status === 'completed' }">
    <div class="task-content" :style="{ marginLeft: (level * 20) + 'px' }">
      <div class="task-main">
        <div class="task-controls">
          <button 
            v-if="task.children && task.children.length > 0"
            @click="toggleExpanded"
            class="expand-btn"
          >
            {{ isExpanded ? '▼' : '▶' }}
          </button>
          <span v-else class="expand-placeholder"></span>
          
          <input 
            type="checkbox"
            :checked="task.status === 'completed'"
            @change="$emit('toggle-complete', task.id)"
            class="task-checkbox"
          />
        </div>
        
        <div class="task-info">
          <h3 class="task-title">{{ task.title }}</h3>
          <p v-if="task.description" class="task-description">{{ task.description }}</p>
          
          <div class="task-meta">
            <span class="task-priority" :class="'priority-' + task.priority">
              {{ priorityLabels[task.priority] }}
            </span>
            <span v-if="task.dueDate" class="task-due-date">
              期限: {{ formatDate(task.dueDate) }}
            </span>
            <span v-if="task.dependencies && task.dependencies.length > 0" class="task-dependencies">
              依存: {{ task.dependencies.length }}個
            </span>
          </div>
        </div>
        
        <div class="task-actions">
          <button 
            v-if="level < 2"
            @click="$emit('add-child', task)"
            class="btn btn-add-child"
            :title="'子タスクを追加'"
          >
            +
          </button>
          <button @click="$emit('edit', task)" class="btn btn-edit">
            編集
          </button>
          <button @click="$emit('delete', task.id)" class="btn btn-delete">
            削除
          </button>
        </div>
      </div>
      
      <div v-if="task.dependencies && task.dependencies.length > 0" class="dependencies-info">
        <span class="dependencies-label">前提条件:</span>
        <div class="dependencies-list">
          <span 
            v-for="depId in task.dependencies" 
            :key="depId"
            class="dependency-item"
          >
            {{ getDependencyTitle(depId) }}
          </span>
        </div>
      </div>
    </div>
    
    <div 
      v-if="task.children && task.children.length > 0 && isExpanded"
      class="task-children"
    >
      <TaskNode
        v-for="child in task.children"
        :key="child.id"
        :task="child"
        :level="level + 1"
        :all-tasks="allTasks"
        @toggle-complete="$emit('toggle-complete', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script>
import { taskManager } from '../services/taskManager.js'

export default {
  name: 'TaskNode',
  props: {
    task: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    allTasks: {
      type: Array,
      default: () => []
    }
  },
  emits: ['toggle-complete', 'edit', 'delete', 'add-child'],
  data() {
    return {
      isExpanded: true,
      priorityLabels: {
        high: '高',
        medium: '中',
        low: '低'
      }
    }
  },
  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      })
    },
    getDependencyTitle(dependencyId) {
      const dep = taskManager.getTaskById(dependencyId)
      return dep ? dep.title : '不明なタスク'
    }
  }
}
</script>

<style scoped>
.task-node {
  border-left: 2px solid #ecf0f1;
  transition: all 0.3s ease;
}

.task-node.completed {
  opacity: 0.6;
}

.task-content {
  padding: 0.5rem 0;
}

.task-main {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.task-main:hover {
  background: #e9ecef;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.expand-btn:hover {
  color: #333;
}

.expand-placeholder {
  width: 20px;
  height: 20px;
}

.task-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #2c3e50;
}

.task-node.completed .task-title {
  text-decoration: line-through;
  color: #7f8c8d;
}

.task-description {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.task-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.task-priority {
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
}

.priority-high {
  background: #e74c3c;
  color: white;
}

.priority-medium {
  background: #f39c12;
  color: white;
}

.priority-low {
  background: #95a5a6;
  color: white;
}

.task-due-date,
.task-dependencies {
  font-size: 0.7rem;
  color: #666;
  background: #ecf0f1;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.3s ease;
}

.btn-add-child {
  background: #27ae60;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.btn-add-child:hover {
  background: #219a52;
}

.btn-edit {
  background: #3498db;
  color: white;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

.dependencies-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fff3cd;
  border-radius: 4px;
  border-left: 3px solid #ffc107;
}

.dependencies-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #856404;
  margin-bottom: 0.25rem;
  display: block;
}

.dependencies-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.dependency-item {
  background: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.task-children {
  margin-left: 1rem;
  border-left: 2px solid #dee2e6;
}

/* レベル別のスタイル */
.task-node[data-level="0"] {
  border-left-color: #3498db;
}

.task-node[data-level="1"] {
  border-left-color: #e74c3c;
}

.task-node[data-level="2"] {
  border-left-color: #f39c12;
}
</style>