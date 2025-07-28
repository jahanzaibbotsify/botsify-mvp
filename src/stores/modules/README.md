# Modular Store Architecture

This directory contains modular stores that have been split from large monolithic stores to improve maintainability, reusability, and scalability.

## Store Modules

### Chat-Related Stores

#### `chatMessagesStore.ts`
- **Purpose**: Manages individual chat messages and typing states
- **Key Features**:
  - Message CRUD operations
  - Typing indicator management
  - Message storage and retrieval
- **Usage**:
```typescript
import { useChatMessagesStore } from '@/stores/modules';

const messagesStore = useChatMessagesStore();
messagesStore.addMessage(chatId, content, sender);
```

#### `chatListStore.ts`
- **Purpose**: Manages the list of chats and active chat selection
- **Key Features**:
  - Chat CRUD operations
  - Active chat management
  - Chat sorting and filtering
- **Usage**:
```typescript
import { useChatListStore } from '@/stores/modules';

const chatListStore = useChatListStore();
chatListStore.createNewChat();
chatListStore.setActiveChat(chatId);
```

#### `promptTemplatesStore.ts`
- **Purpose**: Manages prompt templates and story versions
- **Key Features**:
  - Template CRUD operations
  - Version management
  - Story content handling
- **Usage**:
```typescript
import { usePromptTemplatesStore } from '@/stores/modules';

const templatesStore = usePromptTemplatesStore();
templatesStore.createGlobalPromptTemplate(name, content);
```

#### `chatStore.ts` (Composed Store)
- **Purpose**: Unified interface that composes all chat-related stores
- **Key Features**:
  - Coordinates between message, list, and template stores
  - Provides unified API for chat operations
  - Handles AI response processing
- **Usage**:
```typescript
import { useChatStore } from '@/stores/modules';

const chatStore = useChatStore();
await chatStore.handleAIResponse(chat);
```

### User-Related Stores

#### `userDataStore.ts`
- **Purpose**: Manages user data, authentication, and caching
- **Key Features**:
  - User CRUD operations
  - Authentication state
  - API caching
  - User selection management
- **Usage**:
```typescript
import { useUserDataStore } from '@/stores/modules';

const userDataStore = useUserDataStore();
await userDataStore.fetchUsers();
```

#### `userFiltersStore.ts`
- **Purpose**: Manages user filtering, sorting, and pagination
- **Key Features**:
  - Filter state management
  - Search functionality
  - Pagination controls
  - Sort operations
- **Usage**:
```typescript
import { useUserFiltersStore } from '@/stores/modules';

const userFiltersStore = useUserFiltersStore();
userFiltersStore.updateSearch('john');
```

#### `userStore.ts` (Composed Store)
- **Purpose**: Unified interface that composes user data and filter stores
- **Key Features**:
  - Coordinates between data and filter stores
  - Provides unified API for user operations
  - Handles role-based permissions
- **Usage**:
```typescript
import { useUserStore } from '@/stores/modules';

const userStore = useUserStore();
await userStore.fetchUsersWithFilters();
```

## Benefits of Modular Architecture

### 1. **Separation of Concerns**
Each store module has a single, well-defined responsibility:
- `chatMessagesStore`: Message management only
- `userFiltersStore`: Filtering logic only
- `promptTemplatesStore`: Template management only

### 2. **Reusability**
Modules can be used independently:
```typescript
// Use only message functionality
const messagesStore = useChatMessagesStore();

// Use only filter functionality
const filtersStore = useUserFiltersStore();
```

### 3. **Maintainability**
Smaller, focused modules are easier to:
- Debug and test
- Modify without affecting other functionality
- Understand and document

### 4. **Scalability**
New features can be added by:
- Creating new modules
- Composing existing modules
- Extending existing modules

### 5. **Performance**
- Smaller stores have less reactive overhead
- Only necessary data is reactive
- Better tree-shaking support

## Migration Guide

### From Monolithic Stores

**Before (Monolithic)**:
```typescript
import { useChatStore } from '@/stores/chatStore';

const chatStore = useChatStore();
// All chat functionality in one large store
```

**After (Modular)**:
```typescript
import { useChatStore } from '@/stores/modules';

const chatStore = useChatStore();
// Same API, but internally composed from smaller modules
```

### Using Individual Modules

```typescript
import { useChatMessagesStore, useUserFiltersStore } from '@/stores/modules';

// Use specific functionality only
const messagesStore = useChatMessagesStore();
const filtersStore = useUserFiltersStore();
```

## Best Practices

### 1. **Use Composed Stores for Complex Operations**
```typescript
// ✅ Good: Use composed store for complex operations
const chatStore = useChatStore();
await chatStore.handleAIResponse(chat);

// ❌ Avoid: Manually coordinating between modules
const messagesStore = useChatMessagesStore();
const templatesStore = usePromptTemplatesStore();
// Complex coordination logic...
```

### 2. **Use Individual Modules for Simple Operations**
```typescript
// ✅ Good: Use specific module for simple operations
const filtersStore = useUserFiltersStore();
filtersStore.updateSearch('query');

// ❌ Avoid: Using composed store for simple operations
const userStore = useUserStore();
userStore.updateSearch('query'); // Unnecessary overhead
```

### 3. **Leverage Composables for Reusable Logic**
```typescript
import { useLocalStorage, useFilters } from '@/composables';

// Use composables for common patterns
const { value: theme, setValue: setTheme } = useLocalStorage('theme', 'light');
const { filteredItems, updateSearch } = useFilters(options);
```

## Testing

Each module can be tested independently:

```typescript
// Test individual module
import { useChatMessagesStore } from '@/stores/modules';

describe('ChatMessagesStore', () => {
  it('should add message correctly', () => {
    const store = useChatMessagesStore();
    const message = store.addMessage('chat-1', 'Hello', 'user');
    expect(message.content).toBe('Hello');
  });
});
```

## Future Enhancements

1. **More Specialized Modules**: Create modules for specific domains (notifications, settings, etc.)
2. **Module Composition**: Allow dynamic composition of modules based on features
3. **Plugin System**: Allow modules to be extended with plugins
4. **Performance Monitoring**: Add performance tracking for module usage
5. **Type Safety**: Enhance TypeScript types for better developer experience 