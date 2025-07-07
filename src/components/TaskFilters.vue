<template>
  <div :class="['task-filters', { compact }]">
    <h3 v-if="!compact">フィルター</h3>
    
    <div class="filter-group">
      <label>検索</label>
      <input 
        v-model="localFilters.search"
        @input="updateFilters"
        type="text"
        placeholder="タスクを検索..."
        class="filter-input"
      />
    </div>

    <div class="filter-group">
      <label>ステータス</label>
      <select 
        v-model="localFilters.status"
        @change="updateFilters"
        class="filter-select"
      >
        <option value="all">すべて</option>
        <option value="pending">未完了</option>
        <option value="in_progress">進行中</option>
        <option value="completed">完了</option>
      </select>
    </div>

    <div class="filter-group">
      <label>優先度</label>
      <select 
        v-model="localFilters.priority"
        @change="updateFilters"
        class="filter-select"
      >
        <option value="all">すべて</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
    </div>

    <div class="filter-actions">
      <button @click="clearFilters" class="btn btn-secondary">
        クリア
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskFilters',
  props: {
    filters: {
      type: Object,
      required: true
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-filters'],
  data() {
    return {
      localFilters: { ...this.filters }
    }
  },
  watch: {
    filters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }
      },
      deep: true
    }
  },
  methods: {
    updateFilters() {
      this.$emit('update-filters', this.localFilters)
    },
    clearFilters() {
      this.localFilters = {
        status: 'all',
        priority: 'all',
        search: ''
      }
      this.updateFilters()
    }
  }
}
</script>

<style scoped>
.task-filters h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.task-filters.compact .filter-group {
  margin-bottom: 0.75rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.task-filters.compact .filter-group label {
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.task-filters.compact .filter-input,
.task-filters.compact .filter-select {
  padding: 0.4rem;
  font-size: 0.8rem;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3498db;
}

.filter-actions {
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}
</style>