<template>
  <div class="search-result-item" :class="{ completed: task.status === 'completed' }">
    <div class="task-main">
      <input 
        type="checkbox"
        :checked="task.status === 'completed'"
        @change="$emit('toggle-complete', task.id)"
        class="task-checkbox"
      />
      
      <div class="task-content">
        <div class="task-header">
          <h3 class="task-title" v-html="highlightSearchQuery(task.title)"></h3>
          <div class="task-badges">
            <span class="level-badge" :class="'level-' + task.level">
              {{ levelLabels[task.level] }}
            </span>
            <span class="priority-badge" :class="'priority-' + task.priority">
              {{ priorityLabels[task.priority] }}
            </span>
            <span class="status-badge" :class="'status-' + task.status">
              {{ statusLabels[task.status] }}
            </span>
          </div>
        </div>
        
        <p v-if="task.description" class="task-description" v-html="highlightSearchQuery(task.description)"></p>
        
        <div class="task-meta">
          <div class="meta-row">
            <span class="meta-item">
              <strong>作成:</strong> {{ formatDate(task.createdAt) }}
            </span>
            <span v-if="task.updatedAt !== task.createdAt" class="meta-item">
              <strong>更新:</strong> {{ formatDate(task.updatedAt) }}
            </span>
            <span v-if="task.dueDate" class="meta-item due-date">
              <strong>期限:</strong> {{ formatDate(task.dueDate) }}
            </span>
            <span v-if="task.scheduledDate" class="meta-item scheduled-date">
              <strong>予定:</strong> {{ formatDate(task.scheduledDate) }}
            </span>
          </div>
          
          <div v-if="task.tags.length > 0" class="task-tags">
            <span 
              v-for="tag in task.tags"
              :key="tag"
              class="tag"
              v-html="highlightSearchQuery(tag)"
            ></span>
          </div>
          
          <div v-if="task.dependencies.length > 0" class="dependencies-info">
            <strong>依存関係:</strong> {{ task.dependencies.length }}個のタスクに依存
          </div>
          
          <div v-if="task.childIds.length > 0" class="children-info">
            <strong>子タスク:</strong> {{ task.childIds.length }}個
          </div>
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
  </div>
</template>

<script>
export default {
  name: 'SearchResultItem',
  props: {
    task: {
      type: Object,
      required: true
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['edit', 'delete', 'toggle-complete'],
  data() {
    return {
      levelLabels: {
        0: '親',
        1: '子',
        2: '孫'
      },
      priorityLabels: {
        high: '高',
        medium: '中',
        low: '低'
      },
      statusLabels: {
        pending: '未完了',
        in_progress: '進行中',
        completed: '完了'
      }
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    highlightSearchQuery(text) {
      if (!this.searchQuery.trim() || !text) return text
      
      const query = this.searchQuery.trim()
      const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },
    
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
  }
}
</script>

<style scoped>
.search-result-item {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.search-result-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #3498db;
}

.search-result-item.completed {
  opacity: 0.7;
  background: #f8f9fa;
}

.task-main {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
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

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.task-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

.search-result-item.completed .task-title {
  text-decoration: line-through;
  color: #7f8c8d;
}

.task-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.level-badge,
.priority-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.level-0 { background: #3498db; color: white; }
.level-1 { background: #e74c3c; color: white; }
.level-2 { background: #f39c12; color: white; }

.priority-high { background: #e74c3c; color: white; }
.priority-medium { background: #f39c12; color: white; }
.priority-low { background: #95a5a6; color: white; }

.status-pending { background: #f39c12; color: white; }
.status-in_progress { background: #3498db; color: white; }
.status-completed { background: #27ae60; color: white; }

.task-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.task-meta {
  font-size: 0.9rem;
  color: #666;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.meta-item {
  white-space: nowrap;
}

.due-date {
  color: #e74c3c;
}

.scheduled-date {
  color: #3498db;
}

.task-tags {
  margin-bottom: 0.5rem;
}

.tag {
  display: inline-block;
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
}

.dependencies-info,
.children-info {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
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

/* ハイライト用のスタイル */
:deep(mark) {
  background: #fff3cd;
  color: #856404;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .task-main {
    flex-direction: column;
  }
  
  .task-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .task-badges {
    justify-content: flex-start;
  }
  
  .meta-row {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .task-actions {
    flex-direction: row;
  }
}
</style>