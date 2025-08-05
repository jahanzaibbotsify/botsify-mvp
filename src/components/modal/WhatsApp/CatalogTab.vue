<script setup lang="ts">
import { ref, computed } from "vue";
import { Input, Button, VueSelect, Badge } from "@/components/ui";

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
  return [
    { label: 'All Categories', value: 'all' },
    ...cats.map(cat => ({ 
      label: cat.charAt(0).toUpperCase() + cat.slice(1), 
      value: cat 
    }))
  ];
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

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handleCategoryChange = (value: any) => {
  selectedCategory.value = value;
};

const handleAddProduct = () => {
  // TODO: Implement add product functionality
  console.log('Add product clicked');
};

const handleEditProduct = (product: any) => {
  // TODO: Implement edit product functionality
  console.log('Edit product:', product);
};

const handleDeleteProduct = (product: any) => {
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    deleteProduct(product.id);
  }
};

const handleViewProduct = (product: any) => {
  // TODO: Implement view product functionality
  console.log('View product:', product);
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
        <Input 
          v-model="searchQuery" 
          placeholder="Search catalog..."
          searchable
          iconPosition="left"
          @search="handleSearch"
        />
        
        <VueSelect
          v-model="selectedCategory"
          :options="categories"
          placeholder="Select category"
          @change="handleCategoryChange"
        />
        
        <Button variant="primary" @click="handleAddProduct">
          <i class="pi pi-plus"></i>
          Add Product
        </Button>
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
            <Badge variant="info" size="small">{{ product.category }}</Badge>
          </div>
          
          <div class="product-status">
            <Badge 
              variant="success" 
              icon="pi pi-check" 
              size="small"
            >
              {{ product.status }}
            </Badge>
          </div>
        </div>
        
        <div class="product-actions">
          <Button 
            variant="primary" 
            size="small" 
            icon="pi pi-pencil"
            icon-only
            @click="handleEditProduct(product)"
            title="Edit"
          />
          <Button 
            variant="error" 
            size="small" 
            icon="pi pi-trash"
            icon-only
            @click="handleDeleteProduct(product)"
            title="Delete"
          />
          <Button 
            variant="secondary" 
            size="small" 
            icon="pi pi-eye"
            icon-only
            @click="handleViewProduct(product)"
            title="View"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

.catalog-header {
  margin-bottom: 24px;
}

.search-filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-filters > * {
  flex: 1;
  min-width: 0;
}

.search-filters .ui-button {
  flex-shrink: 0;
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
  margin-bottom: 8px;
}

.product-status {
  margin-bottom: 12px;
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