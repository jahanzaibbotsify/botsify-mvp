import type { App, DirectiveBinding } from 'vue'
import type { Permission } from '@/types/user'
import { useRoleStore } from '@/stores/roleStore'

// Permission directive for Vue components
export const vPermission = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const roleStore = useRoleStore()
    const requiredPermission = binding.value as Permission

    if (!roleStore.hasPermission(requiredPermission)) {
      // Hide the element if user doesn't have permission
      el.style.display = 'none'
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const roleStore = useRoleStore()
    const requiredPermission = binding.value as Permission

    if (roleStore.hasPermission(requiredPermission)) {
      // Show the element if user has permission
      el.style.display = ''
    } else {
      // Hide the element if user doesn't have permission
      el.style.display = 'none'
    }
  }
}

// Multiple permissions directive (requires ALL permissions)
export const vPermissions = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const roleStore = useRoleStore()
    const requiredPermissions = binding.value as Permission[]

    if (!roleStore.hasAllPermissions(requiredPermissions)) {
      el.style.display = 'none'
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const roleStore = useRoleStore()
    const requiredPermissions = binding.value as Permission[]

    if (roleStore.hasAllPermissions(requiredPermissions)) {
      el.style.display = ''
    } else {
      el.style.display = 'none'
    }
  }
}

// Any permission directive (requires ANY of the permissions)
export const vAnyPermission = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const roleStore = useRoleStore()
    const requiredPermissions = binding.value as Permission[]

    if (!roleStore.hasAnyPermission(requiredPermissions)) {
      el.style.display = 'none'
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const roleStore = useRoleStore()
    const requiredPermissions = binding.value as Permission[]

    if (roleStore.hasAnyPermission(requiredPermissions)) {
      el.style.display = ''
    } else {
      el.style.display = 'none'
    }
  }
}

// Role directive
export const vRole = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const roleStore = useRoleStore()
    const requiredRole = binding.value as string

    if (roleStore.currentRole !== requiredRole) {
      el.style.display = 'none'
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const roleStore = useRoleStore()
    const requiredRole = binding.value as string

    if (roleStore.currentRole === requiredRole) {
      el.style.display = ''
    } else {
      el.style.display = 'none'
    }
  }
}

// Install function for Vue app
export function installPermissions(app: App) {
  app.directive('permission', vPermission)
  app.directive('permissions', vPermissions)
  app.directive('any-permission', vAnyPermission)
  app.directive('role', vRole)
}

// Utility functions for programmatic permission checking
export function checkPermission(permission: Permission): boolean {
  const roleStore = useRoleStore()
  return roleStore.hasPermission(permission)
}

export function checkPermissions(permissions: Permission[]): boolean {
  const roleStore = useRoleStore()
  return roleStore.hasAllPermissions(permissions)
}

export function checkAnyPermission(permissions: Permission[]): boolean {
  const roleStore = useRoleStore()
  return roleStore.hasAnyPermission(permissions)
}

export function checkRole(role: string): boolean {
  const roleStore = useRoleStore()
  return roleStore.currentRole === role
} 