<template>
  <div class="task-hierarchy">
    <h2>階層表示</h2>
    
    <div v-if="hierarchyTasks.length === 0" class="empty-state">
      <p>タスクがありません</p>
    </div>

    <div v-else class="hierarchy-tree">
      <TaskNode
        v-for="task in hierarchyTasks"
        :key="task.id"
        :task="task"
        :level="0"
        @toggle-complete="$emit('toggle-complete', $event)"
        @edit="$emit('edit-task', $event)"
        @delete="$emit('delete-task', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script>
import TaskNode from './TaskNode.vue'

export default {
  name: 'TaskHierarchy',
  components: {
    TaskNode
  },
  props: {
    hierarchyTasks: {
      type: Array,
      required: true
    }
  },
  emits: ['toggle-complete', 'edit-task', 'delete-task', 'add-child']
}
</script>

<style scoped>
.task-hierarchy h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 300;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.hierarchy-tree {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>