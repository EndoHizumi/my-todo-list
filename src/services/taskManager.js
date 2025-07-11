/**
 * タスク管理サービス
 */

import { Task, TaskStatus } from '../types/task.js'
import { localStorageService } from './localStorage.js'

export class TaskManager {
  constructor() {
    this.tasks = new Map()
    this.loadTasks()
  }

  // タスクの読み込み
  loadTasks() {
    const tasksData = localStorageService.getTasks()
    this.tasks.clear()
    tasksData.forEach(taskData => {
      const task = new Task(taskData)
      this.tasks.set(task.id, task)
    })
  }

  // タスクの保存
  saveTasks() {
    const tasksArray = Array.from(this.tasks.values()).map(task => task.toJSON())
    return localStorageService.saveTasks(tasksArray)
  }

  // 全タスクの取得
  getAllTasks() {
    return Array.from(this.tasks.values())
  }

  // IDでタスクを取得
  getTaskById(id) {
    return this.tasks.get(id)
  }

  // タスクの作成
  createTask(taskData) {
    const task = new Task(taskData)
    
    // 親タスクが存在する場合、親に子として追加
    if (task.parentId) {
      const parent = this.tasks.get(task.parentId)
      if (parent) {
        parent.addChild(task.id)
        task.level = parent.level + 1
      }
    }
    
    this.tasks.set(task.id, task)
    this.saveTasks()
    return task
  }

  // タスクの更新
  updateTask(id, updateData) {
    const task = this.tasks.get(id)
    if (!task) return false

    task.update(updateData)
    this.saveTasks()
    return task
  }

  // タスクの削除
  deleteTask(id) {
    const task = this.tasks.get(id)
    if (!task) return false

    // 子タスクも削除
    this.deleteTaskAndChildren(id)
    
    // 親タスクから削除
    if (task.parentId) {
      const parent = this.tasks.get(task.parentId)
      if (parent) {
        parent.removeChild(id)
      }
    }

    // 依存関係の削除
    this.removeDependencies(id)
    
    this.saveTasks()
    return true
  }

  // タスクとその子タスクを再帰的に削除
  deleteTaskAndChildren(id) {
    const task = this.tasks.get(id)
    if (!task) return

    // 子タスクを再帰的に削除
    task.childIds.forEach(childId => {
      this.deleteTaskAndChildren(childId)
    })

    this.tasks.delete(id)
  }

  // 依存関係の削除
  removeDependencies(taskId) {
    this.tasks.forEach(task => {
      task.dependencies = task.dependencies.filter(id => id !== taskId)
      task.dependents = task.dependents.filter(id => id !== taskId)
    })
  }

  // タスクの完了状態を切り替え
  toggleTaskComplete(id) {
    const task = this.tasks.get(id)
    if (!task) return false

    task.toggleComplete()
    
    // 子タスクがすべて完了している場合、親タスクも完了にする
    if (task.status === TaskStatus.COMPLETED) {
      this.checkAndUpdateParentCompletion(task.parentId)
    }
    
    this.saveTasks()
    return task
  }

  // 親タスクの完了状態をチェック・更新
  checkAndUpdateParentCompletion(parentId) {
    if (!parentId) return

    const parent = this.tasks.get(parentId)
    if (!parent) return

    // 全ての子タスクが完了しているかチェック
    const allChildrenCompleted = parent.childIds.every(childId => {
      const child = this.tasks.get(childId)
      return child && child.status === TaskStatus.COMPLETED
    })

    if (allChildrenCompleted && parent.childIds.length > 0) {
      parent.status = TaskStatus.COMPLETED
      parent.completedAt = new Date().toISOString()
      parent.updatedAt = new Date().toISOString()
      
      // 親の親もチェック
      this.checkAndUpdateParentCompletion(parent.parentId)
    }
  }

  // 親タスクの取得
  getParentTasks() {
    return this.getAllTasks().filter(task => task.level === 0)
  }

  // 子タスクの取得
  getChildTasks(parentId) {
    return this.getAllTasks().filter(task => task.parentId === parentId)
  }

  // 階層構造でタスクを取得
  getTasksHierarchy() {
    const hierarchy = []
    const parentTasks = this.getParentTasks()
    
    parentTasks.forEach(parent => {
      hierarchy.push({
        ...parent.toJSON(),
        children: this.buildChildrenHierarchy(parent.id)
      })
    })
    
    return hierarchy
  }

  // 子タスクの階層構造を構築
  buildChildrenHierarchy(parentId) {
    const children = this.getChildTasks(parentId)
    return children.map(child => ({
      ...child.toJSON(),
      children: this.buildChildrenHierarchy(child.id)
    }))
  }

  // 依存関係の追加
  addDependency(taskId, dependsOnId) {
    const task = this.tasks.get(taskId)
    const dependsOnTask = this.tasks.get(dependsOnId)
    
    if (!task || !dependsOnTask) return false
    
    // 循環依存のチェック
    if (this.wouldCreateCircularDependency(taskId, dependsOnId)) {
      return false
    }
    
    task.addDependency(dependsOnId)
    dependsOnTask.dependents.push(taskId)
    
    this.saveTasks()
    return true
  }

  // 循環依存のチェック
  wouldCreateCircularDependency(taskId, dependsOnId) {
    const visited = new Set()
    const stack = [dependsOnId]
    
    while (stack.length > 0) {
      const currentId = stack.pop()
      if (currentId === taskId) return true
      
      if (visited.has(currentId)) continue
      visited.add(currentId)
      
      const currentTask = this.tasks.get(currentId)
      if (currentTask) {
        stack.push(...currentTask.dependencies)
      }
    }
    
    return false
  }

  // 実行可能なタスクの取得（依存関係を考慮）
  getExecutableTasks() {
    return this.getAllTasks().filter(task => {
      if (task.status === TaskStatus.COMPLETED) return false
      
      // 依存関係の全てが完了しているかチェック
      return task.dependencies.every(depId => {
        const depTask = this.tasks.get(depId)
        return depTask && depTask.status === TaskStatus.COMPLETED
      })
    })
  }

  // 期限切れタスクの取得
  getOverdueTasks() {
    const now = new Date()
    return this.getAllTasks().filter(task => {
      if (task.status === TaskStatus.COMPLETED) return false
      if (!task.dueDate) return false
      
      return new Date(task.dueDate) < now
    })
  }

  // 今日のタスクの取得
  getTodayTasks() {
    const today = new Date()
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return this.getAllTasks().filter(task => {
      if (!task.scheduledDate) return false
      return task.scheduledDate.split('T')[0] === todayString
    })
  }

  // タスクの検索
  searchTasks(query) {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllTasks().filter(task => {
      return task.title.toLowerCase().includes(lowercaseQuery) ||
             task.description.toLowerCase().includes(lowercaseQuery) ||
             task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    })
  }

  // 統計情報の取得
  getStatistics() {
    const allTasks = this.getAllTasks()
    const completedTasks = allTasks.filter(task => task.status === TaskStatus.COMPLETED)
    const pendingTasks = allTasks.filter(task => task.status === TaskStatus.PENDING)
    const inProgressTasks = allTasks.filter(task => task.status === TaskStatus.IN_PROGRESS)
    
    return {
      total: allTasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      inProgress: inProgressTasks.length,
      overdue: this.getOverdueTasks().length,
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0
    }
  }
}

// シングルトンインスタンス
export const taskManager = new TaskManager()