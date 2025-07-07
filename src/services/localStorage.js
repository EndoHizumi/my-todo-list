/**
 * ローカルストレージ管理サービス
 */

const STORAGE_KEY = 'todo_app_data'

export class LocalStorageService {
  constructor() {
    this.storageKey = STORAGE_KEY
  }

  // データの取得
  getData() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : this.getDefaultData()
    } catch (error) {
      console.error('ローカルストレージからのデータ取得エラー:', error)
      return this.getDefaultData()
    }
  }

  // データの保存
  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('ローカルストレージへのデータ保存エラー:', error)
      return false
    }
  }

  // デフォルトデータの取得
  getDefaultData() {
    return {
      tasks: [],
      settings: {
        theme: 'light',
        language: 'ja',
        defaultPriority: 'medium',
        autoSave: true
      },
      lastUpdated: new Date().toISOString()
    }
  }

  // タスクの取得
  getTasks() {
    const data = this.getData()
    return data.tasks || []
  }

  // タスクの保存
  saveTasks(tasks) {
    const data = this.getData()
    data.tasks = tasks
    data.lastUpdated = new Date().toISOString()
    return this.saveData(data)
  }

  // 単一タスクの追加
  addTask(task) {
    const tasks = this.getTasks()
    tasks.push(task)
    return this.saveTasks(tasks)
  }

  // 単一タスクの更新
  updateTask(taskId, updatedTask) {
    const tasks = this.getTasks()
    const index = tasks.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask }
      return this.saveTasks(tasks)
    }
    return false
  }

  // 単一タスクの削除
  deleteTask(taskId) {
    const tasks = this.getTasks()
    const filteredTasks = tasks.filter(task => task.id !== taskId)
    return this.saveTasks(filteredTasks)
  }

  // 設定の取得
  getSettings() {
    const data = this.getData()
    return data.settings || this.getDefaultData().settings
  }

  // 設定の保存
  saveSettings(settings) {
    const data = this.getData()
    data.settings = { ...data.settings, ...settings }
    data.lastUpdated = new Date().toISOString()
    return this.saveData(data)
  }

  // データのエクスポート
  exportData() {
    const data = this.getData()
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    return JSON.stringify(exportData, null, 2)
  }

  // データのインポート
  importData(jsonString) {
    try {
      const importData = JSON.parse(jsonString)
      
      // データの検証
      if (!this.validateImportData(importData)) {
        throw new Error('無効なデータ形式です')
      }

      // 既存データとマージ
      const currentData = this.getData()
      const mergedData = {
        tasks: importData.tasks || [],
        settings: { ...currentData.settings, ...importData.settings },
        lastUpdated: new Date().toISOString()
      }

      return this.saveData(mergedData)
    } catch (error) {
      console.error('データのインポートエラー:', error)
      return false
    }
  }

  // インポートデータの検証
  validateImportData(data) {
    // 基本的な構造をチェック
    if (!data || typeof data !== 'object') {
      return false
    }

    // タスクデータの検証
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        if (!task.id || !task.title) {
          return false
        }
      }
    }

    return true
  }

  // データの完全削除
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('データの削除エラー:', error)
      return false
    }
  }

  // ストレージ容量の確認
  getStorageInfo() {
    try {
      const data = this.getData()
      const dataSize = JSON.stringify(data).length
      const maxSize = 5 * 1024 * 1024 // 5MB (推定)
      
      return {
        usedSpace: dataSize,
        maxSpace: maxSize,
        usagePercentage: (dataSize / maxSize) * 100,
        taskCount: data.tasks ? data.tasks.length : 0
      }
    } catch (error) {
      console.error('ストレージ情報の取得エラー:', error)
      return null
    }
  }
}

// シングルトンインスタンス
export const localStorageService = new LocalStorageService()