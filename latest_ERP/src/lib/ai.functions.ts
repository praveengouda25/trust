import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * AI features for donation insights, expense analysis, inventory restock
 * prediction and an operations assistant.
 */

const branchScope = z.object({ branchId: z.string().uuid().nullable().optional() });
const uuid = z.string().uuid();

async function ask(system: string, prompt: string, supabase: any, branchId?: string | null) {
  const settings = await loadAISettings(supabase, branchId);
  if (!settings?.ai_enabled) return null;

  // Provider keys are server-only environment variables. Database settings
  // contain feature flags, never credentials returned to the client.
  const openAiKey = process.env.OPENAI_API_KEY;
  const provider = settings.ai_provider ?? "openai";
  const { createOpenAICompatible } = await import("@ai-sdk/openai-compatible");
  const gateway =
    provider === "openai" && openAiKey
      ? createOpenAICompatible({
          name: "openai",
          baseURL: "https://api.openai.com/v1",
          headers: { Authorization: `Bearer ${openAiKey}` },
        })
      : null;
  if (!gateway) return null;
  try {
    const { text } = await generateText({
      model: gateway(
        process.env.AI_MODEL || "gpt-4o-mini",
      ),
      system,
      prompt,
    });
    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("429"))
      throw new Error("AI is busy right now — please retry in a moment.");
    if (message.includes("402")) throw new Error("AI credits are exhausted for this workspace.");
    throw new Error(message);
  }
}

async function loadAISettings(supabase: any, branchId?: string | null) {
  const fields = "ai_enabled, ai_provider, branch_id, trust_id";
  if (branchId) {
    const branch = await supabase
      .from("ai_settings")
      .select(fields)
      .eq("branch_id", branchId)
      .maybeSingle();
    if (branch.data || branch.error) return branch.data;
  }
  const trust = await supabase
    .from("ai_settings")
    .select(fields)
    .is("branch_id", null)
    .order("created_at", { ascending: false })
    .limit(1);
  return trust.data?.[0] ?? null;
}

const ANALYST = [
  "You are the analytics assistant inside an NGO hostel management platform.",
  "Answer in short markdown: 3-5 bullet points, then a single bold 'Recommendation:' line.",
  "Use Indian Rupee formatting. Be concrete and reference the numbers given. Never invent data.",
].join(" ");

/* --------------------------- donation insights --------------------------- */

export const getDonationInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("donations")
      .select("donor_name, amount, purpose, mode, donated_on")
      .is("deleted_at", null)
      .order("donated_on", { ascending: false })
      .limit(400);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    if (!rows?.length)
      return { text: "No donations recorded yet — add a few gifts and insights appear here." };

    const text = await ask(
      ANALYST,
      `Analyse these donation records (JSON). Cover donor retention and repeat giving, seasonality by month, best-performing purposes and payment modes, and suggested follow-ups.\n\n${JSON.stringify(rows)}`,
      context.supabase,
      data.branchId,
    );

    if (!text) {
      return { text: "AI service is not configured. Contact Super Admin to enable AI insights." };
    }

    return { text };
  });

/* --------------------------- expense analysis ---------------------------- */

export const getExpenseAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("expenses")
      .select("category, amount, vendor, mode, spent_on, description")
      .is("deleted_at", null)
      .order("spent_on", { ascending: false })
      .limit(400);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    if (!rows?.length)
      return { text: "No expenses recorded yet — add spending records to get analysis." };

    const text = await ask(
      ANALYST,
      `Analyse these hostel expense records (JSON). Highlight the biggest categories, month-on-month movement, unusual or duplicate-looking spends, vendor concentration, and where money could be saved.\n\n${JSON.stringify(rows)}`,
      context.supabase,
      data.branchId,
    );

    if (!text) {
      return { text: "AI service is not configured. Contact Super Admin to enable AI insights." };
    }

    return { text };
  });

/* -------------------------- inventory prediction -------------------------- */

export const getInventoryPrediction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let items = context.supabase
      .from("inventory_items")
      .select("id, name, category, unit, quantity, min_quantity")
      .is("deleted_at", null);
    let txns = context.supabase
      .from("inventory_transactions")
      .select("item_id, txn_type, quantity, occurred_on")
      .order("occurred_on", { ascending: false })
      .limit(500);
    if (data.branchId) {
      items = items.eq("branch_id", data.branchId);
      txns = txns.eq("branch_id", data.branchId);
    }
    const [{ data: itemRows }, { data: txnRows }] = await Promise.all([items, txns]);
    if (!itemRows?.length)
      return { text: "No inventory items yet — add stock to get restock predictions." };

    const text = await ask(
      ANALYST,
      `Given hostel inventory items and their stock movements (JSON), estimate the consumption rate per item, predict which items run out first and roughly when, and suggest order quantities. Flag anything already below its minimum.\n\nITEMS: ${JSON.stringify(itemRows)}\n\nMOVEMENTS: ${JSON.stringify(txnRows ?? [])}`,
      context.supabase,
      data.branchId,
    );

    if (!text) {
      return { text: "AI service is not configured. Contact Super Admin to enable AI insights." };
    }

    return { text };
  });

/* ------------------------------- assistant -------------------------------- */

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    branchScope
      .extend({
        messages: z
          .array(
            z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }),
          )
          .min(1)
          .max(30),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const b = data.branchId;
    const scope = <T extends { eq: (c: string, v: string) => T }>(q: T) =>
      b ? q.eq("branch_id", b) : q;

    const [students, hostels, donations, expenses, issues, inventory, leaves] = await Promise.all([
      scope(
        supabase
          .from("students")
          .select("status", { count: "exact", head: true })
          .is("deleted_at", null) as never,
      ),
      scope(
        supabase.from("hostels").select("name, capacity, type").is("deleted_at", null) as never,
      ),
      scope(
        supabase
          .from("donations")
          .select("donor_name, amount, donated_on, purpose")
          .is("deleted_at", null)
          .order("donated_on", { ascending: false })
          .limit(50) as never,
      ),
      scope(
        supabase
          .from("expenses")
          .select("category, amount, spent_on")
          .is("deleted_at", null)
          .order("spent_on", { ascending: false })
          .limit(50) as never,
      ),
      scope(
        supabase
          .from("issues")
          .select("title, priority, status, reported_on")
          .is("deleted_at", null)
          .limit(50) as never,
      ),
      scope(
        supabase
          .from("inventory_items")
          .select("name, quantity, unit, min_quantity")
          .is("deleted_at", null)
          .limit(80) as never,
      ),
      scope(
        supabase.from("leave_requests").select("from_date, to_date, status").limit(50) as never,
      ),
    ]);

    const snapshot = {
      studentCount: (students as { count: number | null }).count ?? 0,
      hostels: (hostels as { data: unknown }).data ?? [],
      recentDonations: (donations as { data: unknown }).data ?? [],
      recentExpenses: (expenses as { data: unknown }).data ?? [],
      issues: (issues as { data: unknown }).data ?? [],
      inventory: (inventory as { data: unknown }).data ?? [],
      leaves: (leaves as { data: unknown }).data ?? [],
    };

    const history = data.messages
      .map((m) => `${m.role === "user" ? "Staff" : "Assistant"}: ${m.content}`)
      .join("\n");

    const text = await ask(
      [
        "You are the VISTARX Hostel360 operations assistant for an NGO hostel trust.",
        "Answer using ONLY the live branch snapshot provided. If the snapshot cannot answer, say so plainly.",
        "Be concise, use markdown, and format money in Indian Rupees.",
      ].join(" "),
      `LIVE BRANCH SNAPSHOT (JSON):\n${JSON.stringify(snapshot)}\n\nCONVERSATION:\n${history}\n\nAssistant:`,
      context.supabase,
      b,
    );

    if (!text) {
      return { text: "AI service is not configured. Contact Super Admin to enable AI insights." };
    }

    return { text };
  });

/* --------------------------- AI Settings --------------------------- */

export const getAISettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const fields =
      "id, trust_id, branch_id, ai_enabled, ai_provider, ai_widgets_enabled, dashboard_insights_enabled, attendance_prediction_enabled, inventory_prediction_enabled, donation_prediction_enabled, maintenance_prediction_enabled";
    let q = context.supabase
      .from("ai_settings")
      .select(fields)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    let { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    if ((!rows || rows.length === 0) && data.branchId) {
      const fallback = await context.supabase
        .from("ai_settings")
        .select(fields)
        .is("branch_id", null)
        .order("created_at", { ascending: false })
        .limit(1);
      rows = fallback.data;
      error = fallback.error;
      if (error) throw new Error(error.message);
    }
    const settings = rows?.[0] || {
      ai_enabled: false,
      ai_provider: "openai",
      ai_widgets_enabled: false,
      dashboard_insights_enabled: false,
      attendance_prediction_enabled: false,
      inventory_prediction_enabled: false,
      donation_prediction_enabled: false,
      maintenance_prediction_enabled: false,
    };
    return { settings };
  });

export const saveAISettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        branch_id: uuid.nullable().optional(),
        trust_id: uuid.nullable().optional(),
        ai_enabled: z.boolean().optional(),
        ai_provider: z.string().optional(),
        ai_widgets_enabled: z.boolean().optional(),
        dashboard_insights_enabled: z.boolean().optional(),
        attendance_prediction_enabled: z.boolean().optional(),
        inventory_prediction_enabled: z.boolean().optional(),
        donation_prediction_enabled: z.boolean().optional(),
        maintenance_prediction_enabled: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { branch_id, trust_id, ...fields } = data;

    // Check if settings already exist
    const { data: existing } = await context.supabase
      .from("ai_settings")
      .select("id")
      .or(branch_id ? `branch_id.eq.${branch_id}` : `trust_id.eq.${trust_id}`)
      .maybeSingle();

    if (existing) {
      const { error } = await context.supabase
        .from("ai_settings")
        .update({ ...fields })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { data: row, error } = await context.supabase
      .from("ai_settings")
      .insert({ ...fields, branch_id, trust_id, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true };
  });
