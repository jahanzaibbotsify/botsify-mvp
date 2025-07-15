
// Types
export interface User {
  id: number
  name: string
  locale: string
  source: string
  createdAt: string
  country: string
  os: string
  phone: string
  status: 'Active' | 'Inactive'
  hasConversation: boolean
  selected: boolean
}

export interface UserAttribute {
  id: number
  key: string
  value: string
}

export type FilterType = 'all' | 'active' | 'inactive'
export type ActionType = '' | 'activate' | 'deactivate' | 'delete' | 'test' | 'remove-test' | 'export' | 'add-attribute' | 'delete-conversation'
