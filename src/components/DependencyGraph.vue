<template>
  <div class="dependency-graph">
    <svg 
      ref="svg"
      :width="svgWidth"
      :height="svgHeight"
      class="graph-svg"
    >
      <!-- 依存関係の線 -->
      <line
        v-for="edge in edges"
        :key="edge.id"
        :x1="edge.x1"
        :y1="edge.y1"
        :x2="edge.x2"
        :y2="edge.y2"
        class="dependency-line"
      />
      
      <!-- 矢印 -->
      <polygon
        v-for="edge in edges"
        :key="'arrow-' + edge.id"
        :points="getArrowPoints(edge)"
        class="arrow-head"
      />
      
      <!-- タスクノード -->
      <g
        v-for="node in nodes"
        :key="node.id"
        :transform="`translate(${node.x}, ${node.y})`"
      >
        <rect
          :width="nodeWidth"
          :height="nodeHeight"
          :class="['task-node', 'status-' + node.status]"
          rx="6"
        />
        <text
          :x="nodeWidth / 2"
          :y="nodeHeight / 2"
          class="task-text"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ truncateText(node.title, 12) }}
        </text>
      </g>
    </svg>
    
    <div class="graph-legend">
      <div class="legend-item">
        <div class="legend-color status-pending"></div>
        <span>未完了</span>
      </div>
      <div class="legend-item">
        <div class="legend-color status-in_progress"></div>
        <span>進行中</span>
      </div>
      <div class="legend-item">
        <div class="legend-color status-completed"></div>
        <span>完了</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DependencyGraph',
  props: {
    tasks: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      svgWidth: 800,
      svgHeight: 400,
      nodeWidth: 120,
      nodeHeight: 40,
      nodes: [],
      edges: []
    }
  },
  mounted() {
    this.generateGraph()
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.$el)
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
  watch: {
    tasks: {
      handler() {
        this.generateGraph()
      },
      deep: true
    }
  },
  methods: {
    generateGraph() {
      // 依存関係があるタスクのみを対象
      const tasksWithDependencies = this.tasks.filter(task => 
        task.dependencies.length > 0 || 
        this.tasks.some(t => t.dependencies.includes(task.id))
      )
      
      if (tasksWithDependencies.length === 0) {
        this.nodes = []
        this.edges = []
        return
      }
      
      // ノードの位置を計算
      this.calculateNodePositions(tasksWithDependencies)
      
      // エッジを計算
      this.calculateEdges(tasksWithDependencies)
    },
    
    calculateNodePositions(tasks) {
      const levels = this.calculateLevels(tasks)
      const maxLevel = Math.max(...Object.values(levels))
      
      // 各レベルのタスク数を数える
      const levelCounts = {}
      Object.values(levels).forEach(level => {
        levelCounts[level] = (levelCounts[level] || 0) + 1
      })
      
      // 各レベルでのインデックスを追跡
      const levelIndices = {}
      
      this.nodes = tasks.map(task => {
        const level = levels[task.id]
        const levelIndex = levelIndices[level] || 0
        levelIndices[level] = levelIndex + 1
        
        const x = (this.svgWidth / (maxLevel + 1)) * (level + 0.5) - (this.nodeWidth / 2)
        const y = (this.svgHeight / (levelCounts[level] + 1)) * (levelIndex + 1) - (this.nodeHeight / 2)
        
        return {
          id: task.id,
          title: task.title,
          status: task.status,
          x: Math.max(0, Math.min(x, this.svgWidth - this.nodeWidth)),
          y: Math.max(0, Math.min(y, this.svgHeight - this.nodeHeight))
        }
      })
    },
    
    calculateLevels(tasks) {
      const levels = {}
      const visited = new Set()
      
      // 依存関係のないタスクからレベル0で開始
      const queue = tasks.filter(task => task.dependencies.length === 0)
      queue.forEach(task => {
        levels[task.id] = 0
        visited.add(task.id)
      })
      
      // 幅優先探索でレベルを計算
      while (queue.length > 0) {
        const current = queue.shift()
        const currentLevel = levels[current.id]
        
        // このタスクに依存するタスクを探す
        const dependents = tasks.filter(task => 
          task.dependencies.includes(current.id) && !visited.has(task.id)
        )
        
        dependents.forEach(dependent => {
          // 依存するタスクの最大レベル + 1
          const maxDependencyLevel = Math.max(
            ...dependent.dependencies.map(depId => levels[depId] || 0)
          )
          levels[dependent.id] = maxDependencyLevel + 1
          visited.add(dependent.id)
          queue.push(dependent)
        })
      }
      
      return levels
    },
    
    calculateEdges(tasks) {
      this.edges = []
      
      tasks.forEach(task => {
        task.dependencies.forEach(depId => {
          const fromNode = this.nodes.find(n => n.id === depId)
          const toNode = this.nodes.find(n => n.id === task.id)
          
          if (fromNode && toNode) {
            this.edges.push({
              id: `${depId}-${task.id}`,
              x1: fromNode.x + this.nodeWidth,
              y1: fromNode.y + this.nodeHeight / 2,
              x2: toNode.x,
              y2: toNode.y + this.nodeHeight / 2
            })
          }
        })
      })
    },
    
    getArrowPoints(edge) {
      const arrowSize = 6
      const angle = Math.atan2(edge.y2 - edge.y1, edge.x2 - edge.x1)
      
      const x1 = edge.x2 - arrowSize * Math.cos(angle - Math.PI / 6)
      const y1 = edge.y2 - arrowSize * Math.sin(angle - Math.PI / 6)
      
      const x2 = edge.x2 - arrowSize * Math.cos(angle + Math.PI / 6)
      const y2 = edge.y2 - arrowSize * Math.sin(angle + Math.PI / 6)
      
      return `${edge.x2},${edge.y2} ${x1},${y1} ${x2},${y2}`
    },
    
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    
    handleResize() {
      const rect = this.$el.getBoundingClientRect()
      this.svgWidth = Math.max(400, rect.width - 20)
      this.generateGraph()
    }
  }
}
</script>

<style scoped>
.dependency-graph {
  width: 100%;
  position: relative;
}

.graph-svg {
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
}

.dependency-line {
  stroke: #666;
  stroke-width: 2;
  fill: none;
}

.arrow-head {
  fill: #666;
}

.task-node {
  stroke: #333;
  stroke-width: 1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.task-node:hover {
  stroke-width: 2;
  filter: brightness(1.1);
}

.status-pending {
  fill: #f39c12;
}

.status-in_progress {
  fill: #3498db;
}

.status-completed {
  fill: #27ae60;
}

.task-text {
  fill: white;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
}

.graph-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid #333;
}

.legend-color.status-pending {
  background: #f39c12;
}

.legend-color.status-in_progress {
  background: #3498db;
}

.legend-color.status-completed {
  background: #27ae60;
}

@media (max-width: 768px) {
  .graph-legend {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>