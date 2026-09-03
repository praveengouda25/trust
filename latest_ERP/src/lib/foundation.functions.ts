import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type SupabaseErrorLike = { message?: string; code?: string; details?: string | null };

export class AccountContextError extends Error {
  constructor(
    public readonly code:
      | "PROFILE_NOT_FOUND"
      | "PROFILE_INACTIVE"
      | "ROLE_NOT_FOUND"
      | "BRANCH_CONTEXT_MISSING"
      | "DATABASE_ERROR",
    message: string,
  ) {
    super(message);
    this.name = "AccountContextError";
  }
}

type QueryResult<T> = PromiseLike<{ data: T | null; error: SupabaseErrorLike | null }>;

function isMissingTableError(error: SupabaseErrorLike | null | undefined) {
  if (!error) return false;
  const code = String(error.code ?? "").toUpperCase();
  const message = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST200" ||
    message.includes("schema cache") ||
    (message.includes("relation") && message.includes("does not exist"))
  );
}

async function safeQuery<T>(
  queryPromise: QueryResult<T>,
  fallback: NoInfer<T>,
): Promise<{ data: T; error: null }> {
  const { data, error } = await queryPromise;
  if (error && isMissingTableError(error)) {
    throw new AccountContextError(
      "DATABASE_ERROR",
      "The ERP account schema is not available. Apply the Supabase migrations before signing in.",
    );
  }
  if (error) {
    throw new AccountContextError("DATABASE_ERROR", error.message ?? "Supabase query failed");
  }
  return { data: (data ?? fallback) as T, error: null };
}

/**
 * Foundation server functions (Phase 1).
 * Every query runs through the authenticated Supabase client, so Row Level
 * Security scopes results to the caller's roles, trust and branches.
 */

export const getSessionContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string }).email ?? null;

    const [profileRes, rolesRes, branchesRes, trustsRes] = await Promise.all([
      safeQuery<ProfileRow | null>(
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        null,
      ),
      safeQuery(
        supabase.from("user_roles").select("role, branch_id, trust_id").eq("user_id", userId),
        [],
      ),
      safeQuery(
        supabase
          .from("branches")
          .select("id, name, code, city, state, trust_id, is_active")
          .is("deleted_at", null)
          .order("name"),
        [],
      ),
      safeQuery(supabase.from("trusts").select("*").is("deleted_at", null).order("name"), []),
    ]);

    const profile = profileRes.data;
    if (!profile) {
      throw new AccountContextError(
        "PROFILE_NOT_FOUND",
        "Your login is valid, but an ERP account profile has not been configured for this user.",
      );
    }
    if (!profile.is_active) {
      throw new AccountContextError("PROFILE_INACTIVE", "Your ERP account is inactive.");
    }

    const roles = (rolesRes.data ?? []).map((r: { role: string }) => r.role);
    if (roles.length === 0) {
      throw new AccountContextError(
        "ROLE_NOT_FOUND",
        "Your ERP account is valid, but no access role has been assigned yet.",
      );
    }

    if (roles.some((role) => !role || typeof role !== "string")) {
      throw new AccountContextError("DATABASE_ERROR", "The ERP account has an invalid role.");
    }

    return {
      userId,
      email,
      profile,
      roles,
      roleGrants: rolesRes.data ?? [],
      branches: branchesRes.data ?? [],
      trusts: trustsRes.data ?? [],
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        full_name: z.string().min(1).max(120).optional(),
        phone: z.string().max(30).nullable().optional(),
        default_branch_id: z.string().uuid().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveTrust = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(2).max(160),
        display_name: z.string().min(2).max(160),
        slug: z
          .string()
          .min(2)
          .max(60)
          .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
        logo_url: z.string().url().nullable().optional(),
        primary_color: z.string().max(40).nullable().optional(),
        accent_color: z.string().max(40).nullable().optional(),
        contact_email: z.string().email().nullable().optional(),
        contact_phone: z.string().max(30).nullable().optional(),
        address: z.string().max(400).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("trusts").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("trusts")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const saveBranch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        trust_id: z.string().uuid(),
        name: z.string().min(2).max(160),
        code: z.string().min(1).max(20),
        branch_type: z
          .enum([
            "main_campus",
            "branch_campus",
            "trust_hostel",
            "boys_hostel",
            "girls_hostel",
            "residential_school",
            "other",
          ])
          .optional(),
        logo_url: z.string().url().nullable().optional(),
        photo_url: z.string().url().nullable().optional(),
        registration_number: z.string().max(100).nullable().optional(),
        gst_number: z.string().max(30).nullable().optional(),
        email: z.string().email().nullable().optional(),
        phone_country_code: z.string().max(10).nullable().optional(),
        contact_phone: z.string().max(30).nullable().optional(),
        alternate_contact: z.string().max(30).nullable().optional(),
        website: z.string().url().nullable().optional(),
        country: z.string().max(80).nullable().optional(),
        state: z.string().max(80).nullable().optional(),
        district: z.string().max(80).nullable().optional(),
        city: z.string().max(80).nullable().optional(),
        taluk: z.string().max(80).nullable().optional(),
        village: z.string().max(80).nullable().optional(),
        pincode: z.string().max(20).nullable().optional(),
        address: z.string().max(400).nullable().optional(),
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        description: z.string().max(1000).nullable().optional(),
        is_active: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("branches").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("branches")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listHostels = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({ branchId: z.string().uuid().nullable().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let query = context.supabase.from("hostels").select("*").is("deleted_at", null).order("name");
    if (data.branchId) query = query.eq("branch_id", data.branchId);
    const { data: hostels, error } = await query;
    if (error) throw new Error(error.message);

    const { data: occupancy } = await context.supabase.from("v_hostel_occupancy").select("*");
    return {
      hostels: hostels ?? [],
      occupancy: occupancy ?? [],
    };
  });

export const saveHostel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        branch_id: z.string().uuid(),
        name: z.string().min(2).max(160),
        code: z.string().min(1).max(20),
        type: z.enum(["boys", "girls", "mixed"]),
        capacity: z.number().int().min(0).max(100000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("hostels").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("hostels")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const getHostelStructure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ hostelId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: hostel, error } = await supabase
      .from("hostels")
      .select("*")
      .eq("id", data.hostelId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!hostel) return null;

    const { data: buildings } = await supabase
      .from("buildings")
      .select("*")
      .eq("hostel_id", data.hostelId)
      .is("deleted_at", null)
      .order("name");
    const buildingIds = (buildings ?? []).map((b) => b.id);

    const { data: floors } = buildingIds.length
      ? await supabase
          .from("floors")
          .select("*")
          .in("building_id", buildingIds)
          .is("deleted_at", null)
          .order("level")
      : { data: [] };

    const { data: rooms } = await supabase
      .from("rooms")
      .select("*")
      .eq("hostel_id", data.hostelId)
      .is("deleted_at", null)
      .order("room_number");

    const { data: beds } = await supabase
      .from("beds")
      .select("*")
      .eq("hostel_id", data.hostelId)
      .is("deleted_at", null)
      .order("bed_number");

    return {
      hostel,
      buildings: buildings ?? [],
      floors: floors ?? [],
      rooms: rooms ?? [],
      beds: beds ?? [],
    };
  });

export const saveBuilding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        hostel_id: z.string().uuid(),
        branch_id: z.string().uuid(),
        name: z.string().min(1).max(120),
        code: z.string().max(20).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("buildings")
      .insert({ ...data, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const saveFloor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        building_id: z.string().uuid(),
        branch_id: z.string().uuid(),
        name: z.string().min(1).max(120),
        level: z.number().int().min(-5).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("floors")
      .insert({ ...data, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const saveRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        floor_id: z.string().uuid(),
        hostel_id: z.string().uuid(),
        branch_id: z.string().uuid(),
        room_number: z.string().min(1).max(20),
        room_type: z.string().max(40).nullable().optional(),
        capacity: z.number().int().min(1).max(50),
        generate_beds: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { generate_beds, ...fields } = data;
    const { data: room, error } = await context.supabase
      .from("rooms")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (generate_beds !== false) {
      const beds = Array.from({ length: fields.capacity }, (_, i) => ({
        room_id: room.id,
        hostel_id: fields.hostel_id,
        branch_id: fields.branch_id,
        bed_number: `${fields.room_number}-${i + 1}`,
        created_by: context.userId,
      }));
      const { error: bedError } = await context.supabase.from("beds").insert(beds);
      if (bedError) throw new Error(bedError.message);
    }
    return { id: room.id };
  });

export const setBedStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        bedId: z.string().uuid(),
        status: z.enum(["available", "reserved", "maintenance"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("beds")
      .update({ status: data.status })
      .eq("id", data.bedId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTeamMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const rolesResult = await safeQuery(
      supabase
        .from("user_roles")
        .select("id, user_id, role, branch_id, trust_id, created_at")
        .order("created_at", { ascending: false }),
      [],
    );

    const roles = rolesResult.data ?? [];
    const userIds = Array.from(new Set((roles ?? []).map((r: { user_id: string }) => r.user_id)));
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name, email, phone").in("id", userIds)
      : { data: [] };

    return { roles: roles ?? [], profiles: profiles ?? [] };
  });

export const findUserByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id, full_name, email")
      .ilike("email", data.email)
      .maybeSingle();
    return { profile: profile ?? null };
  });

export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        user_id: z.string().uuid(),
        role: z.enum([
          "super_admin",
          "trust_admin",
          "branch_admin",
          "warden",
          "teacher",
          "accountant",
          "security_guard",
          "inventory_manager",
          "kitchen_staff",
          "student",
          "parent",
          "donor",
        ]),
        branch_id: z.string().uuid().nullable().optional(),
        trust_id: z.string().uuid().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ ...data, created_by: context.userId });
    if (error && isMissingTableError(error)) {
      return {
        ok: false,
        status: "schema-required",
        message:
          "The Supabase database schema is not initialized yet. Run the migration to create the required tables, then try again.",
      };
    }
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_roles").delete().eq("id", data.id);
    if (error && isMissingTableError(error)) {
      return {
        ok: false,
        status: "schema-required",
        message:
          "The Supabase database schema is not initialized yet. Run the migration to create the required tables, then try again.",
      };
    }
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({ branchId: z.string().uuid().nullable().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const branchId = data.branchId ?? null;

    const students = supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    const hostels = supabase
      .from("hostels")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    const rooms = supabase
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    const beds = supabase
      .from("beds")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    const occupied = supabase
      .from("beds")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "occupied");

    const scoped = branchId
      ? [
          students.eq("branch_id", branchId),
          hostels.eq("branch_id", branchId),
          rooms.eq("branch_id", branchId),
          beds.eq("branch_id", branchId),
          occupied.eq("branch_id", branchId),
        ]
      : [students, hostels, rooms, beds, occupied];

    const [s, h, r, b, o] = await Promise.all(scoped);
    const { data: occupancy } = await supabase.from("v_hostel_occupancy").select("*");

    return {
      students: s.count ?? 0,
      hostels: h.count ?? 0,
      rooms: r.count ?? 0,
      beds: b.count ?? 0,
      occupiedBeds: o.count ?? 0,
      occupancy: (occupancy ?? []).filter((row) => !branchId || row.branch_id === branchId),
    };
  });

export const listAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({ limit: z.number().int().min(1).max(200).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: logs, error } = await context.supabase
      .from("audit_logs")
      .select("id, action, table_name, record_id, actor_id, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (error) throw new Error(error.message);
    return { logs: logs ?? [] };
  });
