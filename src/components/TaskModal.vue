<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ getModalTitle() }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="saveTask" class="task-form">
        <div class="form-group">
          <label>タイトル *</label>
          <input 
            v-model="taskData.title"
            type="text"
            required
            class="form-input"
            placeholder="タスクのタイトルを入力"
          />
        </div>

        <div class="form-group">
          <label>説明</label>
          <textarea 
            v-model="taskData.description"
            class="form-textarea"
            placeholder="タスクの詳細説明"
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>優先度</label>
            <select v-model="taskData.priority" class="form-select">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div class="form-group">
            <label>ステータス</label>
            <select v-model="taskData.status" class="form-select">
              <option value="pending">未完了</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>期限</label>
            <input 
              v-model="taskData.dueDate"
              type="date"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>予定日</label>
            <input 
              v-model="taskData.scheduledDate"
              type="date"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label>カテゴリ</label>
          <input 
            v-model="taskData.category"
            type="text"
            class="form-input"
            placeholder="カテゴリ名"
          />
        </div>

        <div class="form-group">
          <label>タグ</label>
          <input 
            v-model="tagsInput"
            type="text"
            class="form-input"
            placeholder="タグをカンマ区切りで入力"
          />
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            キャンセル
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? '更新' : '追加' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskModal',
  props: {
    task: {
      type: Object,
      default: null
    },
    parentTask: {
      type: Object,
      default: null
    }
  },
  emits: ['save', 'cancel'],
  data() {
    return {
      taskData: {
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        scheduledDate: '',
        category: 'default',
        tags: []
      },
      tagsInput: ''
    }
  },
  computed: {
    isEditing() {
      return this.task !== null
    },
    isChildTask() {
      return this.parentTask !== null
    }
  },
  watch: {
    task: {
      handler(newTask) {
        if (newTask) {
          this.taskData = { ...newTask }
          this.tagsInput = newTask.tags ? newTask.tags.join(', ') : ''
        } else {
          this.resetForm()
        }
      },
      immediate: true
    }
  },
  methods: {
    resetForm() {
      this.taskData = {
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        scheduledDate: '',
        category: 'default',
        tags: []
      }
      this.tagsInput = ''
    },
    saveTask() {
      // タグの処理
      this.taskData.tags = this.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)

      this.$emit('save', this.taskData)
    },
    closeModal() {
      this.$emit('cancel')
    },
    getModalTitle() {
      if (this.isEditing) {
        return 'タスクを編集'
      } else if (this.isChildTask) {
        const levelName = this.parentTask.level === 0 ? '子' : '孫'
        return `${levelName}タスクを追加 (親: ${this.parentTask.title})`
      } else {
        return 'タスクを追加'
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.task-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3498db;
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>