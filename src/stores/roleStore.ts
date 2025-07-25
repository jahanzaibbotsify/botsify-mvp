import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserRole, Permission, RolePermissions, BotUser } from '@/types/user'

export const useRoleStore = defineStore('role', () => {
  // Current user role and permissions
  const currentUser = ref<BotUser | null>(null)
  const currentRole = ref<UserRole>('admin')
  const userPermissions = ref<Permission[]>([])

  // Role definitions with permissions
  const roleDefinitions: RolePermissions[] = [
    {
      role: 'admin',
      permissions: [
        'send_messages',
        'delete_user_chats',
        'download_chats',
        'change_notifications',
        'change_user_status',
        'view_user_attributes',
        'view_editor_billing',
        'view_chats_page',
        'manage_bot_settings',
        'manage_mcp_connections',
        'manage_team_members',
        'view_analytics',
        'manage_billing',
        'access_agent_page',
        'edit_user_attributes',
        'delete_users'
      ],
      description: 'Full access to all features and settings'
    },
    {
      role: 'editor',
      permissions: [
        'view_chats_page',
        'manage_bot_settings',
        'manage_mcp_connections',
        'view_analytics',
        'view_user_attributes',
        'access_agent_page'
        // Cannot: send_messages, delete_user_chats, download_chats, change_notifications, change_user_status, view_editor_billing, manage_team_members, manage_billing, edit_user_attributes, delete_users
      ],
      description: 'Can manage bot settings, view analytics and user attributes, but cannot edit users or interact with conversations'
    },
    {
      role: 'live_chat_agent',
      permissions: [
        'view_chats_page'
        // Cannot: send_messages, delete_user_chats, download_chats, change_notifications, change_user_status, view_user_attributes, view_editor_billing, manage_bot_settings, manage_mcp_connections, manage_team_members, view_analytics, manage_billing, access_agent_page, edit_user_attributes, delete_users
      ],
      description: 'Can only view the chats page'
    }
  ]

  // Convert bot_role number to UserRole
  const getRoleFromBotRole = (botRole: number): UserRole => {
    switch (botRole) {
      case 0:
        return 'editor'
      case 2:
        return 'live_chat_agent'
      default:
        return 'admin'
    }
  }

  // Get permissions for a specific role
  const getPermissionsForRole = (role: UserRole): Permission[] => {
    const roleDef = roleDefinitions.find(r => r.role === role)
    return roleDef ? roleDef.permissions : []
  }

  // Set current user and role
  const setCurrentUser = (user: BotUser) => {
    currentUser.value = user
    currentRole.value = getRoleFromBotRole(user.bot_role)
    userPermissions.value = getPermissionsForRole(currentRole.value)
    
    console.log(`🔐 Role set: ${currentRole.value} (bot_role: ${user.bot_role})`)
    console.log(`📋 Permissions:`, userPermissions.value)
  }

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.value.includes(permission)
  }

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  // Get role description
  const getRoleDescription = (role: UserRole): string => {
    const roleDef = roleDefinitions.find(r => r.role === role)
    return roleDef ? roleDef.description : 'Unknown role'
  }

  // Computed properties
  const isAdmin = computed(() => currentRole.value === 'admin')
  const isEditor = computed(() => currentRole.value === 'editor')
  const isLiveChatAgent = computed(() => currentRole.value === 'live_chat_agent')

  // Permission computed properties
  const canSendMessages = computed(() => hasPermission('send_messages'))
  const canDeleteUserChats = computed(() => hasPermission('delete_user_chats'))
  const canDownloadChats = computed(() => hasPermission('download_chats'))
  const canChangeNotifications = computed(() => hasPermission('change_notifications'))
  const canChangeUserStatus = computed(() => hasPermission('change_user_status'))
  const canViewUserAttributes = computed(() => hasPermission('view_user_attributes'))
  const canViewEditorBilling = computed(() => hasPermission('view_editor_billing'))
  const canViewChatsPage = computed(() => hasPermission('view_chats_page'))
  const canManageBotSettings = computed(() => hasPermission('manage_bot_settings'))
  const canManageMCPConnections = computed(() => hasPermission('manage_mcp_connections'))
  const canManageTeamMembers = computed(() => hasPermission('manage_team_members'))
  const canViewAnalytics = computed(() => hasPermission('view_analytics'))
  const canManageBilling = computed(() => hasPermission('manage_billing'))
  const canEditUserAttributes = computed(() => hasPermission('edit_user_attributes'))
  const canDeleteUsers = computed(() => hasPermission('delete_users'))
  const canAccessAgentPage = computed(() => hasPermission('access_agent_page'))

  // Clear user data
  const clearUser = () => {
    currentUser.value = null
    currentRole.value = 'admin'
    userPermissions.value = []
  }

  return {
    // State
    currentUser,
    currentRole,
    userPermissions,
    roleDefinitions,

    // Actions
    setCurrentUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getRoleDescription,
    getRoleFromBotRole,
    getPermissionsForRole,
    clearUser,

    // Computed
    isAdmin,
    isEditor,
    isLiveChatAgent,
    canSendMessages,
    canDeleteUserChats,
    canDownloadChats,
    canChangeNotifications,
    canChangeUserStatus,
    canViewUserAttributes,
    canViewEditorBilling,
    canViewChatsPage,
    canManageBotSettings,
    canManageMCPConnections,
    canManageTeamMembers,
    canViewAnalytics,
    canManageBilling,
    canEditUserAttributes,
    canDeleteUsers,
    canAccessAgentPage
  }
}) 