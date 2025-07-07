<template>
  <div class="import-export">
    <div class="section-header">
      <h2>データ管理</h2>
      <p>タスクデータのインポート・エクスポートができます</p>
    </div>
    
    <!-- エクスポート機能 -->
    <div class="export-section">
      <h3>エクスポート</h3>
      <p>現在のタスクデータをJSONファイルとしてダウンロードします</p>
      
      <div class="export-options">
        <div class="option-group">
          <label>
            <input 
              type="checkbox" 
              v-model="exportOptions.includeTasks" 
              class="checkbox"
            />
            タスクデータ
          </label>
          <label>
            <input 
              type="checkbox" 
              v-model="exportOptions.includeSettings" 
              class="checkbox"
            />
            設定データ
          </label>
          <label>
            <input 
              type="checkbox" 
              v-model="exportOptions.includeStatistics" 
              class="checkbox"
            />
            統計情報
          </label>
        </div>
        
        <div class="format-options">
          <label>フォーマット:</label>
          <select v-model="exportFormat" class="format-select">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>
      
      <div class="export-actions">
        <button 
          @click="exportData"
          :disabled="!hasExportOptions"
          class="btn btn-primary"
        >
          データをエクスポート
        </button>
        <button @click="previewExport" class="btn btn-secondary">
          プレビュー
        </button>
      </div>
      
      <div v-if="exportPreview" class="export-preview">
        <h4>エクスポートプレビュー</h4>
        <pre>{{ exportPreview }}</pre>
      </div>
    </div>
    
    <!-- インポート機能 -->
    <div class="import-section">
      <h3>インポート</h3>
      <p>JSONファイルからタスクデータをインポートします</p>
      
      <div class="import-options">
        <div class="file-upload">
          <input 
            ref="fileInput"
            type="file"
            accept=".json,.csv"
            @change="handleFileSelect"
            class="file-input"
          />
          <button @click="$refs.fileInput.click()" class="btn btn-upload">
            ファイルを選択
          </button>
          <span v-if="selectedFile" class="file-name">
            {{ selectedFile.name }}
          </span>
        </div>
        
        <div class="import-settings">
          <label>
            <input 
              type="checkbox" 
              v-model="importOptions.mergeWithExisting" 
              class="checkbox"
            />
            既存データとマージ（チェックしない場合は上書き）
          </label>
          <label>
            <input 
              type="checkbox" 
              v-model="importOptions.validateData" 
              class="checkbox"
            />
            データ検証を実行
          </label>
        </div>
      </div>
      
      <div class="import-actions">
        <button 
          @click="importData"
          :disabled="!selectedFile"
          class="btn btn-primary"
        >
          データをインポート
        </button>
        <button 
          @click="previewImport"
          :disabled="!selectedFile"
          class="btn btn-secondary"
        >
          プレビュー
        </button>
      </div>
      
      <div v-if="importPreview" class="import-preview">
        <h4>インポートプレビュー</h4>
        <div class="preview-stats">
          <span>タスク数: {{ importPreview.taskCount }}個</span>
          <span v-if="importPreview.warnings.length > 0" class="warnings">
            警告: {{ importPreview.warnings.length }}件
          </span>
        </div>
        <div v-if="importPreview.warnings.length > 0" class="warning-list">
          <h5>警告一覧:</h5>
          <ul>
            <li v-for="warning in importPreview.warnings" :key="warning">
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- バックアップ機能 -->
    <div class="backup-section">
      <h3>自動バックアップ</h3>
      <p>定期的にデータをバックアップできます</p>
      
      <div class="backup-controls">
        <label>
          <input 
            type="checkbox" 
            v-model="backupSettings.enabled" 
            @change="updateBackupSettings"
            class="checkbox"
          />
          自動バックアップを有効にする
        </label>
        
        <div v-if="backupSettings.enabled" class="backup-options">
          <div class="option-row">
            <label>間隔:</label>
            <select 
              v-model="backupSettings.interval" 
              @change="updateBackupSettings"
              class="interval-select"
            >
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>
          
          <div class="option-row">
            <label>保存先:</label>
            <select 
              v-model="backupSettings.storage" 
              @change="updateBackupSettings"
              class="storage-select"
            >
              <option value="download">ダウンロード</option>
              <option value="localStorage">ローカルストレージ</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="backup-status">
        <span v-if="lastBackupDate">
          最終バックアップ: {{ formatDate(lastBackupDate) }}
        </span>
        <button @click="createManualBackup" class="btn btn-backup">
          今すぐバックアップ
        </button>
      </div>
    </div>
    
    <!-- ストレージ情報 -->
    <div class="storage-info">
      <h3>ストレージ情報</h3>
      <div v-if="storageInfo" class="storage-stats">
        <div class="storage-item">
          <span>使用容量:</span>
          <span>{{ formatBytes(storageInfo.usedSpace) }}</span>
        </div>
        <div class="storage-item">
          <span>タスク数:</span>
          <span>{{ storageInfo.taskCount }}個</span>
        </div>
        <div class="storage-item">
          <span>使用率:</span>
          <span>{{ Math.round(storageInfo.usagePercentage) }}%</span>
        </div>
      </div>
      
      <div class="storage-actions">
        <button @click="clearAllData" class="btn btn-danger">
          全データを削除
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { localStorageService } from '../services/localStorage.js'
import { taskManager } from '../services/taskManager.js'

export default {
  name: 'ImportExport',
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  emits: ['data-updated'],
  data() {
    return {
      exportOptions: {
        includeTasks: true,
        includeSettings: false,
        includeStatistics: false
      },
      exportFormat: 'json',
      exportPreview: null,
      
      selectedFile: null,
      importOptions: {
        mergeWithExisting: true,
        validateData: true
      },
      importPreview: null,
      
      backupSettings: {
        enabled: false,
        interval: 'weekly',
        storage: 'download'
      },
      lastBackupDate: null,
      
      storageInfo: null
    }
  },
  computed: {
    hasExportOptions() {
      return this.exportOptions.includeTasks || 
             this.exportOptions.includeSettings || 
             this.exportOptions.includeStatistics
    }
  },
  mounted() {
    this.loadStorageInfo()
    this.loadBackupSettings()
  },
  methods: {
    // エクスポート機能
    exportData() {
      try {
        const data = this.prepareExportData()
        
        if (this.exportFormat === 'json') {
          this.downloadJSON(data)
        } else if (this.exportFormat === 'csv') {
          this.downloadCSV(data)
        }
      } catch (error) {
        alert('エクスポートに失敗しました: ' + error.message)
      }
    },
    
    prepareExportData() {
      const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      }
      
      if (this.exportOptions.includeTasks) {
        data.tasks = this.tasks
      }
      
      if (this.exportOptions.includeSettings) {
        data.settings = localStorageService.getSettings()
      }
      
      if (this.exportOptions.includeStatistics) {
        data.statistics = taskManager.getStatistics()
      }
      
      return data
    },
    
    downloadJSON(data) {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      this.downloadBlob(blob, 'tasks-export.json')
    },
    
    downloadCSV(data) {
      if (!data.tasks) {
        throw new Error('CSVエクスポートにはタスクデータが必要です')
      }
      
      const headers = ['ID', 'タイトル', '説明', 'ステータス', '優先度', 'レベル', '作成日', '更新日', '期限', '予定日']
      const rows = [headers]
      
      data.tasks.forEach(task => {
        rows.push([
          task.id,
          task.title,
          task.description,
          task.status,
          task.priority,
          task.level,
          task.createdAt,
          task.updatedAt,
          task.dueDate || '',
          task.scheduledDate || ''
        ])
      })
      
      const csvContent = rows.map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      this.downloadBlob(blob, 'tasks-export.csv')
    },
    
    downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    
    previewExport() {
      const data = this.prepareExportData()
      this.exportPreview = JSON.stringify(data, null, 2)
    },
    
    // インポート機能
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0]
      this.importPreview = null
    },
    
    async importData() {
      if (!this.selectedFile) return
      
      try {
        const content = await this.readFileContent(this.selectedFile)
        let data
        
        if (this.selectedFile.name.endsWith('.json')) {
          data = JSON.parse(content)
        } else if (this.selectedFile.name.endsWith('.csv')) {
          data = this.parseCSV(content)
        } else {
          throw new Error('サポートされていないファイル形式です')
        }
        
        if (this.importOptions.validateData) {
          this.validateImportData(data)
        }
        
        const success = localStorageService.importData(JSON.stringify(data))
        if (success) {
          alert('データのインポートが完了しました')
          this.$emit('data-updated')
        } else {
          throw new Error('インポート処理に失敗しました')
        }
      } catch (error) {
        alert('インポートに失敗しました: ' + error.message)
      }
    },
    
    async previewImport() {
      if (!this.selectedFile) return
      
      try {
        const content = await this.readFileContent(this.selectedFile)
        let data
        
        if (this.selectedFile.name.endsWith('.json')) {
          data = JSON.parse(content)
        } else if (this.selectedFile.name.endsWith('.csv')) {
          data = this.parseCSV(content)
        }
        
        const warnings = []
        if (this.importOptions.validateData) {
          warnings.push(...this.validateImportData(data, false))
        }
        
        this.importPreview = {
          taskCount: data.tasks ? data.tasks.length : 0,
          warnings
        }
      } catch (error) {
        alert('プレビューに失敗しました: ' + error.message)
      }
    },
    
    readFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
        reader.readAsText(file)
      })
    },
    
    parseCSV(content) {
      const lines = content.split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
      const tasks = []
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, ''))
          const task = {}
          headers.forEach((header, index) => {
            task[this.mapCSVHeader(header)] = values[index] || ''
          })
          tasks.push(task)
        }
      }
      
      return { tasks }
    },
    
    mapCSVHeader(header) {
      const mapping = {
        'ID': 'id',
        'タイトル': 'title',
        '説明': 'description',
        'ステータス': 'status',
        '優先度': 'priority',
        'レベル': 'level',
        '作成日': 'createdAt',
        '更新日': 'updatedAt',
        '期限': 'dueDate',
        '予定日': 'scheduledDate'
      }
      return mapping[header] || header
    },
    
    validateImportData(data, throwError = true) {
      const warnings = []
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        const error = 'タスクデータが見つかりません'
        if (throwError) throw new Error(error)
        warnings.push(error)
      }
      
      if (data.tasks) {
        data.tasks.forEach((task, index) => {
          if (!task.id || !task.title) {
            const warning = `タスク ${index + 1}: IDまたはタイトルが不正です`
            warnings.push(warning)
          }
        })
      }
      
      return warnings
    },
    
    // バックアップ機能
    updateBackupSettings() {
      localStorage.setItem('backupSettings', JSON.stringify(this.backupSettings))
      // TODO: 実際のバックアップスケジュール設定
    },
    
    loadBackupSettings() {
      const saved = localStorage.getItem('backupSettings')
      if (saved) {
        this.backupSettings = { ...this.backupSettings, ...JSON.parse(saved) }
      }
      
      const lastBackup = localStorage.getItem('lastBackupDate')
      if (lastBackup) {
        this.lastBackupDate = lastBackup
      }
    },
    
    createManualBackup() {
      try {
        const data = this.prepareExportData()
        
        if (this.backupSettings.storage === 'download') {
          this.downloadJSON(data)
        } else {
          const backupKey = `backup_${Date.now()}`
          localStorage.setItem(backupKey, JSON.stringify(data))
        }
        
        this.lastBackupDate = new Date().toISOString()
        localStorage.setItem('lastBackupDate', this.lastBackupDate)
        
        alert('バックアップが完了しました')
      } catch (error) {
        alert('バックアップに失敗しました: ' + error.message)
      }
    },
    
    // ストレージ情報
    loadStorageInfo() {
      this.storageInfo = localStorageService.getStorageInfo()
    },
    
    clearAllData() {
      if (confirm('全てのデータを削除しますか？この操作は元に戻せません。')) {
        if (confirm('本当に削除しますか？')) {
          localStorageService.clearAllData()
          this.$emit('data-updated')
          this.loadStorageInfo()
          alert('全てのデータが削除されました')
        }
      }
    },
    
    // ユーティリティ
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.import-export {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #666;
  font-size: 1rem;
}

.export-section,
.import-section,
.backup-section,
.storage-info {
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
}

.export-section h3,
.import-section h3,
.backup-section h3,
.storage-info h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.export-options,
.import-options {
  margin-bottom: 1.5rem;
}

.option-group {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.format-options {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.checkbox {
  margin-right: 0.5rem;
}

.format-select,
.interval-select,
.storage-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.export-actions,
.import-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-upload {
  background: #27ae60;
  color: white;
}

.btn-upload:hover {
  background: #219a52;
}

.btn-backup {
  background: #f39c12;
  color: white;
}

.btn-backup:hover {
  background: #e67e22;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.file-name {
  color: #666;
  font-style: italic;
}

.import-settings {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.export-preview,
.import-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.export-preview pre {
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.9rem;
}

.preview-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.warnings {
  color: #e74c3c;
  font-weight: 500;
}

.warning-list ul {
  color: #e74c3c;
  margin-left: 1rem;
}

.backup-controls {
  margin-bottom: 1.5rem;
}

.backup-options {
  margin-top: 1rem;
  padding-left: 1.5rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.backup-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.storage-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.storage-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.storage-actions {
  text-align: right;
}

@media (max-width: 768px) {
  .option-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .export-actions,
  .import-actions {
    flex-direction: column;
  }
  
  .file-upload {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .backup-status {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .storage-stats {
    grid-template-columns: 1fr;
  }
}
</style>