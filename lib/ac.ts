import { auth } from "./auth";

// Role & Permission types
export type Role = "admin" | "user" | "moderator";
export type PermissionMap = Record<string, string[]>;

// Define role permissions statically
export const ROLE_PERMISSIONS: Record<Role, PermissionMap> = {
  user: {
    user: ["read"],
    project: ["create", "read", "update"],
    dashboard: ["read"],
  },
  moderator: {
    user: ["read", "update"],
    project: ["create", "read", "update", "delete"],
    dashboard: ["read", "manage"],
  },
  admin: {
    user: ["create", "read", "update", "delete", "ban", "unban", "impersonate"],
    project: ["create", "read", "update", "delete", "share"],
    dashboard: ["read", "manage"],
    admin: ["full_access"],
  },
};

export const sesionPermissions: Record<Role, string[]> = {
  admin: ["list", "revoke", "delete"],
  moderator: [],
  user: [],
};

// Server-side utility to get user with permissions
export async function getUserWithPermissionsServer(userId: string) {
  try {
    // Use Better Auth's session API
    const sessionResult = await auth.api.getSession({
      headers: new Headers(),
    });

    let user: any = null;
    let role: Role = "user";

    if (sessionResult?.user && sessionResult.user.id === userId) {
      user = sessionResult.user;
      // Extract role from user object with proper type casting
      role = ((user as any).role as Role) || "user";
    } else {
      // If no session or different user, we can't get user data safely
      throw new Error("User session not found or unauthorized");
    }

    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      permissions,
    };
  } catch (err) {
    console.error("getUserWithPermissionsServer failed:", err);
    throw new Error(
      `Failed to get user with permissions: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }
}

// Check if user has specific permission
export async function checkUserPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const { permissions } = await getUserWithPermissionsServer(userId);

    if (!permissions[resource]) return false;

    return permissions[resource].includes(action);
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

// Get all permissions for a user
export async function getUserPermissions(
  userId: string
): Promise<PermissionMap> {
  try {
    const { permissions } = await getUserWithPermissionsServer(userId);
    return permissions;
  } catch (error) {
    console.error("Failed to get user permissions:", error);
    return {};
  }
}

// Check if user has role
export async function userHasRole(
  userId: string,
  requiredRole: Role
): Promise<boolean> {
  try {
    const { user } = await getUserWithPermissionsServer(userId);
    return user?.role === requiredRole;
  } catch (error) {
    console.error("Role check failed:", error);
    return false;
  }
}

// Check if user has any of the specified roles
export async function userHasAnyRole(
  userId: string,
  roles: Role[]
): Promise<boolean> {
  try {
    const { user } = await getUserWithPermissionsServer(userId);
    return user?.role ? roles.includes(user.role as Role) : false;
  } catch (error) {
    console.error("Role check failed:", error);
    return false;
  }
}

// Helper function to get user role from session
export async function getUserRole(userId: string): Promise<Role> {
  try {
    const { user } = await getUserWithPermissionsServer(userId);
    return (user?.role as Role) || "user";
  } catch (error) {
    console.error("Failed to get user role:", error);
    return "user";
  }
}

// Middleware helper for route protection
export function requireRole(allowedRoles: Role[]) {
  return async (userId: string): Promise<boolean> => {
    try {
      const userRole = await getUserRole(userId);
      return allowedRoles.includes(userRole);
    } catch (error) {
      console.error("Role check middleware failed:", error);
      return false;
    }
  };
}

// Middleware helper for permission protection
export function requirePermission(resource: string, action: string) {
  return async (userId: string): Promise<boolean> => {
    return await checkUserPermission(userId, resource, action);
  };
}

// Utility to check if user can manage other users
export async function canManageUsers(userId: string): Promise<boolean> {
  return await userHasAnyRole(userId, ["admin", "moderator"]);
}

// Utility to check if user can access admin features
export async function canAccessAdmin(userId: string): Promise<boolean> {
  return await userHasRole(userId, "admin");
}
