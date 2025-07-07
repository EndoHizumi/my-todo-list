/**
 * タスクのデータ型定義
 */

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

/**
 * タスクのデータ構造
 */
export class Task {
  constructor(data = {}) {
    this.id = data.id || this.generateId()
    this.title = data.title || ''
    this.description = data.description || ''
    this.status = data.status || TaskStatus.PENDING
    this.priority = data.priority || TaskPriority.MEDIUM
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
    this.dueDate = data.dueDate || null
    this.scheduledDate = data.scheduledDate || null
    this.completedAt = data.completedAt || null
    
    // 階層構造関連
    this.parentId = data.parentId || null
    this.level = data.level || 0 // 0: 親, 1: 子, 2: 孫
    this.childIds = data.childIds || []
    
    // 依存関係
    this.dependencies = data.dependencies || [] // 前提条件となるタスクのID配列
    this.dependents = data.dependents || [] // このタスクに依存するタスクのID配列
    
    // 検索・分類用
    this.tags = data.tags || []
    this.category = data.category || 'default'
  }

  generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // タスクの完了状態を切り替え
  toggleComplete() {
    if (this.status === TaskStatus.COMPLETED) {
      this.status = TaskStatus.PENDING
      this.completedAt = null
    } else {
      this.status = TaskStatus.COMPLETED
      this.completedAt = new Date().toISOString()
    }
    this.updatedAt = new Date().toISOString()
  }

  // タスクの更新
  update(data) {
    Object.assign(this, data)
    this.updatedAt = new Date().toISOString()
  }

  // 子タスクの追加
  addChild(childId) {
    if (!this.childIds.includes(childId)) {
      this.childIds.push(childId)
      this.updatedAt = new Date().toISOString()
    }
  }

  // 子タスクの削除
  removeChild(childId) {
    this.childIds = this.childIds.filter(id => id !== childId)
    this.updatedAt = new Date().toISOString()
  }

  // 依存関係の追加
  addDependency(taskId) {
    if (!this.dependencies.includes(taskId)) {
      this.dependencies.push(taskId)
      this.updatedAt = new Date().toISOString()
    }
  }

  // 依存関係の削除
  removeDependency(taskId) {
    this.dependencies = this.dependencies.filter(id => id !== taskId)
    this.updatedAt = new Date().toISOString()
  }

  // JSON形式に変換
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      dueDate: this.dueDate,
      scheduledDate: this.scheduledDate,
      completedAt: this.completedAt,
      parentId: this.parentId,
      level: this.level,
      childIds: this.childIds,
      dependencies: this.dependencies,
      dependents: this.dependents,
      tags: this.tags,
      category: this.category
    }
  }
}