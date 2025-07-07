<template>
  <div class="week-view">
    <div class="week-header">
      <div 
        v-for="day in weekDays"
        :key="day.id"
        :class="[
          'day-header',
          { 'today': day.isToday }
        ]"
        @click="$emit('date-click', day.date)"
      >
        <div class="day-name">{{ day.dayName }}</div>
        <div class="day-date">{{ day.date.getDate() }}</div>
      </div>
    </div>
    
    <div class="week-content">
      <div class="time-column">
        <div 
          v-for="hour in hours"
          :key="hour"
          class="time-slot"
        >
          {{ formatHour(hour) }}
        </div>
      </div>
      
      <div class="days-grid">
        <div 
          v-for="day in weekDays"
          :key="day.id"
          class="day-column"
        >
          <div 
            v-for="hour in hours"
            :key="hour"
            class="hour-slot"
            @click="onHourClick(day.date, hour)"
          >
            <div 
              v-for="task in getTasksForHour(day.date, hour)"
              :key="task.id"
              :class="[
                'task-block',
                'priority-' + task.priority,
                'status-' + task.status
              ]"
              @click.stop="$emit('task-click', task)"
            >
              <div class="task-time">
                {{ formatTaskTime(task) }}
              </div>
              <div class="task-title">{{ task.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeekView',
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
  emits: ['date-click', 'task-click'],
  data() {
    return {
      hours: Array.from({ length: 24 }, (_, i) => i),
      dayNames: ['日', '月', '火', '水', '木', '金', '土']
    }
  },
  computed: {
    weekDays() {
      const weekStart = this.getWeekStart(this.currentDate)
      const today = new Date()
      const days = []
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        
        days.push({
          id: date.getTime(),
          date: new Date(date),
          dayName: this.dayNames[date.getDay()],
          isToday: this.isSameDay(date, today)
        })
      }
      
      return days
    }
  },
  methods: {
    getWeekStart(date) {
      const start = new Date(date)
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      return start
    },
    
    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear()
    },
    
    formatHour(hour) {
      return hour.toString().padStart(2, '0') + ':00'
    },
    
    getTasksForHour(date, hour) {
      const dateString = this.formatDateString(date)
      
      return this.tasks.filter(task => {
        // 予定日で一致するタスク
        if (task.scheduledDate) {
          const taskDate = new Date(task.scheduledDate)
          const taskDateString = this.formatDateString(taskDate)
          const taskHour = taskDate.getHours()
          
          return taskDateString === dateString && taskHour === hour
        }
        
        // 期限で一致するタスク（時間指定がない場合は9時に表示）
        if (task.dueDate && hour === 9) {
          const taskDate = this.formatDateString(new Date(task.dueDate))
          return taskDate === dateString
        }
        
        return false
      })
    },
    
    formatDateString(date) {
      return date.toISOString().split('T')[0]
    },
    
    formatTaskTime(task) {
      if (task.scheduledDate) {
        const date = new Date(task.scheduledDate)
        return date.toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      return '期限'
    },
    
    onHourClick(date, hour) {
      const clickDate = new Date(date)
      clickDate.setHours(hour, 0, 0, 0)
      this.$emit('date-click', clickDate)
    }
  }
}
</script>

<style scoped>
.week-view {
  width: 100%;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1px;
  margin-left: 60px;
}

.day-header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.day-header:hover {
  background: #34495e;
}

.day-header.today {
  background: #3498db;
}

.day-name {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.day-date {
  font-size: 1.2rem;
  font-weight: bold;
}

.week-content {
  flex: 1;
  display: flex;
  overflow-y: auto;
}

.time-column {
  width: 60px;
  background: #f8f9fa;
  border-right: 1px solid #ecf0f1;
}

.time-slot {
  height: 60px;
  padding: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #ecf0f1;
}

.day-column {
  background: white;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #ecf0f1;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hour-slot:hover {
  background: #f8f9fa;
}

.task-block {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  background: white;
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid;
  transition: all 0.3s ease;
  z-index: 1;
}

.task-block:hover {
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

.task-time {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 0.125rem;
}

.task-title {
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .week-header {
    margin-left: 40px;
  }
  
  .time-column {
    width: 40px;
  }
  
  .time-slot {
    height: 40px;
    font-size: 0.7rem;
  }
  
  .hour-slot {
    height: 40px;
  }
  
  .day-header {
    padding: 0.5rem;
  }
  
  .day-name {
    font-size: 0.8rem;
  }
  
  .day-date {
    font-size: 1rem;
  }
  
  .task-title {
    font-size: 0.7rem;
  }
}
</style>