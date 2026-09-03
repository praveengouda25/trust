import { PLATFORM } from "@/lib/branding";
import { QrTag, recordUrl } from "@/components/data/qr";
import { useSignedPhoto } from "@/components/data/photo-field";

export type IdCardStudent = {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string | null;
  class_grade: string | null;
  blood_group: string | null;
  phone: string | null;
  photo_url: string | null;
};

/** Printable CR80-style student identity card with a scannable QR. */
export function StudentIdCard({
  student,
  branchName,
}: {
  student: IdCardStudent;
  branchName?: string | null;
}) {
  const photo = useSignedPhoto(student.photo_url);
  const name = `${student.first_name} ${student.last_name ?? ""}`.trim();

  return (
    <div className="id-card flex w-[340px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-primary px-4 py-2 text-primary-foreground">
        <p className="text-[11px] font-semibold uppercase tracking-widest">{PLATFORM.name}</p>
        <p className="truncate text-[10px] opacity-80">{branchName ?? "Student identity card"}</p>
      </div>

      <div className="flex gap-3 p-4">
        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          {photo ? (
            <img src={photo} alt={`${name} photo`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1 text-xs">
          <p className="truncate text-sm font-semibold leading-tight">{name}</p>
          <Row label="Adm no" value={student.admission_number} />
          <Row label="Class" value={student.class_grade ?? "—"} />
          <Row label="Blood" value={student.blood_group ?? "—"} />
          <Row label="Phone" value={student.phone ?? "—"} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        <QrTag value={recordUrl(`/students/${student.id}`)} size={64} />
        <p className="text-[10px] leading-snug text-muted-foreground">
          Scan to open this student record. If found, please return to the hostel office.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex gap-2">
      <span className="w-14 shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </p>
  );
}
