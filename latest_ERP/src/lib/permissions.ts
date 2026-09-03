import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  trust_admin: "Trust Admin",
  branch_admin: "Branch Admin",
  warden: "Warden / Hostel Staff",
  teacher: "Teacher",
  accountant: "Accountant",
  security_guard: "Security Guard",
  inventory_manager: "Inventory Manager",
  kitchen_staff: "Kitchen Staff",
  student: "Student",
  parent: "Parent / Guardian",
  donor: "Donor",
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as AppRole[];

/** Roles that operate the back office (as opposed to portal users). */
export const STAFF_ROLES: AppRole[] = [
  "super_admin",
  "trust_admin",
  "branch_admin",
  "warden",
  "teacher",
  "accountant",
  "security_guard",
  "inventory_manager",
  "kitchen_staff",
];

export type Module =
  | "dashboard"
  | "students"
  | "hostels"
  | "allocations"
  | "users"
  | "branches"
  | "branding"
  | "audit"
  | "attendance"
  | "leave"
  | "complaints"
  | "maintenance"
  | "inventory"
  | "issues"
  | "visitors"
  | "security"
  | "gatepass"
  | "medical"
  | "mess"
  | "assets"
  | "finance"
  | "donations"
  | "expenses"
  | "reports"
  | "notifications";

export type Action = "view" | "create" | "edit" | "delete" | "manage";

/**
 * UI mirror of the database permission matrix. The database (RLS) is the
 * source of truth — this only decides what is shown, never what is allowed.
 */
const MATRIX: Record<AppRole, Partial<Record<Module, Action[]>>> = {
  super_admin: {
    dashboard: ["view"],
    students: ["view", "create", "edit", "delete", "manage"],
    hostels: ["view", "create", "edit", "delete", "manage"],
    allocations: ["view", "create", "edit", "delete", "manage"],
    users: ["view", "create", "edit", "delete", "manage"],
    branches: ["view", "create", "edit", "delete", "manage"],
    branding: ["view", "edit", "manage"],
    audit: ["view"],
    attendance: ["view", "create", "edit", "delete", "manage"],
    leave: ["view", "create", "edit", "delete", "manage"],
    complaints: ["view", "create", "edit", "delete", "manage"],
    maintenance: ["view", "create", "edit", "delete", "manage"],
    inventory: ["view", "create", "edit", "delete", "manage"],
    visitors: ["view", "create", "edit", "delete", "manage"],
    security: ["view", "create", "edit", "delete", "manage"],
    gatepass: ["view", "create", "edit", "delete", "manage"],
    medical: ["view", "create", "edit", "delete", "manage"],
    mess: ["view", "create", "edit", "delete", "manage"],
    assets: ["view", "create", "edit", "delete", "manage"],
    finance: ["view", "create", "edit", "delete", "manage"],
    donations: ["view", "create", "edit", "delete", "manage"],
    expenses: ["view", "create", "edit", "delete", "manage"],
    reports: ["view", "manage"],
    notifications: ["view", "create", "edit", "delete", "manage"],
  },
  trust_admin: {
    dashboard: ["view"],
    students: ["view", "create", "edit", "delete", "manage"],
    hostels: ["view", "create", "edit", "delete", "manage"],
    allocations: ["view", "create", "edit", "delete", "manage"],
    users: ["view", "create", "edit", "delete", "manage"],
    branches: ["view", "create", "edit", "manage"],
    branding: ["view", "edit", "manage"],
    audit: ["view"],
    attendance: ["view", "create", "edit", "delete", "manage"],
    leave: ["view", "create", "edit", "delete", "manage"],
    complaints: ["view", "create", "edit", "delete", "manage"],
    maintenance: ["view", "create", "edit", "delete", "manage"],
    inventory: ["view", "create", "edit", "delete", "manage"],
    visitors: ["view", "create", "edit", "delete", "manage"],
    medical: ["view", "create", "edit", "delete", "manage"],
    mess: ["view", "create", "edit", "delete", "manage"],
    assets: ["view", "create", "edit", "delete", "manage"],
    finance: ["view", "create", "edit", "delete", "manage"],
    donations: ["view", "create", "edit", "delete", "manage"],
    expenses: ["view", "create", "edit", "delete", "manage"],
    reports: ["view", "manage"],
    notifications: ["view", "create", "edit", "delete", "manage"],
  },
  branch_admin: {
    dashboard: ["view"],
    students: ["view", "create", "edit", "delete", "manage"],
    hostels: ["view", "create", "edit", "delete", "manage"],
    allocations: ["view", "create", "edit", "manage"],
    users: ["view", "create", "edit", "manage"],
    branches: ["view"],
    attendance: ["view", "create", "edit", "delete", "manage"],
    leave: ["view", "create", "edit", "delete", "manage"],
    complaints: ["view", "create", "edit", "delete", "manage"],
    maintenance: ["view", "create", "edit", "delete", "manage"],
    inventory: ["view", "create", "edit", "delete", "manage"],
    visitors: ["view", "create", "edit", "delete", "manage"],
    medical: ["view", "create", "edit", "delete", "manage"],
    mess: ["view", "create", "edit", "delete", "manage"],
    assets: ["view", "create", "edit", "delete", "manage"],
    finance: ["view"],
    donations: ["view"],
    expenses: ["view"],
    reports: ["view"],
    notifications: ["view", "create", "edit", "delete"],
  },
  warden: {
    dashboard: ["view"],
    students: ["view", "edit"],
    hostels: ["view", "create", "edit"],
    allocations: ["view", "create", "edit", "manage"],
    attendance: ["view", "create", "edit"],
    leave: ["view", "create", "edit"],
    complaints: ["view", "create", "edit"],
    maintenance: ["view", "create", "edit"],
    inventory: ["view", "create", "edit"],
    visitors: ["view", "create", "edit"],
    medical: ["view", "create"],
    mess: ["view", "create", "edit"],
    assets: ["view"],
    reports: ["view"],
    notifications: ["view"],
  },
  teacher: {
    dashboard: ["view"],
    students: ["view", "create", "edit"],
    attendance: ["view", "create", "edit"],
    leave: ["view"],
    complaints: ["view", "create"],
    mess: ["view"],
    // Read-only security dashboard for teachers.
    security: ["view"],
    reports: ["view"],
    notifications: ["view"],
  },
  accountant: {
    dashboard: ["view"],
    students: ["view"],
    finance: ["view", "create", "edit", "manage"],
    donations: ["view", "create", "edit"],
    expenses: ["view", "create", "edit"],
    reports: ["view"],
    notifications: ["view"],
  },
  security_guard: {
    dashboard: ["view"],
    security: ["view", "create", "edit"],
    visitors: ["view", "create", "edit"],
    gatepass: ["view", "create", "edit"],
    reports: ["view"],
    notifications: ["view"],
  },
  inventory_manager: {
    dashboard: ["view"],
    inventory: ["view", "create", "edit", "delete", "manage"],
    assets: ["view", "create", "edit"],
    notifications: ["view"],
  },
  kitchen_staff: {
    dashboard: ["view"],
    leave: ["view"],
    issues: ["view"],
    complaints: ["view"],
    maintenance: ["view"],
    inventory: ["view"],
    visitors: ["view"],
    gatepass: ["view"],
    security: ["view"],
    medical: ["view"],
    mess: ["view", "create", "edit"],
    assets: ["view"],
    notifications: ["view"],
  },
  student: {
    dashboard: ["view"],
    students: ["view"],
    attendance: ["view"],
    leave: ["view", "create"],
    complaints: ["view", "create"],
    mess: ["view"],
    notifications: ["view"],
  },
  parent: {
    dashboard: ["view"],
    students: ["view"],
    attendance: ["view"],
    leave: ["view"],
    complaints: ["view"],
    mess: ["view"],
    notifications: ["view"],
  },
  donor: {
    dashboard: ["view"],
    donations: ["view", "create"],
    notifications: ["view"],
  },
};

export function can(roles: AppRole[], module: Module, action: Action): boolean {
  return roles.some((role) => MATRIX[role]?.[module]?.includes(action) ?? false);
}

export function hasAnyRole(roles: AppRole[], wanted: AppRole[]): boolean {
  return roles.some((r) => wanted.includes(r));
}

export function isStaff(roles: AppRole[]): boolean {
  return hasAnyRole(roles, STAFF_ROLES);
}

/** The highest-privilege role a user holds, used to pick their home dashboard. */
export function primaryRole(roles: AppRole[]): AppRole | null {
  const order: AppRole[] = [
    "super_admin",
    "trust_admin",
    "branch_admin",
    "warden",
    "security_guard",
    "kitchen_staff",
    "inventory_manager",
    "accountant",
    "teacher",
    "parent",
    "student",
    "donor",
  ];
  return order.find((r) => roles.includes(r)) ?? null;
}
