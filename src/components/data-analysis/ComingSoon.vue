<template>
  <div class="coming-soon-container">
    <div class="coming-soon-content">
      <div class="coming-soon-icon">🚧</div>
      <h3>Coming Soon</h3>
      <p>This preview type is not yet supported.</p>
      <div class="preview-info">
        <div class="info-item">
          <span class="info-label">Preview Type:</span>
          <span class="info-value">{{ previewType }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data Structure:</span>
          <span class="info-value">{{ dataStructure }}</span>
        </div>
      </div>
      <div class="supported-types">
        <h4>Currently Supported:</h4>
        <ul>
          <li><strong>Table:</strong> Tabular data with rows and columns</li>
          <li><strong>Chart:</strong> Chart data with labels and values</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  previewType: string
  dataStructure?: string
}

withDefaults(defineProps<Props>(), {
  dataStructure: 'Unknown'
})
</script>

<style scoped>
.coming-soon-container {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.coming-soon-content {
  max-width: 500px;
  margin: 0 auto;
}

.coming-soon-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

.coming-soon-content h3 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.coming-soon-content p {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.preview-info {
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.info-value {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  background-color: var(--color-bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.supported-types {
  text-align: left;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
}

.supported-types h4 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.supported-types ul {
  margin: 0;
  padding-left: var(--space-4);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.supported-types li {
  margin-bottom: var(--space-1);
}

.supported-types li:last-child {
  margin-bottom: 0;
}

.supported-types strong {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .coming-soon-container {
    padding: var(--space-4);
  }
  
  .coming-soon-icon {
    font-size: 3rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }
}
</style>
