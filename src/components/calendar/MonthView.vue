<template>
  <div class="month-view">
    <div class="weekdays">
      <div 
        v-for="day in weekdays"
        :key="day"
        class="weekday"
      >
        {{ day }}
      </div>
    </div>
    
    <div class="calendar-grid">
      <div
        v-for="day in calendarDays"
        :key="day.id"
        :class="[
          'calendar-day',
          {
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-tasks': day.tasks.length > 0
          }
        ]"
        @click="$emit('date-click', day.date)"
      >
        <div class="day-number">{{ day.date.getDate() }}</div>
        
        <div class="day-tasks">
          <div
            v-for="task in day.tasks.slice(0, 3)"
            :key="task.id"
            :class="[
              'task-item',
              'priority-' + task.priority,
              'status-' + task.status
            ]"
            @click.stop="$emit('task-click', task)"
          >
            {{ task.title }}
          </div>
          
          <div 
            v-if="day.tasks.length > 3"
            class="more-tasks"
          >
            +{{ day.tasks.length - 3 }}個
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonthView',
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
      weekdays: ['日', '月', '火', '水', '木', '金', '土']
    }
  },
  computed: {
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const today = new Date()
      
      // 月の最初の日と最後の日
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // カレンダーの最初の日（前月の日も含む）
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      // カレンダーの最後の日（次月の日も含む）
      const endDate = new Date(lastDay)
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
      
      const days = []
      const current = new Date(startDate)
      
      while (current <= endDate) {
        const dayTasks = this.getTasksForDate(current)
        
        days.push({
          id: current.getTime(),
          date: new Date(current),
          isCurrentMonth: current.getMonth() === month,
          isToday: this.isSameDay(current, today),
          tasks: dayTasks
        })
        
        current.setDate(current.getDate() + 1)
      }
      
      return days
    }
  },
  methods: {
    getTasksForDate(date) {
      const dateString = this.formatDateString(date)
      
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
    
    formatDateString(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear()
    }
  }
}
</script>

<style scoped>
.month-view {
  width: 100%;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1px;
}

.weekday {
  background: #2c3e50;
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #ecf0f1;
}

.calendar-day {
  background: white;
  min-height: 120px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.other-month {
  background: #f5f6fa;
  color: #95a5a6;
}

.calendar-day.today {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}

.calendar-day.has-tasks {
  border-left: 4px solid #3498db;
}

.day-number {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.calendar-day.other-month .day-number {
  color: #95a5a6;
}

.calendar-day.today .day-number {
  color: #2196f3;
  font-weight: bold;
}

.day-tasks {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-item {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.task-item:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.priority-high {
  background: #ffebee;
  border-left-color: #e74c3c;
  color: #c62828;
}

.priority-medium {
  background: #fff3e0;
  border-left-color: #f39c12;
  color: #ef6c00;
}

.priority-low {
  background: #f3e5f5;
  border-left-color: #9b59b6;
  color: #7b1fa2;
}

.status-completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.more-tasks {
  font-size: 0.7rem;
  color: #666;
  font-style: italic;
  padding: 0.25rem;
  text-align: center;
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }
  
  .day-number {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  
  .task-item {
    font-size: 0.7rem;
    padding: 0.125rem 0.25rem;
  }
}
</style>