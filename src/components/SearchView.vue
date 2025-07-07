<template>
  <div class="search-view">
    <div class="search-header">
      <h2>高度な検索</h2>
    </div>
    
    <div class="search-controls">
      <div class="search-input-group">
        <input 
          v-model="searchQuery"
          @input="performSearch"
          type="text"
          placeholder="タスクを検索..."
          class="search-input"
        />
        <button @click="clearSearch" class="clear-btn">
          クリア
        </button>
      </div>
      
      <div class="advanced-filters">
        <div class="filter-row">
          <div class="filter-group">
            <label>ステータス</label>
            <select v-model="filters.status" @change="performSearch" class="filter-select">
              <option value="">すべて</option>
              <option value="pending">未完了</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>優先度</label>
            <select v-model="filters.priority" @change="performSearch" class="filter-select">
              <option value="">すべて</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>レベル</label>
            <select v-model="filters.level" @change="performSearch" class="filter-select">
              <option value="">すべて</option>
              <option value="0">親タスク</option>
              <option value="1">子タスク</option>
              <option value="2">孫タスク</option>
            </select>
          </div>
        </div>
        
        <div class="filter-row">
          <div class="filter-group">
            <label>期限</label>
            <select v-model="filters.dueDate" @change="performSearch" class="filter-select">
              <option value="">すべて</option>
              <option value="overdue">期限切れ</option>
              <option value="today">今日</option>
              <option value="tomorrow">明日</option>
              <option value="thisWeek">今週</option>
              <option value="nextWeek">来週</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>依存関係</label>
            <select v-model="filters.dependencies" @change="performSearch" class="filter-select">
              <option value="">すべて</option>
              <option value="hasDependencies">依存あり</option>
              <option value="noDependencies">依存なし</option>
              <option value="blocked">ブロック中</option>
              <option value="ready">実行可能</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>カテゴリ</label>
            <select v-model="filters.category" @change="performSearch" class="filter-select">
              <option value="">すべて</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div class="search-results">
      <div class="results-header">
        <h3>検索結果 ({{ searchResults.length }}件)</h3>
        <div class="sort-controls">
          <label>並び順:</label>
          <select v-model="sortBy" @change="sortResults" class="sort-select">
            <option value="createdAt">作成日</option>
            <option value="updatedAt">更新日</option>
            <option value="priority">優先度</option>
            <option value="dueDate">期限</option>
            <option value="title">タイトル</option>
          </select>
          <button @click="toggleSortOrder" class="sort-btn">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>
      
      <div v-if="searchResults.length === 0" class="no-results">
        <p>検索条件に一致するタスクが見つかりませんでした</p>
      </div>
      
      <div v-else class="results-list">
        <SearchResultItem
          v-for="task in sortedResults"
          :key="task.id"
          :task="task"
          :search-query="searchQuery"
          @edit="$emit('edit-task', $event)"
          @delete="$emit('delete-task', $event)"
          @toggle-complete="$emit('toggle-complete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { taskManager } from '../services/taskManager.js'
import SearchResultItem from './SearchResultItem.vue'

export default {
  name: 'SearchView',
  components: {
    SearchResultItem
  },
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  emits: ['edit-task', 'delete-task', 'toggle-complete'],
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      filters: {
        status: '',
        priority: '',
        level: '',
        dueDate: '',
        dependencies: '',
        category: ''
      }
    }
  },
  computed: {
    availableCategories() {
      const categories = [...new Set(this.tasks.map(task => task.category))]
      return categories.filter(cat => cat && cat !== 'default')
    },
    
    sortedResults() {
      const results = [...this.searchResults]
      
      results.sort((a, b) => {
        let valueA = a[this.sortBy]
        let valueB = b[this.sortBy]
        
        // 特別な処理
        if (this.sortBy === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          valueA = priorityOrder[valueA] || 0
          valueB = priorityOrder[valueB] || 0
        }
        
        if (this.sortBy === 'dueDate' || this.sortBy === 'createdAt' || this.sortBy === 'updatedAt') {
          valueA = valueA ? new Date(valueA) : new Date(0)
          valueB = valueB ? new Date(valueB) : new Date(0)
        }
        
        if (this.sortBy === 'title') {
          valueA = (valueA || '').toLowerCase()
          valueB = (valueB || '').toLowerCase()
        }
        
        if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1
        if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
      
      return results
    }
  },
  mounted() {
    this.performSearch()
  },
  methods: {
    performSearch() {
      let results = [...this.tasks]
      
      // テキスト検索
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        results = results.filter(task => {
          return task.title.toLowerCase().includes(query) ||
                 task.description.toLowerCase().includes(query) ||
                 task.tags.some(tag => tag.toLowerCase().includes(query))
        })
      }
      
      // フィルター適用
      results = this.applyFilters(results)
      
      this.searchResults = results
    },
    
    applyFilters(tasks) {
      let filtered = [...tasks]
      
      // ステータスフィルター
      if (this.filters.status) {
        filtered = filtered.filter(task => task.status === this.filters.status)
      }
      
      // 優先度フィルター
      if (this.filters.priority) {
        filtered = filtered.filter(task => task.priority === this.filters.priority)
      }
      
      // レベルフィルター
      if (this.filters.level !== '') {
        filtered = filtered.filter(task => task.level === parseInt(this.filters.level))
      }
      
      // 期限フィルター
      if (this.filters.dueDate) {
        filtered = this.applyDueDateFilter(filtered)
      }
      
      // 依存関係フィルター
      if (this.filters.dependencies) {
        filtered = this.applyDependencyFilter(filtered)
      }
      
      // カテゴリフィルター
      if (this.filters.category) {
        filtered = filtered.filter(task => task.category === this.filters.category)
      }
      
      return filtered
    },
    
    applyDueDateFilter(tasks) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      switch (this.filters.dueDate) {
        case 'overdue':
          return tasks.filter(task => task.dueDate && new Date(task.dueDate) < today)
        case 'today':
          return tasks.filter(task => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate >= today && dueDate < tomorrow
          })
        case 'tomorrow':
          const dayAfterTomorrow = new Date(tomorrow)
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
          return tasks.filter(task => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate >= tomorrow && dueDate < dayAfterTomorrow
          })
        case 'thisWeek':
          const weekEnd = new Date(today)
          weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()))
          return tasks.filter(task => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate >= today && dueDate <= weekEnd
          })
        case 'nextWeek':
          const nextWeekStart = new Date(today)
          nextWeekStart.setDate(nextWeekStart.getDate() + (7 - nextWeekStart.getDay()))
          const nextWeekEnd = new Date(nextWeekStart)
          nextWeekEnd.setDate(nextWeekEnd.getDate() + 6)
          return tasks.filter(task => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate >= nextWeekStart && dueDate <= nextWeekEnd
          })
        default:
          return tasks
      }
    },
    
    applyDependencyFilter(tasks) {
      switch (this.filters.dependencies) {
        case 'hasDependencies':
          return tasks.filter(task => task.dependencies.length > 0)
        case 'noDependencies':
          return tasks.filter(task => task.dependencies.length === 0)
        case 'blocked':
          return tasks.filter(task => {
            return task.dependencies.some(depId => {
              const dep = taskManager.getTaskById(depId)
              return dep && dep.status !== 'completed'
            })
          })
        case 'ready':
          return tasks.filter(task => {
            if (task.status === 'completed') return false
            return task.dependencies.every(depId => {
              const dep = taskManager.getTaskById(depId)
              return dep && dep.status === 'completed'
            })
          })
        default:
          return tasks
      }
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.filters = {
        status: '',
        priority: '',
        level: '',
        dueDate: '',
        dependencies: '',
        category: ''
      }
      this.performSearch()
    },
    
    sortResults() {
      // ソート条件が変更された時の処理
      this.$forceUpdate()
    },
    
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    }
  }
}
</script>

<style scoped>
.search-view {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-header h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 300;
}

.search-controls {
  margin-bottom: 2rem;
}

.search-input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.clear-btn {
  padding: 0.75rem 1.5rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.clear-btn:hover {
  background: #7f8c8d;
}

.advanced-filters {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #ecf0f1;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.results-header h3 {
  color: #2c3e50;
  font-size: 1.2rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-controls label {
  font-size: 0.9rem;
  color: #666;
}

.sort-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.sort-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.sort-btn:hover {
  background: #f8f9fa;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>