/**
 * Role definitions and utilities
 * Defines the two roles: 'admin' and 'user'
 */

export type UserRole = 'admin' | 'user';

export const ROLES = {
  ADMIN: 'admin' as const,
  USER: 'user' as const,
} as const;

export interface RolePermissions {
  canManageModules: boolean;
  canManageQuestions: boolean;
  canSubmitAnswers: boolean;
  canViewAllAnswers: boolean;
  canDeleteData: boolean;
}

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case ROLES.ADMIN:
      return {
        canManageModules: true,
        canManageQuestions: true,
        canSubmitAnswers: true,
        canViewAllAnswers: true,
        canDeleteData: true,
      };
    case ROLES.USER:
      return {
        canManageModules: false,
        canManageQuestions: false,
        canSubmitAnswers: true,
        canViewAllAnswers: false,
        canDeleteData: false,
      };
    default:
      // Default to user permissions for unknown roles
      return {
        canManageModules: false,
        canManageQuestions: false,
        canSubmitAnswers: true,
        canViewAllAnswers: false,
        canDeleteData: false,
      };
  }
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return role === ROLES.ADMIN || role === ROLES.USER;
}

/**
 * Check if user has admin role
 */
export function isAdmin(role: string): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if user has user role
 */
export function isUser(role: string): boolean {
  return role === ROLES.USER;
}
