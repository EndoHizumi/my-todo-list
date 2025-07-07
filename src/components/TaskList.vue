<template>
  <div class="task-list">
    <div class="task-list-header">
      <h2>タスク一覧</h2>
      <button 
        v-if="tasks.length > 0"
        @click="$emit('add-task')" 
        class="btn btn-primary add-task-btn"
      >
        + 新しいタスク
      </button>
    </div>
    
    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>まだタスクがありません</h3>
      <p>最初のタスクを追加して始めましょう</p>
      <button @click="$emit('add-task')" class="btn btn-primary empty-add-btn">
        最初のタスクを追加
      </button>
    </div>

    <div v-else class="tasks">
      <div v-if="showHierarchy">
        <!-- 階層表示 -->
        <TaskNode
          v-for="task in hierarchyTasks"
          :key="task.id"
          :task="task"
          :level="0"
          @toggle-complete="$emit('toggle-complete', $event)"
          @edit="$emit('edit-task', $event)"
          @delete="$emit('delete-task', $event)"
          @add-child="$emit('add-child', $event)"
        />
      </div>
      <div v-else>
        <!-- 従来のリスト表示 -->
        <TaskItem
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @toggle-complete="$emit('toggle-complete', $event)"
          @edit="$emit('edit-task', $event)"
          @delete="$emit('delete-task', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TaskItem from './TaskItem.vue'
import TaskNode from './TaskNode.vue'
import { taskManager } from '../services/taskManager.js'

export default {
  name: 'TaskList',
  components: {
    TaskItem,
    TaskNode
  },
  props: {
    tasks: {
      type: Array,
      required: true
    },
    showHierarchy: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hierarchyTasks() {
      return taskManager.getTasksHierarchy()
    }
  },
  emits: ['toggle-complete', 'edit-task', 'delete-task', 'add-task', 'add-child']
}
</script>

<style scoped>
.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.task-list h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0;
}

.add-task-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.add-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 500;
}

.empty-state p {
  margin-bottom: 2rem;
  font-size: 1rem;
}

.empty-add-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.empty-add-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.tasks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .task-list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .add-task-btn {
    width: 100%;
    text-align: center;
  }
}
</style>