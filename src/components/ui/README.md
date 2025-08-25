# Dropdown Components

This directory contains reusable dropdown components that provide consistent styling and behavior across the application.

## Components

### Dropdown

A flexible dropdown container component that handles positioning, visibility, and interactions.

#### Props

- `position` - Dropdown positioning: `'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'` (default: `'bottom-right'`)
- `showArrow` - Whether to show the dropdown arrow (default: `true`)
- `containerClass` - Custom CSS class for the container
- `contentClass` - Custom CSS class for the content
- `closeOnOutsideClick` - Whether to close on outside click (default: `true`)
- `closeOnEscape` - Whether to close on escape key (default: `true`)
- `modelValue` - Initial open state (default: `false`)

#### Events

- `update:modelValue` - Emitted when dropdown open state changes
- `open` - Emitted when dropdown opens
- `close` - Emitted when dropdown closes

#### Slots

- `trigger` - Content that triggers the dropdown
- `content` - Dropdown content

#### Methods (via ref)

- `open()` - Open the dropdown
- `close()` - Close the dropdown
- `toggle()` - Toggle the dropdown
- `isOpen()` - Get current open state

### DropdownItem

A dropdown menu item component with consistent styling and variants.

#### Props

- `variant` - Item variant: `'default' | 'danger' | 'success' | 'warning'` (default: `'default'`)
- `disabled` - Whether the item is disabled (default: `false`)
- `icon` - Icon class (if not using icon slot)

#### Events

- `click` - Emitted when item is clicked

#### Slots

- `icon` - Icon content
- `default` - Main content
- `suffix` - Additional content on the right

## Usage Examples

### Basic Dropdown

```vue
<template>
  <Dropdown position="bottom-right">
    <template #trigger>
      <button class="dropdown-trigger">
        Click me
        <i class="pi pi-chevron-down"></i>
      </button>
    </template>
    
    <template #content>
      <DropdownItem @click="handleAction1">
        <template #icon>
          <i class="pi pi-user"></i>
        </template>
        Action 1
      </DropdownItem>
      
      <DropdownItem @click="handleAction2" variant="danger">
        <template #icon>
          <i class="pi pi-trash"></i>
        </template>
        Delete
      </DropdownItem>
    </template>
  </Dropdown>
</template>

<script setup>
import { Dropdown, DropdownItem } from '@/components/ui'

const handleAction1 = () => {
  console.log('Action 1 clicked')
}

const handleAction2 = () => {
  console.log('Action 2 clicked')
}
</script>
```

### Controlled Dropdown

```vue
<template>
  <Dropdown 
    v-model="isOpen" 
    position="bottom-left"
    @open="handleOpen"
    @close="handleClose"
  >
    <template #trigger>
      <button class="dropdown-trigger">
        Controlled Dropdown
      </button>
    </template>
    
    <template #content>
      <DropdownItem @click="closeDropdown">
        Close
      </DropdownItem>
    </template>
  </Dropdown>
</template>

<script setup>
import { ref } from 'vue'
import { Dropdown, DropdownItem } from '@/components/ui'

const isOpen = ref(false)

const handleOpen = () => {
  console.log('Dropdown opened')
}

const handleClose = () => {
  console.log('Dropdown closed')
}

const closeDropdown = () => {
  isOpen.value = false
}
</script>
```

### Programmatic Control

```vue
<template>
  <Dropdown ref="dropdownRef">
    <template #trigger>
      <button @click="openDropdown">Open Programmatically</button>
    </template>
    
    <template #content>
      <DropdownItem @click="closeDropdown">Close</DropdownItem>
    </template>
  </Dropdown>
</template>

<script setup>
import { ref } from 'vue'
import { Dropdown, DropdownItem } from '@/components/ui'

const dropdownRef = ref()

const openDropdown = () => {
  dropdownRef.value?.open()
}

const closeDropdown = () => {
  dropdownRef.value?.close()
}
</script>
```

## Styling

The components use CSS custom properties for theming and support both light and dark themes. They automatically inherit the current theme from the `[data-theme]` attribute.

### Custom Styling

You can override styles using the `containerClass` and `contentClass` props:

```vue
<Dropdown 
  containerClass="my-custom-dropdown"
  contentClass="my-custom-content"
>
  <!-- content -->
</Dropdown>
```

### CSS Variables Used

- `--color-bg-primary` - Background color
- `--color-bg-secondary` - Secondary background color
- `--color-border` - Border color
- `--color-text-primary` - Primary text color
- `--color-text-secondary` - Secondary text color
- `--space-*` - Spacing variables
- `--radius-*` - Border radius variables
- `--shadow-*` - Shadow variables
- `--transition-*` - Transition variables
- `--z-dropdown` - Z-index for dropdown

## Accessibility

- Proper ARIA attributes for screen readers
- Keyboard navigation support (Escape to close)
- Focus management
- Click outside to close functionality
- Semantic HTML structure

## Browser Support

- Modern browsers (ES2020+)
- Vue 3 with Composition API
- CSS Grid and Flexbox support required
