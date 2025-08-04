<script setup lang="ts">
import { ref, computed } from "vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-product': [product: any];
  'update-product': [product: any];
  'delete-product': [id: number];
}>();

// Reactive data
const searchQuery = ref('');
const selectedCategory = ref('all');

// Sample catalog data
const catalogProducts = ref([
  {
    id: 1,
    name: 'Premium Widget',
    description: 'High-quality widget for all your needs',
    price: 29.99,
    category: 'electronics',
    stock: 50,
    status: 'active',
    image: '/products/widget.jpg'
  },
  {
    id: 2,
    name: 'Smart Gadget',
    description: 'Intelligent gadget with advanced features',
    price: 89.99,
    category: 'electronics',
    stock: 25,
    status: 'active',
    image: '/products/gadget.jpg'
  },
  {
    id: 3,
    name: 'Organic Tea',
    description: 'Natural organic tea blend',
    price: 12.99,
    category: 'beverages',
    stock: 100,
    status: 'active',
    image: '/products/tea.jpg'
  }
]);

// Computed properties
const filteredProducts = computed(() => {
  let filtered = catalogProducts.value;
  
  if (searchQuery.value) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(product => product.category === selectedCategory.value);
  }
  
  return filtered;
});

const categories = computed(() => {
  const cats = [...new Set(catalogProducts.value.map(product => product.category))];
  return ['all', ...cats];
});

// Methods
const createProduct = (product: any) => {
  const newProduct = {
    id: Date.now(),
    ...product,
    status: 'active'
  };
  catalogProducts.value.unshift(newProduct);
  emit('create-product', newProduct);
};

const updateProduct = (product: any) => {
  const index = catalogProducts.value.findIndex(p => p.id === product.id);
  if (index !== -1) {
    catalogProducts.value[index] = { ...catalogProducts.value[index], ...product };
    emit('update-product', catalogProducts.value[index]);
  }
};

const deleteProduct = (id: number) => {
  catalogProducts.value = catalogProducts.value.filter(product => product.id !== id);
  emit('delete-product', id);
};

// Expose methods for parent component
defineExpose({
  createProduct,
  updateProduct,
  deleteProduct,
});
</script>

<template>
  <div class="tab-panel">
    <h3>Catalog</h3>
    <p class="subtitle">Manage your product catalog</p>
    
    <!-- Search and Filters -->
    <div class="catalog-header">
      <div class="search-filters">
        <div class="search-box">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="search-input"
          />
          <i class="pi pi-search search-icon"></i>
        </div>
        
        <div class="category-filter">
          <select v-model="selectedCategory" class="form-input">
            <option value="all">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category.charAt(0).toUpperCase() + category.slice(1) }}
            </option>
          </select>
        </div>
        
        <button class="add-product-button">
          <i class="pi pi-plus"></i>
          Add Product
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="products-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-card"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
        </div>
        
        <div class="product-info">
          <h4 class="product-name">{{ product.name }}</h4>
          <p class="product-description">{{ product.description }}</p>
          
          <div class="product-meta">
            <span class="product-price">${{ product.price }}</span>
            <span class="product-stock">Stock: {{ product.stock }}</span>
          </div>
          
          <div class="product-category">
            <span class="category-badge">{{ product.category }}</span>
          </div>
        </div>
        
        <div class="product-actions">
          <button class="action-btn" title="Edit">
            <i class="pi pi-pencil"></i>
          </button>
          <button class="action-btn" title="Delete">
            <i class="pi pi-trash"></i>
          </button>
          <button class="action-btn" title="View">
            <i class="pi pi-eye"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel {
  padding: 0;
}

.tab-panel h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.catalog-header {
  margin-bottom: 24px;
}

.search-filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary, #6b7280);
  font-size: 14px;
}

.category-filter {
  min-width: 150px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
  transition: border-color var(--transition-normal, 0.2s ease);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-product-button {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background var(--transition-normal, 0.2s ease);
}

.add-product-button:hover {
  background: var(--color-primary-hover, #2563eb);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.product-card {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  transition: all var(--transition-normal, 0.2s ease);
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.product-image {
  width: 100%;
  height: 160px;
  background: var(--color-bg-tertiary, #f3f4f6);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 16px;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.product-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.4;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
}

.product-stock {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
}

.product-category {
  margin-bottom: 12px;
}

.category-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  background: var(--color-accent, #8b5cf6);
  color: white;
}

.product-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-normal, 0.2s ease);
}

.product-card:hover .product-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 6px;
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  color: var(--color-text-secondary, #6b7280);
  transition: all var(--transition-normal, 0.2s ease);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.action-btn:hover {
  background: white;
  color: var(--color-text-primary, #111827);
}

.export-section {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.export-button {
  background: var(--color-bg-tertiary, #f3f4f6);
  border: 1px solid var(--color-border, #e5e7eb);
  padding: 8px 16px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-normal, 0.2s ease);
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-button:hover {
  background: var(--color-bg-secondary, #f9fafb);
  border-color: var(--color-primary, #3b82f6);
}

@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .export-section {
    flex-direction: column;
  }
}
</style> 