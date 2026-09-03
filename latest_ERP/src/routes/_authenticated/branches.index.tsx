import type { FieldSpec } from "@/components/data/record-dialog";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  MapPin,
  Phone,
  Mail,
  Building2,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/data/states";
import { RecordTable, StatusBadge } from "@/components/data/record-table";
import { RecordDialog, clean, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import { saveBranch } from "@/lib/foundation.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const BRANCH_TYPES = [
  { value: "main_campus", label: "Main Campus" },
  { value: "branch_campus", label: "Branch Campus" },
  { value: "trust_hostel", label: "Trust Hostel" },
  { value: "boys_hostel", label: "Boys Hostel" },
  { value: "girls_hostel", label: "Girls Hostel" },
  { value: "residential_school", label: "Residential School" },
  { value: "other", label: "Other" },
];

const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "Other"];

type BranchRow = {
  id: string;
  trust_id: string;
  name: string;
  code: string;
  branch_type: string | null;
  city: string | null;
  state: string | null;
  district: string | null;
  country: string | null;
  contact_phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  registration_number?: string | null;
  gst_number?: string | null;
  phone_country_code?: string | null;
  alternate_contact?: string | null;
  website?: string | null;
  taluk?: string | null;
  village?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
};

export const Route = createFileRoute("/_authenticated/branches/")({
  head: () => ({
    meta: [
      { title: "Branch Management | VISTARX Hostel360" },
      { name: "description", content: "Manage branches, campuses and hostels across your trust." },
      { property: "og:title", content: "Branch Management | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Manage branches, campuses and hostels across your trust.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BranchesPage,
});

const FIELDS: FieldSpec[] = [
  { name: "name", label: "Branch Name", type: "text" as const, required: true },
  { name: "code", label: "Branch Code", type: "text" as const, required: true },
  {
    name: "branch_type",
    label: "Branch Type",
    type: "select" as const,
    options: BRANCH_TYPES,
  },
  { name: "registration_number", label: "Registration Number", type: "text" as const },
  { name: "gst_number", label: "GST Number (Optional)", type: "text" as const },
  { name: "email", label: "Email", type: "email" as const },
  {
    name: "phone_country_code",
    label: "Country Code",
    type: "select" as const,
    options: [
      { value: "+91", label: "+91 (India)" },
      { value: "+1", label: "+1 (USA)" },
      { value: "+44", label: "+44 (UK)" },
      { value: "+971", label: "+971 (UAE)" },
    ],
  },
  { name: "contact_phone", label: "Phone Number", type: "tel" as const },
  { name: "alternate_contact", label: "Alternate Contact", type: "tel" as const },
  { name: "website", label: "Website", type: "url" as const },
  {
    name: "country",
    label: "Country",
    type: "select" as const,
    options: COUNTRIES.map((c) => ({ value: c, label: c })),
  },
  { name: "state", label: "State", type: "text" as const },
  { name: "district", label: "District", type: "text" as const },
  { name: "city", label: "City", type: "text" as const },
  { name: "taluk", label: "Taluk", type: "text" as const },
  { name: "village", label: "Village", type: "text" as const },
  { name: "pincode", label: "Pincode", type: "text" as const },
  { name: "address", label: "Address", type: "textarea" as const },
  { name: "latitude", label: "Latitude", type: "number" as const },
  { name: "longitude", label: "Longitude", type: "number" as const },
  { name: "description", label: "Description", type: "textarea" as const },
  {
    name: "is_active",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];

function BranchesPage() {
  const { session, branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BranchRow | null>(null);
  const [search, setSearch] = useState("");

  const save = useServerFn(saveBranch);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const branches = session.branches || [];
      // Get additional branch details from database
      return { branches: branches as BranchRow[] };
    },
  });

  const saveMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          id: editing?.id,
          trust_id: session.trusts[0]?.id || "",
          name: v.name,
          code: v.code,
          branch_type: v.branch_type || null,
          registration_number: v.registration_number || null,
          gst_number: v.gst_number || null,
          email: v.email || null,
          phone_country_code: v.phone_country_code || "+91",
          contact_phone: v.contact_phone || null,
          alternate_contact: v.alternate_contact || null,
          website: v.website || null,
          country: v.country || "India",
          state: v.state || null,
          district: v.district || null,
          city: v.city || null,
          taluk: v.taluk || null,
          village: v.village || null,
          pincode: v.pincode || null,
          address: v.address || null,
          latitude: v.latitude ? Number(v.latitude) : null,
          longitude: v.longitude ? Number(v.longitude) : null,
          description: v.description || null,
          is_active: v.is_active === "true" ? true : v.is_active === "false" ? false : true,
        }),
      }),
    onSuccess: () => {
      toast.success(editing ? "Branch updated" : "Branch created");
      setOpen(false);
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["session-context"] });
      void qc.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const q = search.trim().toLowerCase();
  const rows = ((data?.branches ?? []) as BranchRow[]).filter(
    (b) =>
      !q ||
      `${b.name} ${b.code} ${b.city ?? ""} ${b.state ?? ""} ${b.branch_type ?? ""}`
        .toLowerCase()
        .includes(q),
  );

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: BranchRow) {
    setEditing(row);
    setOpen(true);
  }

  const initial: FormValues = editing
    ? Object.fromEntries(
        Object.entries({
          name: editing.name,
          code: editing.code,
          branch_type: editing.branch_type,
          registration_number: editing.registration_number,
          gst_number: editing.gst_number,
          email: editing.email,
          phone_country_code: editing.phone_country_code,
          contact_phone: editing.contact_phone,
          alternate_contact: editing.alternate_contact,
          website: editing.website,
          country: editing.country,
          state: editing.state,
          district: editing.district,
          city: editing.city,
          taluk: editing.taluk,
          village: editing.village,
          pincode: editing.pincode,
          address: editing.address,
          latitude: editing.latitude,
          longitude: editing.longitude,
          description: editing.description,
          is_active: editing.is_active ? "true" : "false",
        }).map(([k, v]) => [k, v == null ? "" : String(v)]),
      )
    : {
        branch_type: "main_campus",
        country: "India",
        phone_country_code: "+91",
        is_active: "true",
      };

  return (
    <>
      <PageHeader
        title="Branch Management"
        description="Manage branches, campuses and hostels across your trust."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New Branch
          </Button>
        }
      />

      <RecordDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
        title={editing ? "Edit Branch" : "Create Branch"}
        description="Branch information is used to organize hostels, students and operations."
        fields={FIELDS}
        initial={initial}
        submitLabel={editing ? "Update Branch" : "Create Branch"}
        pending={saveMut.isPending}
        onSubmit={(v) => saveMut.mutate(v)}
      />

      <Input
        placeholder="Search by name, code, city or type…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && (
        <EmptyState
          title="No branches found"
          description="Create your first branch to start managing hostels and students."
        />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          columns={[
            {
              key: "code",
              header: "Code",
              className: "font-mono text-xs",
              cell: (r) => r.code,
            },
            {
              key: "name",
              header: "Branch Name",
              cell: (r) => r.name,
            },
            {
              key: "type",
              header: "Type",
              cell: (r) => {
                const type = BRANCH_TYPES.find((t) => t.value === r.branch_type);
                return type ? type.label : r.branch_type || "—";
              },
            },
            {
              key: "location",
              header: "Location",
              cell: (r) => (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {r.city ? `${r.city}, ${r.state || ""}`.trim() : "—"}
                </div>
              ),
            },
            {
              key: "contact",
              header: "Contact",
              cell: (r) => (
                <div className="space-y-1">
                  {r.contact_phone && (
                    <div className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3" />
                      {r.contact_phone}
                    </div>
                  )}
                  {r.email && (
                    <div className="flex items-center gap-1 text-xs">
                      <Mail className="h-3 w-3" />
                      {r.email}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (r) => <StatusBadge value={r.is_active ? "active" : "inactive"} />,
            },
            {
              key: "created",
              header: "Created",
              cell: (r) => new Date(r.created_at).toLocaleDateString(),
            },
            {
              key: "edit",
              header: "",
              className: "text-right",
              cell: (r) => (
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
