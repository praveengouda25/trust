import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server functions for the notification centre, complaints, maintenance,
 * emergency contacts, occupancy analytics, global search, and security operations.
 */

const uuid = z.string().uuid();
const branchScope = z.object({ branchId: z.string().uuid().nullable().optional() });
const dateStr = z.string().min(4).max(20);

/* ------------------------------ notifications ----------------------------- */

export const listNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    branchScope.extend({ includeArchived: z.boolean().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!data.includeArchived) q = q.eq("is_archived", false);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const notifications = rows ?? [];
    return { notifications, unread: notifications.filter((n) => !n.is_read).length };
  });

export const createNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        branch_id: uuid.nullable().optional(),
        recipient_id: uuid.nullable().optional(),
        recipient_role: z
          .enum([
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
          ])
          .nullable()
          .optional(),
        category: z.string().max(60).optional(),
        priority: z.enum(["low", "normal", "high", "critical"]).optional(),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(1000),
        link: z.string().max(400).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notifications").insert({
      ...data,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        markAllRead: z.boolean().optional(),
        is_read: z.boolean().optional(),
        is_archived: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: { is_read?: boolean; is_archived?: boolean } = {};
    if (data.is_read !== undefined) patch.is_read = data.is_read;
    if (data.is_archived !== undefined) patch.is_archived = data.is_archived;

    if (data.markAllRead) {
      const { error } = await context.supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    if (!data.id) throw new Error("Nothing to update");
    const { error } = await context.supabase.from("notifications").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------- complaints ------------------------------ */

export const listComplaints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("complaints")
      .select("*")
      .is("deleted_at", null)
      .order("reported_on", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const complaints = rows ?? [];
    const resolved = complaints.filter((c) => c.resolved_at);
    const avgHours = resolved.length
      ? Math.round(
          resolved.reduce(
            (sum, c) =>
              sum +
              (new Date(c.resolved_at as string).getTime() - new Date(c.created_at).getTime()) /
                3_600_000,
            0,
          ) / resolved.length,
        )
      : 0;
    return {
      complaints,
      stats: {
        total: complaints.length,
        pending: complaints.filter((c) => c.status !== "resolved" && c.status !== "closed").length,
        resolved: resolved.length,
        avgResolutionHours: avgHours,
      },
    };
  });

export const saveComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        hostel_id: uuid.nullable().optional(),
        student_id: uuid.nullable().optional(),
        category: z.string().max(60).optional(),
        title: z.string().min(1).max(200),
        description: z.string().max(2000).nullable().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).optional(),
        resolution_notes: z.string().max(2000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    const patch = { ...fields } as typeof fields & { resolved_at?: string };
    if (fields.status === "resolved" || fields.status === "closed") {
      patch.resolved_at = new Date().toISOString();
    }
    if (id) {
      const { error } = await context.supabase.from("complaints").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("complaints")
      .insert({ ...patch, created_by: context.userId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* ------------------------------- maintenance ------------------------------ */

export const listMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("maintenance_requests")
      .select("*")
      .is("deleted_at", null)
      .order("reported_on", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const jobs = rows ?? [];
    return {
      jobs,
      stats: {
        open: jobs.filter((j) => j.status !== "completed" && j.status !== "cancelled").length,
        completed: jobs.filter((j) => j.status === "completed").length,
        cost: jobs.reduce((s, j) => s + Number(j.cost ?? 0), 0),
      },
    };
  });

export const saveMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        hostel_id: uuid.nullable().optional(),
        room_id: uuid.nullable().optional(),
        asset_id: uuid.nullable().optional(),
        request_type: z.string().max(60).optional(),
        title: z.string().min(1).max(200),
        description: z.string().max(2000).nullable().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z
          .enum(["reported", "scheduled", "in_progress", "completed", "cancelled"])
          .optional(),
        cost: z.number().nonnegative().nullable().optional(),
        completed_on: z.string().max(20).nullable().optional(),
        notes: z.string().max(1000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase
        .from("maintenance_requests")
        .update(fields)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("maintenance_requests")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* ---------------------------- emergency contacts -------------------------- */

export const listEmergencyContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("emergency_contacts")
      .select("*")
      .order("sort_order", { ascending: true })
      .limit(100);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { contacts: rows ?? [] };
  });

export const saveEmergencyContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        label: z.string().min(1).max(120),
        contact_type: z.string().max(40).optional(),
        phone: z.string().min(3).max(30),
        notes: z.string().max(400).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase
        .from("emergency_contacts")
        .update(fields)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("emergency_contacts")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/** Broadcast an emergency alert to wardens and admins of a branch. */
export const raiseEmergency = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        branch_id: uuid,
        title: z.string().min(1).max(200),
        message: z.string().max(1000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const roles = ["warden", "branch_admin", "trust_admin", "super_admin"] as const;
    const rows = roles.map((role) => ({
      branch_id: data.branch_id,
      recipient_role: role,
      category: "emergency",
      priority: "critical" as const,
      title: data.title,
      message: data.message ?? null,
      link: "/emergency",
      created_by: context.userId,
    }));
    const { error } = await context.supabase.from("notifications").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, notified: rows.length };
  });

/* --------------------------- occupancy analytics -------------------------- */

export const getOccupancyAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let bedsQ = supabase
      .from("beds")
      .select("id, status, room_id, hostel_id, rooms(room_number, floor_id), hostels(name)")
      .is("deleted_at", null)
      .limit(20000);
    let hostelsQ = supabase.from("hostels").select("id, name, capacity").is("deleted_at", null);
    if (data.branchId) {
      bedsQ = bedsQ.eq("branch_id", data.branchId);
      hostelsQ = hostelsQ.eq("branch_id", data.branchId);
    }
    const [{ data: beds, error }, { data: hostels }] = await Promise.all([bedsQ, hostelsQ]);
    if (error) throw new Error(error.message);

    const rows = beds ?? [];
    const totals = {
      hostels: (hostels ?? []).length,
      beds: rows.length,
      occupied: rows.filter((b) => b.status === "occupied").length,
      available: rows.filter((b) => b.status === "available").length,
      reserved: rows.filter((b) => b.status === "reserved").length,
      maintenance: rows.filter((b) => b.status === "maintenance").length,
    };

    const byHostelMap = new Map<string, { name: string; beds: number; occupied: number }>();
    const byRoomMap = new Map<string, { name: string; beds: number; occupied: number }>();
    for (const b of rows) {
      const hostelName = (b.hostels as { name?: string } | null)?.name ?? "Unassigned";
      const roomName = `${hostelName} · ${(b.rooms as { room_number?: string } | null)?.room_number ?? "?"}`;
      for (const [map, key] of [
        [byHostelMap, hostelName],
        [byRoomMap, roomName],
      ] as const) {
        const cur = map.get(key) ?? { name: key, beds: 0, occupied: 0 };
        cur.beds += 1;
        if (b.status === "occupied") cur.occupied += 1;
        map.set(key, cur);
      }
    }

    const shape = (m: Map<string, { name: string; beds: number; occupied: number }>) =>
      [...m.values()]
        .map((v) => ({ ...v, rate: v.beds ? Math.round((v.occupied / v.beds) * 100) : 0 }))
        .sort((a, b) => b.rate - a.rate);

    return {
      totals: {
        ...totals,
        rate: totals.beds ? Math.round((totals.occupied / totals.beds) * 100) : 0,
      },
      byHostel: shape(byHostelMap),
      byRoom: shape(byRoomMap).slice(0, 200),
    };
  });

/* ------------------------------ global search ----------------------------- */

export const globalSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.extend({ term: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data, context }) => {
    const term = data.term.trim();
    const like = `%${term}%`;
    const { supabase } = context;

    let studentsQ = supabase
      .from("students")
      .select("id, first_name, last_name, admission_number, phone, class_grade, status")
      .is("deleted_at", null)
      .or(
        `first_name.ilike.${like},last_name.ilike.${like},admission_number.ilike.${like},phone.ilike.${like}`,
      )
      .limit(20);
    let roomsQ = supabase
      .from("rooms")
      .select("id, room_number, hostel_id, hostels(name)")
      .is("deleted_at", null)
      .ilike("room_number", like)
      .limit(20);
    let bedsQ = supabase
      .from("beds")
      .select("id, bed_number, status, rooms(room_number), hostels(name)")
      .is("deleted_at", null)
      .ilike("bed_number", like)
      .limit(20);
    let guardiansQ = supabase
      .from("guardians")
      .select("id, full_name, phone")
      .is("deleted_at", null)
      .or(`full_name.ilike.${like},phone.ilike.${like}`)
      .limit(20);

    if (data.branchId) {
      studentsQ = studentsQ.eq("branch_id", data.branchId);
      roomsQ = roomsQ.eq("branch_id", data.branchId);
      bedsQ = bedsQ.eq("branch_id", data.branchId);
      guardiansQ = guardiansQ.eq("branch_id", data.branchId);
    }

    const [students, rooms, beds, guardians] = await Promise.all([
      studentsQ,
      roomsQ,
      bedsQ,
      guardiansQ,
    ]);

    return {
      students: students.data ?? [],
      rooms: rooms.data ?? [],
      beds: beds.data ?? [],
      guardians: guardians.data ?? [],
    };
  });

/* ------------------------------ warden metrics ---------------------------- */

export const getWardenDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const b = data.branchId;
    const today = new Date().toISOString().slice(0, 10);
    const scope = <T extends { eq: (c: string, v: string) => T }>(q: T) =>
      b ? q.eq("branch_id", b) : q;

    const [
      attendance,
      leaves,
      visitors,
      complaints,
      maintenance,
      inventory,
      beds,
      admissions,
      medical,
    ] = await Promise.all([
      scope(supabase.from("attendance").select("status").eq("attendance_date", today) as never),
      scope(supabase.from("leave_requests").select("status, from_date") as never),
      scope(supabase.from("visitors").select("status, entry_at").is("deleted_at", null) as never),
      scope(supabase.from("complaints").select("status").is("deleted_at", null) as never),
      scope(supabase.from("maintenance_requests").select("status").is("deleted_at", null) as never),
      scope(
        supabase
          .from("inventory_items")
          .select("name, quantity, min_quantity")
          .is("deleted_at", null) as never,
      ),
      scope(supabase.from("beds").select("status").is("deleted_at", null) as never),
      scope(
        supabase.from("admissions").select("status, created_at").is("deleted_at", null) as never,
      ),
      scope(
        supabase
          .from("medical_records")
          .select("is_critical, occurred_on")
          .is("deleted_at", null) as never,
      ),
    ]);

    const att = (attendance as { data: { status: string }[] | null }).data ?? [];
    const lv = (leaves as { data: { status: string }[] | null }).data ?? [];
    const vis = (visitors as { data: { status: string; entry_at: string }[] | null }).data ?? [];
    const cmp = (complaints as { data: { status: string }[] | null }).data ?? [];
    const mnt = (maintenance as { data: { status: string }[] | null }).data ?? [];
    const inv =
      (inventory as { data: { name: string; quantity: number; min_quantity: number }[] | null })
        .data ?? [];
    const bd = (beds as { data: { status: string }[] | null }).data ?? [];
    const adm =
      (admissions as { data: { status: string; created_at: string }[] | null }).data ?? [];
    const med =
      (medical as { data: { is_critical: boolean; occurred_on: string }[] | null }).data ?? [];

    const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

    return {
      presentToday: att.filter((a) => a.status === "present").length,
      absentToday: att.filter((a) => a.status === "absent").length,
      onLeaveToday: att.filter((a) => a.status === "leave").length,
      lateToday: att.filter((a) => a.status === "late").length,
      pendingLeave: lv.filter((l) => l.status === "pending").length,
      approvedLeave: lv.filter((l) => l.status === "approved").length,
      visitorsInside: vis.filter((v) => v.status === "checked_in").length,
      visitorsExpected: vis.filter((v) => v.status === "expected").length,
      openComplaints: cmp.filter((c) => c.status !== "resolved" && c.status !== "closed").length,
      pendingMaintenance: mnt.filter((m) => m.status !== "completed" && m.status !== "cancelled")
        .length,
      lowStock: inv.filter((i) => Number(i.quantity) <= Number(i.min_quantity)).length,
      occupiedBeds: bd.filter((x) => x.status === "occupied").length,
      availableBeds: bd.filter((x) => x.status === "available").length,
      maintenanceBeds: bd.filter((x) => x.status === "maintenance").length,
      newAdmissions: adm.filter((a) => a.created_at >= monthAgo).length,
      criticalMedical: med.filter((m) => m.is_critical).length,
    };
  });

/* ------------------------------ visitors ------------------------------- */

export const listVisitors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("visitors")
      .select("*")
      .is("deleted_at", null)
      .order("entry_at", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { visitors: rows ?? [] };
  });

export const checkoutVisitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("visitors")
      .update({ exit_at: new Date().toISOString(), status: "checked_out" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveVisitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        hostel_id: uuid.nullable().optional(),
        student_id: uuid.nullable().optional(),
        visitor_name: z.string().min(1).max(160),
        visitor_type: z
          .enum(["parent", "guardian", "guest", "vendor", "official", "other"])
          .optional(),
        phone: z.string().max(30).nullable().optional(),
        id_proof: z.string().max(100).nullable().optional(),
        purpose: z.string().max(300).nullable().optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("visitors").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("visitors")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* --------------------------- student gate passes --------------------------- */

export const listGatePasses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("student_gate_passes")
      .select("*, students(first_name, last_name, admission_number)")
      .is("deleted_at", null)
      .order("out_time", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { gatePasses: rows ?? [] };
  });

export const saveGatePass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid.optional(),
        student_id: uuid.optional(),
        hostel_id: uuid.nullable().optional(),
        room_id: uuid.nullable().optional(),
        bed_id: uuid.nullable().optional(),
        purpose: z.string().min(1).max(300).optional(),
        destination: z.string().max(300).nullable().optional(),
        out_time: dateStr.optional(),
        expected_return_time: dateStr.nullable().optional(),
        actual_return_time: dateStr.nullable().optional(),
        actual_exit_time: dateStr.nullable().optional(),
        parent_contact: z.string().max(100).nullable().optional(),
        emergency_contact: z.string().max(100).nullable().optional(),
        approved_at: dateStr.nullable().optional(),
        approved_by: uuid.nullable().optional(),
        security_id: uuid.nullable().optional(),
        status: z
          .enum(["pending", "approved", "out", "returned", "late_return", "rejected", "closed"])
          .optional(),
        remarks: z.string().max(600).nullable().optional(),
        qr_code: z.string().max(400).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: roleRows, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError) throw new Error(roleError.message);
    const roles = new Set<string>(roleRows?.map((row) => row.role) ?? []);
    const isApprover = ["super_admin", "trust_admin", "branch_admin", "warden"].some((role) => roles.has(role));
    const isSecurity = roles.has("security_guard") && !isApprover;
    const { id, ...rawFields } = data;
    const fields = Object.fromEntries(
      Object.entries(rawFields).filter(([, value]) => value !== undefined),
    ) as Database["public"]["Tables"]["student_gate_passes"]["Update"];
    if (id) {
      const { data: current, error: currentError } = await context.supabase
        .from("student_gate_passes")
        .select("status")
        .eq("id", id)
        .maybeSingle();
      if (currentError) throw new Error(currentError.message);
      if (!current) throw new Error("Gate pass not found");

      const nextStatus = typeof fields.status === "string" ? fields.status : current.status;
      const allowedTransitions: Record<string, string[]> = {
        pending: ["pending", "approved", "rejected"],
        approved: ["approved", "out", "rejected"],
        out: ["out", "returned", "late_return"],
        returned: ["returned", "closed"],
        late_return: ["late_return", "closed"],
        rejected: ["rejected", "pending"],
        closed: ["closed"],
      };
      if (!allowedTransitions[current.status]?.includes(nextStatus)) {
        throw new Error(`Cannot change a ${current.status} gate pass to ${nextStatus}`);
      }
      if (isSecurity && !["out", "returned", "late_return"].includes(nextStatus)) {
        throw new Error("Security Guard can only verify exit and return for an approved pass");
      }
      if (!isSecurity && !isApprover) throw new Error("You are not authorized to update gate passes");
      if (["approved", "rejected", "closed"].includes(nextStatus) && !isApprover) {
        throw new Error("Only an authorized warden or administrator can perform this action");
      }
      if (nextStatus === "approved") {
        fields.approved_by = context.userId;
        fields.approved_at = new Date().toISOString();
      }
      if (nextStatus === "out") {
        fields.actual_exit_time ??= new Date().toISOString();
        fields.security_id = context.userId;
      }
      if (nextStatus === "returned" || nextStatus === "late_return") {
        fields.actual_return_time ??= new Date().toISOString();
        fields.security_id = context.userId;
      }
      const { error } = await context.supabase
        .from("student_gate_passes")
        .update(fields)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    if (!data.branch_id || !data.student_id || !data.purpose || !data.out_time) {
      throw new Error("Student, purpose, branch and exit time are required");
    }
    if (!isApprover) throw new Error("Only hostel staff can create gate passes");
    const { data: row, error } = await context.supabase
      .from("student_gate_passes")
      .insert({
        ...fields,
        branch_id: data.branch_id,
        student_id: data.student_id,
        purpose: data.purpose,
        out_time: data.out_time,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* --------------------------- security dashboard --------------------------- */

export const getSecurityStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { supabase } = context;
    const b = data.branchId ?? null;

    const empty = {
      stats: {
        todayVisitors: 0,
        studentsOut: 0,
        studentsReturned: 0,
        lateReturns: 0,
        pendingApprovals: 0,
        unresolvedAlerts: 0,
        totalVisitors: 0,
        totalGatePasses: 0,
        activeVisitors: 0,
        checkedOutVisitors: 0,
        todayGatePasses: 0,
        approvedGatePasses: 0,
        rejectedGatePasses: 0,
      },
      visitors: [],
      gatePasses: [],
      logs: [],
    };

    if (!b) return empty;

    const [visitors, gatePasses, logs, visitorCount, passCount] = await Promise.all([
      supabase
        .from("visitors")
        .select("*")
        .is("deleted_at", null)
        .eq("branch_id", b)
        .order("entry_at", { ascending: false })
        .limit(100),
      supabase
        .from("student_gate_passes")
        .select("*")
        .is("deleted_at", null)
        .eq("branch_id", b)
        .order("out_time", { ascending: false })
        .limit(100),
      supabase
        .from("security_logs")
        .select("*")
        .eq("branch_id", b)
        .eq("resolved", false)
        .order("occurred_at", { ascending: false })
        .limit(50),
      supabase
        .from("visitors")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("branch_id", b),
      supabase
        .from("student_gate_passes")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("branch_id", b),
    ]);

    const failed = [visitors, gatePasses, logs, visitorCount, passCount].find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);

    const visitorRows = visitors.data ?? [];
    const passRows = gatePasses.data ?? [];
    const logRows = logs.data ?? [];

    const todayVisitorRows = visitorRows.filter((v) => v.entry_at && v.entry_at >= today);
    const todayPassRows = passRows.filter((p) => p.out_time && p.out_time >= today);

    const stats = {
      todayVisitors: todayVisitorRows.length,
      totalVisitors: visitorCount.count ?? 0,
      activeVisitors: visitorRows.filter((v) => v.status === "checked_in" && !v.exit_at).length,
      checkedOutVisitors: visitorRows.filter((v) => Boolean(v.exit_at)).length,
      studentsOut: passRows.filter((p) => p.status === "out").length,
      studentsReturned: passRows.filter((p) => p.status === "returned").length,
      lateReturns: passRows.filter((p) => p.status === "late_return").length,
      pendingApprovals: passRows.filter((p) => p.status === "pending").length,
      unresolvedAlerts: logRows.length,
      totalGatePasses: passCount.count ?? 0,
      todayGatePasses: todayPassRows.length,
      approvedGatePasses: passRows.filter((p) => p.status === "approved").length,
      rejectedGatePasses: passRows.filter((p) => p.status === "rejected").length,
    };

    return { stats, visitors: todayVisitorRows, gatePasses: todayPassRows, logs: logRows };
  });
