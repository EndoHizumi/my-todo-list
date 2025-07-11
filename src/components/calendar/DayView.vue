<template>
  <div class="day-view">
    <div class="day-header">
      <h3>{{ formatDate(currentDate) }}</h3>
      <div class="day-stats">
        <span class="stat">{{ dayTasks.length }}個のタスク</span>
        <span class="stat">{{ completedTasks.length }}個完了</span>
      </div>
    </div>
    
    <div class="day-content">
      <div class="time-grid">
        <div 
          v-for="hour in hours"
          :key="hour"
          class="hour-section"
        >
          <div class="hour-label">
            {{ formatHour(hour) }}
          </div>
          
          <div class="hour-content">
            <div 
              v-for="task in getTasksForHour(hour)"
              :key="task.id"
              :class="[
                'task-item',
                'priority-' + task.priority,
                'status-' + task.status
              ]"
              @click="$emit('task-click', task)"
            >
              <div class="task-header">
                <span class="task-time">{{ formatTaskTime(task) }}</span>
                <span class="task-priority">{{ priorityLabels[task.priority] }}</span>
              </div>
              <h4 class="task-title">{{ task.title }}</h4>
              <p v-if="task.description" class="task-description">
                {{ task.description }}
              </p>
              <div class="task-meta">
                <span v-if="task.dueDate" class="due-date">
                  期限: {{ formatDateTime(task.dueDate) }}
                </span>
                <span v-if="task.dependencies && task.dependencies.length > 0" class="dependencies">
                  依存: {{ task.dependencies.length }}個
                </span>
              </div>
            </div>
            
            <div 
              v-if="getTasksForHour(hour).length === 0"
              class="empty-hour"
            >
              <!-- 空の時間帯 -->
            </div>
          </div>
        </div>
      </div>
      
      <div class="unscheduled-tasks" v-if="unscheduledTasks.length > 0">
        <h4>時間未設定のタスク</h4>
        <div 
          v-for="task in unscheduledTasks"
          :key="task.id"
          :class="[
            'task-item',
            'priority-' + task.priority,
            'status-' + task.status
          ]"
          @click="$emit('task-click', task)"
        >
          <div class="task-header">
            <span class="task-priority">{{ priorityLabels[task.priority] }}</span>
          </div>
          <h4 class="task-title">{{ task.title }}</h4>
          <p v-if="task.description" class="task-description">
            {{ task.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DayView',
  props: {
    currentDate: {
      type: Date,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    }
  },
  emits: ['task-click'],
  data() {
    return {
      hours: Array.from({ length: 24 }, (_, i) => i),
      priorityLabels: {
        high: '高',
        medium: '中',
        low: '低'
      }
    }
  },
  computed: {
    dayTasks() {
      const dateString = this.formatDateString(this.currentDate)
      
      return this.tasks.filter(task => {
        if (task.scheduledDate) {
          const taskDate = this.formatDateString(new Date(task.scheduledDate))
          return taskDate === dateString
        }
        if (task.dueDate) {
          const taskDate = this.formatDateString(new Date(task.dueDate))
          return taskDate === dateString
        }
        return false
      })
    },
    
    completedTasks() {
      return this.dayTasks.filter(task => task.status === 'completed')
    },
    
    unscheduledTasks() {
      return this.dayTasks.filter(task => !task.scheduledDate)
    }
  },
  methods: {
    formatDate(date) {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    },
    
    formatHour(hour) {
      return hour.toString().padStart(2, '0') + ':00'
    },
    
    formatDateString(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    formatDateTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatTaskTime(task) {
      if (task.scheduledDate) {
        const date = new Date(task.scheduledDate)
        return date.toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      return '終日'
    },
    
    getTasksForHour(hour) {
      return this.dayTasks.filter(task => {
        if (task.scheduledDate) {
          const taskDate = new Date(task.scheduledDate)
          return taskDate.getHours() === hour
        }
        return false
      })
    }
  }
}
</script>

<style scoped>
.day-view {
  width: 100%;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.day-header {
  background: #2c3e50;
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-header h3 {
  font-size: 1.5rem;
  font-weight: 300;
}

.day-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  font-size: 0.9rem;
  opacity: 0.9;
}

.day-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  overflow-y: auto;
  padding: 1rem;
}

.time-grid {
  background: white;
  border-radius: 8px;
  overflow-y: auto;
}

.hour-section {
  display: grid;
  grid-template-columns: 80px 1fr;
  border-bottom: 1px solid #ecf0f1;
  min-height: 60px;
}

.hour-label {
  background: #f8f9fa;
  padding: 1rem;
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ecf0f1;
}

.hour-content {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-hour {
  min-height: 40px;
}

.task-item {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.priority-high {
  border-left-color: #e74c3c;
  background: #ffebee;
}

.priority-medium {
  border-left-color: #f39c12;
  background: #fff3e0;
}

.priority-low {
  border-left-color: #9b59b6;
  background: #f3e5f5;
}

.status-completed {
  opacity: 0.6;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.task-time {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.task-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: rgba(0,0,0,0.1);
  color: #333;
}

.task-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.status-completed .task-title {
  text-decoration: line-through;
  color: #7f8c8d;
}

.task-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
}

.due-date,
.dependencies {
  background: rgba(0,0,0,0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.unscheduled-tasks {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
}

.unscheduled-tasks h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
}

.unscheduled-tasks .task-item {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .day-content {
    grid-template-columns: 1fr;
  }
  
  .day-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .day-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .hour-section {
    grid-template-columns: 60px 1fr;
  }
  
  .hour-label {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}
</style>