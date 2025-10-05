import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  admin: ["full_access"],
  project: ["create", "share", "update", "delete"],
  dashboard: ["read", "manage"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  project: ["create"],
});

export const moderator = ac.newRole({
  project: ["create", "update"],
  dashboard: ["read", "manage"],
});

export const admin = ac.newRole({
  admin: ["full_access"],
  project: ["create", "share", "update", "delete"],
  dashboard: ["read", "manage"],
  ...adminAc.statements,
});
