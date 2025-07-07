<template>
  <div :class="['task-calendar', { compact }]">
    <div class="calendar-header">
      <h2>カレンダー</h2>
      <div class="calendar-controls">
        <button @click="previousPeriod" class="btn btn-nav">‹</button>
        <div class="period-selector">
          <select v-model="viewMode" @change="updateCalendar" class="view-select">
            <option value="month">月表示</option>
            <option value="week">週表示</option>
            <option value="day">日表示</option>
          </select>
          <span class="current-period">{{ currentPeriodText }}</span>
        </div>
        <button @click="nextPeriod" class="btn btn-nav">›</button>
        <button @click="goToToday" class="btn btn-today">今日</button>
      </div>
    </div>

    <div class="calendar-view">
      <!-- 月表示 -->
      <MonthView 
        v-if="viewMode === 'month'"
        :current-date="currentDate"
        :tasks="tasks"
        @date-click="onDateClick"
        @task-click="onTaskClick"
      />
      
      <!-- 週表示 -->
      <WeekView 
        v-else-if="viewMode === 'week'"
        :current-date="currentDate"
        :tasks="tasks"
        @date-click="onDateClick"
        @task-click="onTaskClick"
      />
      
      <!-- 日表示 -->
      <DayView 
        v-else-if="viewMode === 'day'"
        :current-date="currentDate"
        :tasks="tasks"
        @task-click="onTaskClick"
      />
    </div>
  </div>
</template>

<script>
import MonthView from './calendar/MonthView.vue'
import WeekView from './calendar/WeekView.vue'
import DayView from './calendar/DayView.vue'

export default {
  name: 'TaskCalendar',
  components: {
    MonthView,
    WeekView,
    DayView
  },
  props: {
    tasks: {
      type: Array,
      required: true
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  emits: ['task-click', 'date-click'],
  data() {
    return {
      viewMode: 'month',
      currentDate: new Date()
    }
  },
  computed: {
    currentPeriodText() {
      const date = this.currentDate
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      
      if (this.viewMode === 'month') {
        return `${year}年${month}月`
      } else if (this.viewMode === 'week') {
        const weekStart = this.getWeekStart(date)
        const weekEnd = this.getWeekEnd(date)
        return `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`
      } else {
        return `${year}年${month}月${day}日`
      }
    }
  },
  methods: {
    previousPeriod() {
      const date = new Date(this.currentDate)
      
      if (this.viewMode === 'month') {
        date.setMonth(date.getMonth() - 1)
      } else if (this.viewMode === 'week') {
        date.setDate(date.getDate() - 7)
      } else {
        date.setDate(date.getDate() - 1)
      }
      
      this.currentDate = date
    },
    
    nextPeriod() {
      const date = new Date(this.currentDate)
      
      if (this.viewMode === 'month') {
        date.setMonth(date.getMonth() + 1)
      } else if (this.viewMode === 'week') {
        date.setDate(date.getDate() + 7)
      } else {
        date.setDate(date.getDate() + 1)
      }
      
      this.currentDate = date
    },
    
    goToToday() {
      this.currentDate = new Date()
    },
    
    updateCalendar() {
      // ビューモード変更時の処理
      this.$forceUpdate()
    },
    
    getWeekStart(date) {
      const start = new Date(date)
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      return start
    },
    
    getWeekEnd(date) {
      const end = this.getWeekStart(date)
      end.setDate(end.getDate() + 6)
      return end
    },
    
    onDateClick(date) {
      this.$emit('date-click', date)
    },
    
    onTaskClick(task) {
      this.$emit('task-click', task)
    }
  }
}
</script>

<style scoped>
.task-calendar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.task-calendar.compact {
  padding: 1rem;
  background: transparent;
  box-shadow: none;
  height: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.task-calendar.compact .calendar-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}

.calendar-header h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 300;
}

.task-calendar.compact .calendar-header h2 {
  font-size: 1.2rem;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.period-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.current-period {
  font-weight: 500;
  color: #2c3e50;
  min-width: 200px;
  text-align: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-nav {
  background: #ecf0f1;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: bold;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-nav:hover {
  background: #d5dbdb;
}

.btn-today {
  background: #3498db;
  color: white;
}

.btn-today:hover {
  background: #2980b9;
}

.calendar-view {
  flex: 1;
  overflow: hidden;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .calendar-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .current-period {
    min-width: auto;
  }
}
</style>