<template>
  <div :class="['task-stats', { 'horizontal': horizontal }]">
    <h3 v-if="!horizontal">統計情報</h3>
    <div class="stats-container">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">総タスク数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">完了</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">未完了</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.overdue }}</div>
          <div class="stat-label">期限切れ</div>
        </div>
        <div class="stat-item progress-item">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: stats.completionRate + '%' }"></div>
          </div>
          <div class="completion-rate">
            完了率: {{ Math.round(stats.completionRate) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskStats',
  props: {
    stats: {
      type: Object,
      required: true
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.task-stats {
  margin-bottom: 2rem;
}

.task-stats.horizontal {
  margin-bottom: 0;
}

.task-stats h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.stats-container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.task-stats.horizontal .stats-container {
  width: 100%;
  height: 100%;
  padding: 0 2rem;
  justify-content: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  flex: 1;
}

.task-stats:not(.horizontal) .stats-grid {
  grid-template-columns: 1fr 1fr;
  margin-bottom: 1rem;
}

.task-stats.horizontal .stats-grid {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.progress-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  gap: 0.5rem;
  flex-grow: 1;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.task-stats.horizontal .stat-item {
  padding: 0.25rem 1rem;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: left;
}

.task-stats.horizontal .progress-item {
  padding: 0.25rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0,0,0,0.15);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.task-stats.horizontal .stat-value {
  font-size: 1.2rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
  font-weight: 500;
}

.task-stats.horizontal .stat-label {
  margin-top: 0;
  font-size: 0.7rem;
}


.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(236, 240, 241, 0.8);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 0.25rem;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-item .progress-bar {
  flex: 1;
  min-width: 80px;
  margin-bottom: 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.6s ease;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.completion-rate {
  text-align: center;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
}

.progress-item .completion-rate {
  font-size: 0.7rem;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .task-stats.horizontal .stats-container {
    padding: 0 1rem;
  }
  
  .task-stats.horizontal .stats-grid {
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .stat-item {
    padding: 0.5rem;
    min-width: auto;
    flex: 1;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .progress-item {
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .task-stats.horizontal .stats-container {
    padding: 0 0.5rem;
  }
  
  .task-stats.horizontal .stats-grid {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-item {
    min-width: auto;
    flex: none;
  }
  
  .progress-item {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 1.3rem;
  }
  
  .progress-item .completion-rate {
    font-size: 0.6rem;
  }
}
</style>