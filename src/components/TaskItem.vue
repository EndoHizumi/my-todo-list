<template>
  <div class="task-item" :class="{ completed: task.status === 'completed' }">
    <div class="task-main">
      <input 
        type="checkbox"
        :checked="task.status === 'completed'"
        @change="$emit('toggle-complete', task.id)"
        class="task-checkbox"
      />
      
      <div class="task-content">
        <h3 class="task-title">{{ task.title }}</h3>
        <p v-if="task.description" class="task-description">{{ task.description }}</p>
        
        <div class="task-meta">
          <span class="task-priority" :class="'priority-' + task.priority">
            {{ priorityLabels[task.priority] }}
          </span>
          <span v-if="task.dueDate" class="task-due-date">
            期限: {{ formatDate(task.dueDate) }}
          </span>
          <span v-if="task.scheduledDate" class="task-scheduled-date">
            予定: {{ formatDate(task.scheduledDate) }}
          </span>
        </div>
      </div>
      
      <div class="task-actions">
        <button @click="$emit('edit', task)" class="btn btn-edit">
          編集
        </button>
        <button @click="$emit('delete', task.id)" class="btn btn-delete">
          削除
        </button>
      </div>
    </div>
    
    <div v-if="task.childIds && task.childIds.length > 0" class="task-children">
      <div class="children-indicator">
        子タスク: {{ task.childIds.length }}個
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskItem',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['toggle-complete', 'edit', 'delete'],
  data() {
    return {
      priorityLabels: {
        high: '高',
        medium: '中',
        low: '低'
      }
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.task-item {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.task-item.completed {
  opacity: 0.6;
  background: #f8f9fa;
}

.task-main {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.task-checkbox {
  margin-top: 0.25rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #7f8c8d;
}

.task-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.task-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
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
.task-scheduled-date {
  font-size: 0.8rem;
  color: #666;
  background: #ecf0f1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
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

.task-children {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.children-indicator {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}
</style>